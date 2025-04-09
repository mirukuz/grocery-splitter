"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { processReceiptImage, createReceiptFromOCR } from '../utils/ocrUtils';
import useReceiptStore from '../store/receiptStore';

export default function ReceiptUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const { setReceipt, setIsProcessing, setError, isProcessing } = useReceiptStore();

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
      const receipt = createReceiptFromOCR(text, items, objectUrl);
      
      setReceipt(receipt);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing receipt:', error);
      setError('Failed to process receipt. Please try again.');
      setIsProcessing(false);
    }
  }, [setReceipt, setIsProcessing, setError]);

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
