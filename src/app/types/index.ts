export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  notes: string;
  payers: string[];
}

export interface Person {
  id: string;
  name: string;
}

export interface Receipt {
  id: string;
  items: ReceiptItem[];
  imageUrl?: string;
  rawText?: string;
  date?: string;
  total?: number;
  sessionId: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  receipts: Receipt[];
  participants: Person[];
}
