"use client";

import { useState } from 'react';
import { TrashIcon, PencilIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import useReceiptStore from '../store/receiptStore';
import { ReceiptItem } from '../types';

export default function ReceiptItemsList() {
  const { receipt, people, updateItem, removeItem, assignPayerToItem, removePayerFromItem } = useReceiptStore();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemNote, setNewItemNote] = useState('');

  if (!receipt || !receipt.items || receipt.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No items found in the receipt</p>
      </div>
    );
  }

  const handleEditItem = (item: ReceiptItem) => {
    setEditingItemId(item.id);
    setNewItemName(item.name);
    setNewItemPrice(item.price.toString());
    setNewItemNote(item.notes);
  };

  const handleSaveEdit = (id: string) => {
    const priceValue = parseFloat(newItemPrice);
    if (isNaN(priceValue)) return;

    updateItem(id, {
      name: newItemName,
      price: priceValue,
      notes: newItemNote
    });

    setEditingItemId(null);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemNote('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemNote('');
  };

  const togglePayer = (itemId: string, personId: string, isPayer: boolean) => {
    if (isPayer) {
      removePayerFromItem(itemId, personId);
    } else {
      assignPayerToItem(itemId, personId);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Receipt Items</h2>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Notes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payers
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {receipt.items.map((item) => (
              <tr key={item.id}>
                {editingItemId === item.id ? (
                  // Edit mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={newItemNote}
                        onChange={(e) => setNewItemNote(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Add notes"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Payers can't be edited in edit mode */}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Save to edit payers
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">${item.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.notes || <span className="italic">No notes</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {people.length > 0 ? (
                          people.map((person) => {
                            // Add a check to ensure item.payers exists before using includes
                            const isPayer = item.payers && item.payers.includes(person.id);
                            return (
                              <button
                                key={person.id}
                                onClick={() => togglePayer(item.id, person.id, isPayer)}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPayer
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                {isPayer ? (
                                  <UserMinusIcon className="w-3 h-3 mr-1" />
                                ) : (
                                  <UserPlusIcon className="w-3 h-3 mr-1" />
                                )}
                                {person.name}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Add people first
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
