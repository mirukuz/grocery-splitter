"use client";

import { useEffect } from 'react';
import useReceiptStore from '../store/receiptStore';
import { ReceiptItem } from '../types';

type PersonTotal = {
  id: string;
  name: string;
  total: number;
  items: Array<{ name: string; price: number; share: number; isDiscount?: boolean }>;
};

// Helper function to check if an item is a discount item (like 'WOW 108% OFFER')
const isDiscountItem = (name: string): boolean => {
  const discountRegex = /(WOW|DISCOUNT|OFFER)\s+\d+(%|\s*%|\s*OFFER|\s*OFF)/i;
  return discountRegex.test(name);
};

// Helper function to get regular (non-discount) items
const getRegularItems = (items: ReceiptItem[]): ReceiptItem[] => {
  return items.filter(item => !isDiscountItem(item.name) && item.price > 0);
};

// Helper function to get discount items
const getDiscountItems = (items: ReceiptItem[]): ReceiptItem[] => {
  return items.filter(item => isDiscountItem(item.name) || item.price < 0);
};

export default function BillSummary() {
  const { receipt, people, fetchPeople } = useReceiptStore();
  
  // Ensure people data is loaded when the component mounts
  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  if (!receipt || !receipt.items || receipt.items.length === 0 || people.length === 0) {
    return null;
  }

  // Separate regular items from discount items
  const regularItems = getRegularItems(receipt.items);
  const discountItems = getDiscountItems(receipt.items);
  
  // Calculate total spending (excluding discounts)
  const totalRegularSpending = regularItems.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate what each person owes (first for regular items only)
  const personTotals: PersonTotal[] = people.map(person => {
    // First calculate regular items
    const personRegularItems = regularItems
      .filter(item => item.payers && item.payers.includes(person.id))
      .map(item => {
        const numPayers = item.payers.length || 1; // Avoid division by zero
        const share = item.price / numPayers;
        
        return {
          name: item.name,
          price: item.price,
          share,
          isDiscount: false
        };
      });

    // Calculate total spent on regular items
    const regularTotal = personRegularItems.reduce((sum, item) => sum + item.share, 0);
    
    // Calculate proportion of total spending
    const spendingProportion = totalRegularSpending > 0 ? regularTotal / totalRegularSpending : 0;
    
    // Calculate discount shares based on spending proportion
    const personDiscountItems = discountItems.map(item => {
      // For discount items, we distribute proportionally based on regular spending
      const share = item.price * spendingProportion;
      
      return {
        name: item.name,
        price: item.price,
        share,
        isDiscount: true
      };
    });
    
    // Combine regular and discount items
    const allPersonItems = [...personRegularItems, ...personDiscountItems];
    
    // Calculate total including discounts
    const total = allPersonItems.reduce((sum, item) => sum + item.share, 0);

    return {
      id: person.id,
      name: person.name,
      total,
      items: allPersonItems
    };
  });

  // Calculate the grand total (including discounts)
  const regularTotal = regularItems.reduce((sum, item) => sum + item.price, 0);
  const discountTotal = discountItems.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = regularTotal + discountTotal;
  
  // Calculate total assigned (to check if all items are assigned)
  const totalAssigned = personTotals.reduce((sum, person) => sum + person.total, 0);
  const unassignedAmount = Math.abs(grandTotal - totalAssigned) > 0.01 ? (grandTotal - totalAssigned) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-16">
      <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Receipt Total</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${grandTotal.toFixed(2)}</p>
          
          {discountTotal < 0 && (
            <div className="mt-1 text-sm text-green-600 dark:text-green-400">
              <span>Includes discount: −${Math.abs(discountTotal).toFixed(2)}</span>
            </div>
          )}
          
          {unassignedAmount > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded">
              <p className="text-sm">
                Warning: ${unassignedAmount.toFixed(2)} of the bill is not assigned to anyone.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Individual Totals</h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {personTotals.map(person => (
              <div key={person.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{person.name}</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">${person.total.toFixed(2)}</p>
                
                {person.items.length > 0 ? (
                  <div className="text-sm">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Items:</h5>
                    <ul className="space-y-1">
                      {person.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span className={`${item.isDiscount ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {item.name}
                          </span>
                          <span className={`${item.isDiscount ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                            {item.isDiscount ? '-' : ''}{Math.abs(item.share).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items assigned</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
