"use client";

import { useState, useEffect } from 'react';
import { UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import useReceiptStore from '../store/receiptStore';
import useSessionStore from '../store/sessionStore';

interface PeopleManagerProps {
  sessionId: string;
}

export default function PeopleManager({ sessionId }: PeopleManagerProps) {
  const { people, addPerson, removePerson, receipt, assignPayerToItem } = useReceiptStore();
  const { currentSession, updateSession } = useSessionStore();
  const [newPersonName, setNewPersonName] = useState('');
  
  // Initialize people from the current session when it loads
  useEffect(() => {
    if (currentSession?.participants) {
      // TODO: Sync session participants with receipt store people
    }
  }, [currentSession]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      try {
        const personName = newPersonName.trim();
        setNewPersonName('');
        
        // Add to local receipt store
        await addPerson(personName);
        
        // Get the updated people list
        const updatedPeople = useReceiptStore.getState().people;
        const newPerson = updatedPeople.find(p => p.name === personName);
        
        // Add to session if we have a sessionId and found the new person
        if (sessionId && currentSession && newPerson) {
          const updatedParticipantIds = [...(currentSession.participants || []).map(p => p.id), newPerson.id];
          await updateSession(sessionId, { participantIds: updatedParticipantIds });
          
          // Automatically assign the new person to all receipt items
          if (receipt && receipt.items && receipt.items.length > 0) {
            for (const item of receipt.items) {
              await assignPayerToItem(item.id, newPerson.id);
            }
          }
        }
      } catch (error) {
        console.error('Error adding person:', error);
      }
    }
  };

  // Function to automatically assign all people to all items (split bill evenly)
  const handleSplitEvenly = async () => {
    if (!receipt || !receipt.items || receipt.items.length === 0 || people.length === 0) {
      return;
    }
    
    try {
      // For each item in the receipt, assign all people as payers
      for (const item of receipt.items) {
        for (const person of people) {
          // Only add if not already a payer
          if (!item.payers.includes(person.id)) {
            await assignPayerToItem(item.id, person.id);
          }
        }
      }
    } catch (error) {
      console.error('Error splitting bill evenly:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">People Splitting the Bill</h2>
        {receipt && receipt.items && receipt.items.length > 0 && people.length > 0 && (
          <button
            onClick={handleSplitEvenly}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Split Evenly
          </button>
        )}
      </div>
      
      <form onSubmit={handleAddPerson} className="flex mb-4">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Enter name"
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <UserPlusIcon className="h-5 w-5" />
        </button>
      </form>

      {people.length > 0 ? (
        <ul className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {people.map((person) => (
            <li key={person.id} className="flex justify-between items-center p-4">
              <span className="text-gray-900 dark:text-white">{person.name}</span>
              <button
                onClick={async () => {
                  removePerson(person.id);
                  
                  // Remove from session if we have a sessionId
                  if (sessionId && currentSession) {
                    const updatedParticipantIds = currentSession.participants
                      .filter(p => p.id !== person.id)
                      .map(p => p.id);
                    await updateSession(sessionId, { participantIds: updatedParticipantIds });
                  }
                }}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Add people to split the bill with</p>
        </div>
      )}
    </div>
  );
}
