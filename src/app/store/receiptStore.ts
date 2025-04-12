import { create } from 'zustand';
import { Person, Receipt, ReceiptItem } from '../types';
import { receiptService, personService, itemService } from '../services/api';

// Define interfaces for the API response structure
interface PersonOnItem {
  personId: string;
  itemId: string;
  person: Person;
}

interface ApiReceiptItem extends Omit<ReceiptItem, 'payers'> {
  payers: PersonOnItem[];
}

interface ApiReceipt extends Omit<Receipt, 'items'> {
  items: ApiReceiptItem[];
}

interface ReceiptState {
  receipt: Receipt | null;
  people: Person[];
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  fetchPeople: () => Promise<void>;
  fetchReceiptForSession: (sessionId: string) => Promise<void>;
  setReceipt: (receipt: ApiReceipt | Receipt) => void;
  saveReceipt: (receiptData: { sessionId: string; imageUrl?: string; rawText?: string; date?: string; total?: number; items?: Array<{ name: string; price: number; notes?: string }> }) => Promise<void>;
  addItem: (item: Omit<ReceiptItem, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<ReceiptItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  addPerson: (name: string) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  assignPayerToItem: (itemId: string, personId: string) => Promise<void>;
  removePayerFromItem: (itemId: string, personId: string) => Promise<void>;
}

const useReceiptStore = create<ReceiptState>((set, get) => ({
  receipt: null,
  people: [],
  isProcessing: false,
  error: null,
  
  fetchPeople: async () => {
    try {
      const people = await personService.getPeople();
      set({ people });
    } catch (error) {
      console.error('Error fetching people:', error);
      set({ error: 'Failed to fetch people' });
    }
  },
  
  fetchReceiptForSession: async (sessionId) => {
    try {
      set({ isProcessing: true, error: null });
      // Get all receipts for the session
      const receipts = await receiptService.getReceiptsForSession(sessionId);
      
      // If there are receipts, set the most recent one as the active receipt
      if (receipts && receipts.length > 0) {
        // Sort by creation date (newest first) and take the first one
        const latestReceipt = receipts[0];
        const fullReceipt = await receiptService.getReceipt(latestReceipt.id);
        get().setReceipt(fullReceipt);
      }
      set({ isProcessing: false });
    } catch (error) {
      console.error('Error fetching receipt for session:', error);
      set({ error: 'Failed to fetch receipt for session', isProcessing: false });
    }
  },
  
  setReceipt: (apiReceipt: ApiReceipt | Receipt) => {
    // Transform the receipt data to match our frontend model
    // The API returns payers as an array of PersonOnItem objects, but our frontend expects an array of person IDs
    if (apiReceipt && apiReceipt.items) {
      const transformedReceipt: Receipt = {
        ...apiReceipt,
        items: apiReceipt.items.map(item => {
          // Check if this is an API response with PersonOnItem structure
          const hasPayersObject = item.payers && Array.isArray(item.payers) && 
            item.payers.length > 0 && typeof item.payers[0] === 'object';
          
          return {
            ...item,
            // Transform payers from API format to array of person IDs
            payers: hasPayersObject
              ? (item.payers as unknown as PersonOnItem[]).map(payer => payer.personId)
              : (item.payers as string[])
          };
        })
      };
      set({ receipt: transformedReceipt });
    } else {
      set({ receipt: apiReceipt as Receipt });
    }
  },
  
  saveReceipt: async (receiptData: { sessionId: string; imageUrl?: string; rawText?: string; date?: string; total?: number; items?: Array<{ name: string; price: number; notes?: string }> }) => {
    try {
      set({ isProcessing: true, error: null });
      const savedReceipt = await receiptService.createReceipt(receiptData);
      set({ receipt: savedReceipt, isProcessing: false });
    } catch (error) {
      console.error('Error saving receipt:', error);
      set({ error: 'Failed to save receipt', isProcessing: false });
    }
  },
  
  addItem: async (item) => {
    try {
      const state = get();
      
      // If there's no active receipt, create a temporary one in memory
      if (!state.receipt) {
        // Create a temporary receipt with the new item
        const tempReceipt: Receipt = {
          id: 'temp-' + crypto.randomUUID(),
          items: [
            {
              ...item,
              id: crypto.randomUUID(),
              payers: []
            }
          ],
          sessionId: 'temp-session', // Required property
          // Optional properties
          imageUrl: undefined,
          rawText: undefined,
          date: undefined,
          total: undefined
        };
        
        set({ receipt: tempReceipt });
        return;
      }
      
      // If there is an active receipt, add the item to it via the API
      const newItem = await itemService.createItem({
        ...item,
        receiptId: state.receipt.id
      });
      
      set((state) => ({
        receipt: state.receipt ? {
          ...state.receipt,
          items: [...(state.receipt.items || []), newItem]
        } : null
      }));
    } catch (error) {
      console.error('Error adding item:', error);
      set({ error: 'Failed to add item' });
    }
  },
  
  updateItem: async (id, updates) => {
    try {
      const updatedItem = await itemService.updateItem(id, updates);
      
      set((state) => {
        if (!state.receipt) return state;
        
        return {
          receipt: {
            ...state.receipt,
            items: state.receipt.items.map(item => 
              item.id === id ? { ...item, ...updatedItem } : item
            )
          }
        };
      });
    } catch (error) {
      console.error('Error updating item:', error);
      set({ error: 'Failed to update item' });
    }
  },
  
  removeItem: async (id) => {
    try {
      await itemService.deleteItem(id);
      
      set((state) => {
        if (!state.receipt) return state;
        
        return {
          receipt: {
            ...state.receipt,
            items: state.receipt.items.filter(item => item.id !== id)
          }
        };
      });
    } catch (error) {
      console.error('Error removing item:', error);
      set({ error: 'Failed to remove item' });
    }
  },
  
  addPerson: async (name) => {
    try {
      const newPerson = await personService.createPerson(name);
      set((state) => ({
        people: [...state.people, newPerson]
      }));
    } catch (error) {
      console.error('Error adding person:', error);
      set({ error: 'Failed to add person' });
    }
  },
  
  removePerson: async (id) => {
    try {
      await personService.deletePerson(id);
      
      set((state) => ({
        people: state.people.filter(person => person.id !== id)
      }));
      
      // Note: The API will automatically handle removing this person from items
      // due to the onDelete: Cascade relation in the database schema
    } catch (error) {
      console.error('Error removing person:', error);
      set({ error: 'Failed to remove person' });
    }
  },
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({ receipt: null, error: null }),
  
  assignPayerToItem: async (itemId, personId) => {
    try {
      await itemService.assignPayer(itemId, personId);
      
      // Refresh the receipt data to get the updated payers
      const state = get();
      if (state.receipt) {
        const updatedReceipt = await receiptService.getReceipt(state.receipt.id);
        // Use setReceipt to properly transform the API response
        get().setReceipt(updatedReceipt);
      }
    } catch (error) {
      console.error('Error assigning payer:', error);
      set({ error: 'Failed to assign payer' });
    }
  },
  
  removePayerFromItem: async (itemId, personId) => {
    try {
      await itemService.removePayer(itemId, personId);
      
      // Refresh the receipt data to get the updated payers
      const state = get();
      if (state.receipt) {
        const updatedReceipt = await receiptService.getReceipt(state.receipt.id);
        // Use setReceipt to properly transform the API response
        get().setReceipt(updatedReceipt);
      }
    } catch (error) {
      console.error('Error removing payer:', error);
      set({ error: 'Failed to remove payer' });
    }
  }
}));

export default useReceiptStore;
