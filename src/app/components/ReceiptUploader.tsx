"use client";

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { processReceiptImage, createReceiptFromOCR } from '../utils/ocrUtils';
import useReceiptStore from '../store/receiptStore';
import useSessionStore from '../store/sessionStore';
import { receiptService } from '../services/api';

interface ReceiptUploaderProps {
  sessionId: string;
  onReceiptUploaded?: () => void; // Callback for when a receipt is successfully uploaded
}

export default function ReceiptUploader({ sessionId, onReceiptUploaded }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { saveReceipt, setIsProcessing, setError, isProcessing } = useReceiptStore();
  const { currentSession } = useSessionStore();

  // Reset preview when component mounts (on page refresh)
  useEffect(() => {
    setPreview(null);
  }, []);

  // Clean up object URLs when preview changes or component unmounts
  useEffect(() => {
    // Return cleanup function
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Process the image
    try {
      setIsProcessing(true);
      setError(null);
      
      const { text, items } = await processReceiptImage(file);
      // Don't pass imageUrl to createReceiptFromOCR to avoid storing it in the database
      const receipt = createReceiptFromOCR(text, items);
      
      // Add sessionId to the receipt data
      await saveReceipt({
        ...receipt,
        sessionId
      });
      
      // Refresh the receipt data to ensure payers are properly loaded
      // This is necessary because the server assigns all people as payers
      const currentReceipt = useReceiptStore.getState().receipt;
      if (currentReceipt && currentReceipt.id) {
        const refreshedReceipt = await receiptService.getReceipt(currentReceipt.id);
        useReceiptStore.getState().setReceipt(refreshedReceipt);
        
        // Call the callback if provided to notify that a receipt was uploaded
        if (onReceiptUploaded) {
          onReceiptUploaded();
        }
      }
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing receipt:', error);
      setError('Failed to process receipt. Please try again.');
      setIsProcessing(false);
    }
  }, [saveReceipt, setIsProcessing, setError, sessionId, onReceiptUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Receipt count indicator */}
      {currentSession && currentSession.receipts && (
        <div className="mb-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {currentSession.receipts.length} {currentSession.receipts.length === 1 ? 'Receipt' : 'Receipts'} Uploaded
          </span>
        </div>
      )}
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full h-64 mb-4">
            <Image 
              src={preview} 
              alt="Receipt preview" 
              fill 
              className="object-contain rounded-md" 
            />
          </div>
        ) : (
          <div className="py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        )}
        
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {isProcessing ? 'Processing receipt...' : 'Drag & drop a receipt image, or click to select'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Supported formats: JPEG, PNG, GIF, BMP
        </p>
      </div>
    </div>
  );
}
