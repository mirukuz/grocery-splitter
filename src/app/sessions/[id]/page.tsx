"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSessionStore from '../../store/sessionStore';
import useReceiptStore from '../../store/receiptStore';
import { receiptService } from '../../services/api';
import ReceiptUploader from '../../components/ReceiptUploader';
import ReceiptItemsList from '../../components/ReceiptItemsList';
import PeopleManager from '../../components/PeopleManager';
import AddItemForm from '../../components/AddItemForm';
import BillSummary from '../../components/BillSummary';

export default function SessionDetail() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const { currentSession, fetchSession, error: sessionError } = useSessionStore();
  const { receipt, error: receiptError, reset, setReceipt, setError, fetchPeople } = useReceiptStore();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'items' | 'people' | 'summary'>('upload');

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
      fetchPeople(); // Fetch people when the session page loads
    }
  }, [sessionId, fetchSession, fetchPeople]);
  
  // Fetch people data again when switching to the Summary tab
  useEffect(() => {
    if (activeTab === 'summary') {
      fetchPeople();
    }
  }, [activeTab, fetchPeople]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? All data will be lost.')) {
      reset();
      setActiveTab('upload');
    }
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <button 
              onClick={() => router.push('/sessions')}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 flex items-center"
            >
              ← Back to Sessions
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">🧾</span> {currentSession.title}
            </h1>
          </div>
          {receipt && (
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Reset Current Receipt
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {(sessionError || receiptError) && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-800 dark:text-red-200">{sessionError || receiptError}</p>
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
                  <ReceiptUploader sessionId={sessionId} />
                  {/* We no longer display the receipt image and extracted text here */}
                </div>
              )}

              {activeTab === 'items' && (
                <div>
                  <AddItemForm />
                  <ReceiptItemsList />
                </div>
              )}

              {activeTab === 'people' && <PeopleManager sessionId={sessionId} />}
              
              {activeTab === 'summary' && <BillSummary />}
            </div>
          </>
        ) : (
          <div className="py-12">
            {currentSession.receipts && currentSession.receipts.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Receipts</h2>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add Another Receipt
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentSession.receipts.map((receipt) => (
                    <div key={receipt.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-2">Receipt {receipt.date || 'No date'}</h3>
                      {receipt.total && <p className="text-gray-700 dark:text-gray-300">Total: ${receipt.total.toFixed(2)}</p>}
                      <button
                        onClick={() => {
                          // Fetch the receipt details and set it as the current receipt
                          receiptService.getReceipt(receipt.id)
                            .then(fetchedReceipt => {
                              setReceipt(fetchedReceipt);
                              setActiveTab('items');
                            })
                            .catch(error => {
                              console.error('Error fetching receipt:', error);
                              setError('Failed to fetch receipt details');
                            });
                        }}
                        className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Session Summary</h3>
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-medium">Total Receipts:</span> {currentSession.receipts.length}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-medium">Total Amount:</span> $
                      {currentSession.receipts
                        .reduce((sum, receipt) => sum + (receipt.total || 0), 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Participants:</span> {currentSession.participants.length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload a Receipt</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  Upload or scan a receipt to get started. We&apos;ll extract the items and help you split the bill with your friends.
                </p>
                <ReceiptUploader sessionId={sessionId} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
