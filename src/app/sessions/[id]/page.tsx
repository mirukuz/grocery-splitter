"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSessionStore from '../../store/sessionStore';
import useReceiptStore from '../../store/receiptStore';
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
  const { receipt, error: receiptError, reset, fetchPeople, fetchReceiptForSession } = useReceiptStore();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'items' | 'people' | 'summary'>('upload');

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
      fetchPeople(); // Fetch people when the session page loads
      fetchReceiptForSession(sessionId); // Load the latest receipt for this session
    }
  }, [sessionId, fetchSession, fetchPeople, fetchReceiptForSession]);
  
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
                <ReceiptUploader 
                  sessionId={sessionId} 
                  onReceiptUploaded={() => setActiveTab('items')} // Automatically switch to items tab after upload
                />
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
      </main>
    </div>
  );
}
