"use client";

import { useState } from 'react';
import { UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import useReceiptStore from '../store/receiptStore';

export default function PeopleManager() {
  const { people, addPerson, removePerson } = useReceiptStore();
  const [newPersonName, setNewPersonName] = useState('');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      addPerson(newPersonName.trim());
      setNewPersonName('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">People Splitting the Bill</h2>
      
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
                onClick={() => removePerson(person.id)}
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
