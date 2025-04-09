import { create } from 'zustand';
import { Person, Receipt, ReceiptItem } from '../types';

interface ReceiptState {
  receipt: Receipt | null;
  people: Person[];
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  setReceipt: (receipt: Receipt) => void;
  addItem: (item: ReceiptItem) => void;
  updateItem: (id: string, updates: Partial<ReceiptItem>) => void;
  removeItem: (id: string) => void;
  addPerson: (name: string) => void;
  removePerson: (id: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  assignPayerToItem: (itemId: string, personId: string) => void;
  removePayerFromItem: (itemId: string, personId: string) => void;
}

const useReceiptStore = create<ReceiptState>((set) => ({
  receipt: null,
  people: [],
  isProcessing: false,
  error: null,
  
  setReceipt: (receipt) => set({ receipt }),
  
  addItem: (item) => set((state) => ({
    receipt: state.receipt ? {
      ...state.receipt,
      items: [...(state.receipt.items || []), item]
    } : {
      id: crypto.randomUUID(),
      items: [item]
    }
  })),
  
  updateItem: (id, updates) => set((state) => {
    if (!state.receipt) return state;
    
    return {
      receipt: {
        ...state.receipt,
        items: state.receipt.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      }
    };
  }),
  
  removeItem: (id) => set((state) => {
    if (!state.receipt) return state;
    
    return {
      receipt: {
        ...state.receipt,
        items: state.receipt.items.filter(item => item.id !== id)
      }
    };
  }),
  
  addPerson: (name) => set((state) => ({
    people: [...state.people, { id: crypto.randomUUID(), name }]
  })),
  
  removePerson: (id) => set((state) => ({
    people: state.people.filter(person => person.id !== id),
    // Also remove this person from all items' payers
    receipt: state.receipt ? {
      ...state.receipt,
      items: state.receipt.items.map(item => ({
        ...item,
        payers: item.payers.filter(payerId => payerId !== id)
      }))
    } : null
  })),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({ receipt: null, error: null }),
  
  assignPayerToItem: (itemId, personId) => set((state) => {
    if (!state.receipt) return state;
    
    return {
      receipt: {
        ...state.receipt,
        items: state.receipt.items.map(item => {
          if (item.id === itemId && !item.payers.includes(personId)) {
            return {
              ...item,
              payers: [...item.payers, personId]
            };
          }
          return item;
        })
      }
    };
  }),
  
  removePayerFromItem: (itemId, personId) => set((state) => {
    if (!state.receipt) return state;
    
    return {
      receipt: {
        ...state.receipt,
        items: state.receipt.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              payers: item.payers.filter(id => id !== personId)
            };
          }
          return item;
        })
      }
    };
  })
}));

export default useReceiptStore;
