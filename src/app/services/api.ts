// API service for interacting with the backend

// Session related API calls
export const sessionService = {
  // Get all sessions
  getSessions: async () => {
    const response = await fetch('/api/sessions');
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    return response.json();
  },

  // Get a specific session
  getSession: async (id: string) => {
    const response = await fetch(`/api/sessions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    return response.json();
  },

  // Create a new session
  createSession: async (sessionData: { title: string; participantIds?: string[] }) => {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    return response.json();
  },

  // Update a session
  updateSession: async (id: string, sessionData: { title?: string; participantIds?: string[] }) => {
    const response = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      throw new Error('Failed to update session');
    }
    return response.json();
  },

  // Delete a session
  deleteSession: async (id: string) => {
    const response = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete session');
    }
    return response.json();
  },
};

// Receipt related API calls
export const receiptService = {
  // Get all receipts
  getReceipts: async () => {
    const response = await fetch('/api/receipts');
    if (!response.ok) {
      throw new Error('Failed to fetch receipts');
    }
    return response.json();
  },

  // Get receipts for a specific session
  getReceiptsForSession: async (sessionId: string) => {
    const response = await fetch(`/api/receipts?sessionId=${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch receipts for session');
    }
    return response.json();
  },

  // Get a specific receipt
  getReceipt: async (id: string) => {
    const response = await fetch(`/api/receipts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }
    return response.json();
  },

  // Create a new receipt
  createReceipt: async (receiptData: { sessionId: string; imageUrl?: string; rawText?: string; date?: string; total?: number; items?: Array<{ name: string; price: number; notes?: string }> }) => {
    const response = await fetch('/api/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData),
    });
    if (!response.ok) {
      throw new Error('Failed to create receipt');
    }
    return response.json();
  },

  // Delete a receipt
  deleteReceipt: async (id: string) => {
    const response = await fetch(`/api/receipts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete receipt');
    }
    return response.json();
  },
};

// Person related API calls
export const personService = {
  // Get all people
  getPeople: async () => {
    const response = await fetch('/api/people');
    if (!response.ok) {
      throw new Error('Failed to fetch people');
    }
    return response.json();
  },

  // Create a new person
  createPerson: async (name: string) => {
    const response = await fetch('/api/people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create person');
    }
    return response.json();
  },

  // Delete a person
  deletePerson: async (id: string) => {
    const response = await fetch(`/api/people/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete person');
    }
    return response.json();
  },
};

// Item related API calls
export const itemService = {
  // Create a new item
  createItem: async (itemData: { name: string; price: number; notes?: string; receiptId: string }) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to create item');
    }
    return response.json();
  },

  // Update an item
  updateItem: async (id: string, itemData: { name?: string; price?: number; notes?: string }) => {
    const response = await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    return response.json();
  },

  // Delete an item
  deleteItem: async (id: string) => {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    return response.json();
  },

  // Assign a person to an item
  assignPayer: async (itemId: string, personId: string) => {
    const response = await fetch(`/api/items/${itemId}/payers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ personId }),
    });
    if (!response.ok) {
      throw new Error('Failed to assign payer');
    }
    return response.json();
  },

  // Remove a person from an item
  removePayer: async (itemId: string, personId: string) => {
    const response = await fetch(`/api/items/${itemId}/payers?personId=${personId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove payer');
    }
    return response.json();
  },
};
