import { createWorker } from 'tesseract.js';
import { ReceiptItem, Receipt } from '../types';

// Process image with OCR
export const processReceiptImage = async (imageFile: File): Promise<{ text: string, items: ReceiptItem[] }> => {
  try {
    // Create a worker
    const worker = await createWorker('eng');
    
    // Read the image
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Recognize text
    const { data } = await worker.recognize(imageUrl);
    const text = data.text;
    
    // Terminate worker
    await worker.terminate();
    
    // Parse items from text
    const items = parseReceiptItems(text);
    
    return { text, items };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt image');
  }
};

// Parse receipt text to extract items
export const parseReceiptItems = (text: string): ReceiptItem[] => {
  // This is a simple parser that looks for patterns like:
  // Item name $price
  // It can be improved with more sophisticated regex or NLP techniques
  const lines = text.split('\n');
  const items: ReceiptItem[] = [];
  
  // Regular expression to match item and price
  // This pattern looks for text followed by a price (with optional spaces)
  // The price format can be $X.XX or X.XX
  const itemRegex = /(.*?)\s*\$?\s*(\d+\.\d{2})\s*$/;
  
  for (const line of lines) {
    const match = line.match(itemRegex);
    if (match) {
      const [, itemName, priceStr] = match;
      const price = parseFloat(priceStr);
      
      // Skip if the price is NaN or the item name is empty
      if (isNaN(price) || !itemName.trim()) continue;
      
      // Create a new item
      items.push({
        id: crypto.randomUUID(),
        name: itemName.trim(),
        price,
        notes: '',
        payers: []
      });
    }
  }
  
  return items;
};

// Create a receipt object from processed data
export const createReceiptFromOCR = (text: string, items: ReceiptItem[], imageUrl?: string): Receipt => {
  // Try to extract the total
  let total: number | undefined;
  const totalRegex = /total\s*\$?\s*(\d+\.\d{2})/i;
  const totalMatch = text.match(totalRegex);
  
  if (totalMatch) {
    total = parseFloat(totalMatch[1]);
  } else {
    // If no total found, calculate from items
    total = items.reduce((sum, item) => sum + item.price, 0);
  }
  
  // Try to extract the date
  let date: string | undefined;
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
  const dateMatch = text.match(dateRegex);
  
  if (dateMatch) {
    date = dateMatch[1];
  }
  
  return {
    id: crypto.randomUUID(),
    items,
    rawText: text,
    imageUrl,
    date,
    total
  };
};
