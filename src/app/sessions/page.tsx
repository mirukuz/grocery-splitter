"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSessionStore from '../store/sessionStore';

export default function SessionsPage() {
  const router = useRouter();
  const { sessions, fetchSessions, createSession, deleteSession, isLoading, error } = useSessionStore();
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;

    try {
      const newSession = await createSession(newSessionTitle);
      setNewSessionTitle('');
      setIsCreating(false);
      router.push(`/sessions/${newSession.id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      await deleteSession(id);
    }
  };

  const calculateTotal = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.receipts) return 0;
    
    return session.receipts.reduce((total, receipt) => {
      // Sum up all item prices in the receipt instead of using receipt.total
      if (!receipt || !receipt.items) return total;
      
      const receiptTotal = receipt.items.reduce((itemsTotal, item) => {
        return itemsTotal + (item.price || 0);
      }, 0);
      
      return total + receiptTotal;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🧾</span> Receipt Splitter
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Sessions</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
          >
            New Session
          </button>
        </div>

        {isCreating && (
          <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Create New Session</h3>
            <form onSubmit={handleCreateSession}>
              <div className="mb-4">
                <label htmlFor="sessionTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  id="sessionTitle"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="e.g., Dinner with Friends"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Sessions Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first session to start splitting bills with friends.
            </p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Create Your First Session
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{session.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Created: {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        People: {session.participants.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${calculateTotal(session.id).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <button
                      onClick={() => router.push(`/sessions/${session.id}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium py-2 px-4 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
