"use client";

import { useState } from 'react';
import Image from 'next/image';
import useReceiptStore from './store/receiptStore';
import ReceiptUploader from './components/ReceiptUploader';
import ReceiptItemsList from './components/ReceiptItemsList';
import PeopleManager from './components/PeopleManager';
import AddItemForm from './components/AddItemForm';
import BillSummary from './components/BillSummary';

export default function Home() {
  const { receipt, error, reset } = useReceiptStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'items' | 'people' | 'summary'>('upload');

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? All data will be lost.')) {
      reset();
      setActiveTab('upload');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🧾</span> Receipt Splitter
          </h1>
          {receipt && (
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {receipt ? (
          <>
            <div className="mb-6">
              <nav className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'upload' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  Receipt
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'items' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  Items
                </button>
                <button
                  onClick={() => setActiveTab('people')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'people' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  People
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-4 px-6 font-medium text-sm ${activeTab === 'summary' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  Summary
                </button>
              </nav>
            </div>

            <div className="px-4 sm:px-0">
              {activeTab === 'upload' && (
                <div>
                  <ReceiptUploader />
                  {receipt.imageUrl && (
                    <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">Receipt Image</h2>
                      <div className="relative w-full h-96">
                        <Image 
                          src={receipt.imageUrl} 
                          alt="Receipt" 
                          fill 
                          className="object-contain rounded-md" 
                        />
                      </div>
                      {receipt.rawText && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Extracted Text</h3>
                          <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
                            {receipt.rawText}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'items' && (
                <div>
                  <AddItemForm />
                  <ReceiptItemsList />
                </div>
              )}

              {activeTab === 'people' && <PeopleManager />}
              
              {activeTab === 'summary' && <BillSummary />}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload a Receipt</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Upload or scan a receipt to get started. We&apos;ll extract the items and help you split the bill with your friends.
            </p>
            <ReceiptUploader />
          </div>
        )}
      </main>
    </div>
  );
}
