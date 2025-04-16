"use client";

import { useState } from 'react';
import { TrashIcon, PencilIcon, UserPlusIcon, UserMinusIcon, TagIcon } from '@heroicons/react/24/outline';
import useReceiptStore from '../store/receiptStore';
import { ReceiptItem } from '../types';

// Helper function to check if an item is a discount item (like 'WOW 108% OFFER')
const isDiscountItem = (name: string): boolean => {
  const discountRegex = /(WOW|DISCOUNT|OFFER)\s+\d+(%|\s*%|\s*OFFER|\s*OFF)/i;
  return discountRegex.test(name);
};

export default function ReceiptItemsList() {
  const { receipt, people, updateItem, removeItem, assignPayerToItem, removePayerFromItem } = useReceiptStore();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemNote, setNewItemNote] = useState('');
  console.log(receipt);
  // Check if there are any items to display
  const hasItems = receipt && receipt.items && receipt.items.length > 0;
  
  if (!hasItems) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No items found in the receipt</p>
      </div>
    );
  }

  const handleEditItem = (item: ReceiptItem) => {
    setEditingItemId(item.id);
    setNewItemName(item.name);
    // For discount items, we want to edit the absolute value to make it easier for users
    setNewItemPrice(Math.abs(item.price).toString());
    setNewItemNote(item.notes);
  };

  const handleSaveEdit = (id: string) => {
    const priceValue = parseFloat(newItemPrice);
    if (isNaN(priceValue)) return;

    // If it's a discount item, we store it as a negative value
    const finalPrice = isDiscountItem(newItemName) ? -Math.abs(priceValue) : Math.abs(priceValue);

    updateItem(id, {
      name: newItemName,
      price: finalPrice,
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
      
      {/* Table view for medium and large screens */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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
                      <div className={`text-sm font-medium flex items-center ${isDiscountItem(item.name) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {isDiscountItem(item.name) && <TagIcon className="h-4 w-4 mr-1 inline-block" />}
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDiscountItem(item.name) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {isDiscountItem(item.name) ? '−' : ''}${Math.abs(item.price).toFixed(2)}
                      </div>
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
      
      {/* Card view for small screens (mobile) */}
      <div className="md:hidden space-y-4">
        {receipt.items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {editingItemId === item.id ? (
              // Edit mode - mobile
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Item</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Notes</label>
                  <input
                    type="text"
                    value={newItemNote}
                    onChange={(e) => setNewItemNote(e.target.value)}
                    placeholder="Add notes"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode - mobile
              <div>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className={`text-base font-medium flex items-center ${isDiscountItem(item.name) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {isDiscountItem(item.name) && <TagIcon className="h-4 w-4 mr-1 inline-block" />}
                      {item.name}
                    </h3>
                    <p className={`text-sm font-semibold ${isDiscountItem(item.name) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      ${isDiscountItem(item.name) ? '−' : ''}${Math.abs(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
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
                  </div>
                </div>
                
                {item.notes && (
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Notes: </span>
                      {item.notes}
                    </p>
                  </div>
                )}
                
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Payers</p>
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
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
