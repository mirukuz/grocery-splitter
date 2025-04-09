"use client";

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import useReceiptStore from '../store/receiptStore';

export default function AddItemForm() {
  const { addItem } = useReceiptStore();
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(itemPrice);
    if (!itemName.trim() || isNaN(price)) return;
    
    addItem({
      id: crypto.randomUUID(),
      name: itemName.trim(),
      price,
      notes: itemNotes.trim(),
      payers: []
    });
    
    // Reset form
    setItemName('');
    setItemPrice('');
    setItemNotes('');
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Add Item Manually</h2>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Name
            </label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter item name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">$</span>
              </div>
              <input
                id="itemPrice"
                type="number"
                step="0.01"
                min="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="itemNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <input
              id="itemNotes"
              type="text"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add notes"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
}
