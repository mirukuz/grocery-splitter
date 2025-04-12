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
  console.log('Original OCR text:', text); // Debug: log the original text
  // This parser handles common grocery receipt formats, including:
  // 1. Item name $price on the same line
  // 2. Item name on one line, quantity and price on the next line
  // 3. Grocery store receipts with quantity, unit price, and total price
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  console.log('Processed lines:', lines); // Debug: log the processed lines
  const items: ReceiptItem[] = [];
  
  // Regular expressions for different patterns
  const singleLineItemRegex = /(.*?)\s*\$?\s*(\d+\.\d{2})\s*$/; // Item name $price
  const quantityRegex = /^(\d+\.\d+)\s*kg\s*NET\s*@\s*\$?(\d+\.\d+)\/kg/i; // 0.312 kg NET @ $3.906/kg
  const priceRegex = /^\s*\$?(\d+\.\d{2})\s*$/; // $1.22 or 1.22
  const quantityWithPriceRegex = /^(\d+\.\d+)\s*kg\s*NET\s*@\s*\$?(\d+\.\d+)\/kg\s+(\d+\.\d{2})$/i; // 0.312 kg NET @ $3.906/kg 1.22
  
  // First pass: Identify product names and their quantity lines
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
    
    // Check if the current line contains a quantity with price (e.g., "0.312 kg NET @ $3.906/kg 1.22")
    const quantityWithPriceMatch = currentLine.match(quantityWithPriceRegex);
    if (quantityWithPriceMatch) {
      // This line has both quantity and price, check if previous line is a product name
      if (i > 0) {
        const productName = lines[i-1];
        const [, , , price] = quantityWithPriceMatch;
        const totalPrice = parseFloat(price);
        
        // Create item with combined name
        const combinedName = `${productName} ${currentLine.split(' ').slice(0, -1).join(' ')}`;
        console.log('Product with quantity+price - Combined name:', combinedName);
        
        items.push({
          id: crypto.randomUUID(),
          name: combinedName,
          price: totalPrice,
          notes: '',
          payers: []
        });
        
        continue;
      }
    }
    
    // Check if the next line is a quantity line (e.g., "0.312 kg NET @ $3.906/kg")
    if (nextLine) {
      // Try to match the quantity with price pattern first (most common in your receipt)
      const nextLineQuantityWithPriceMatch = nextLine.match(quantityWithPriceRegex);
      if (nextLineQuantityWithPriceMatch) {
        // Next line has both quantity and price, current line is likely product name
        const productName = currentLine;
        const [, , , price] = nextLineQuantityWithPriceMatch;
        const totalPrice = parseFloat(price);
        
        // Create item with combined name (exclude the price at the end)
        const quantityPart = nextLine.split(' ').slice(0, -1).join(' ');
        const combinedName = `${productName} ${quantityPart}`;
        console.log('Product with next line quantity+price - Combined name:', combinedName);
        
        items.push({
          id: crypto.randomUUID(),
          name: combinedName,
          price: totalPrice,
          notes: '',
          payers: []
        });
        
        i++; // Skip the next line since we've processed it
        continue;
      }
      
      // Try to match just a quantity line
      const nextLineQuantityMatch = nextLine.match(quantityRegex);
      if (nextLineQuantityMatch) {
        // Next line is a quantity line, current line is likely a product name
        const productName = currentLine;
        const [, quantity, unitPrice] = nextLineQuantityMatch;
        
        // Look for price in the same line or in a third line
        let totalPrice = parseFloat(quantity) * parseFloat(unitPrice);
        totalPrice = parseFloat(totalPrice.toFixed(2)); // Round to 2 decimal places
        
        // Check if the quantity line also contains a price at the end
        const priceMatch = nextLine.match(/\s+(\d+\.\d{2})$/);
        if (priceMatch) {
          totalPrice = parseFloat(priceMatch[1]);
        }
        
        // Create item with combined name
        const combinedName = `${productName} ${nextLine}`;
        console.log('Product with quantity - Combined name:', combinedName);
        
        items.push({
          id: crypto.randomUUID(),
          name: combinedName,
          price: totalPrice,
          notes: '',
          payers: []
        });
        
        i++; // Skip the next line since we've processed it
        continue;
      }
    }
    
    // Special case: If this line is a quantity line without a preceding product name
    const quantityMatch = currentLine.match(quantityRegex);
    if (quantityMatch && (i === 0 || lines[i-1].match(singleLineItemRegex) || lines[i-1].match(priceRegex))) {
      // This is a quantity line without a product name before it
      const [, quantity, unitPrice] = quantityMatch;
      let totalPrice = parseFloat(quantity) * parseFloat(unitPrice);
      
      // If there's a next line with just a price, use that instead
      if (nextLine && nextLine.match(priceRegex)) {
        const priceMatch = nextLine.match(priceRegex);
        if (priceMatch) {
          totalPrice = parseFloat(priceMatch[1]);
          i++; // Skip the next line since we've processed it
        }
      }
      
      // Look back to see if there's a product name before the quantity line
      // that we might have missed (not matching any of our patterns)
      let productName = '';
      if (i > 0 && !lines[i-1].match(quantityRegex) && !lines[i-1].match(priceRegex) && !lines[i-1].match(singleLineItemRegex)) {
        // Previous line might be a product name that we didn't recognize
        productName = lines[i-1];
      } else {
        // Look ahead to see if there's a product name after the quantity line
        const lookAheadIndex = nextLine && nextLine.match(priceRegex) ? i + 2 : i + 1;
        const possibleProductName = lookAheadIndex < lines.length ? lines[lookAheadIndex] : null;
        
        // Use the possible product name if it doesn't match any of our patterns
        productName = possibleProductName && 
                          !possibleProductName.match(quantityRegex) && 
                          !possibleProductName.match(priceRegex) && 
                          !possibleProductName.match(singleLineItemRegex) ? 
                          possibleProductName : '';
        
        // Skip the product name line if we used it
        if (productName === possibleProductName) {
          i = lookAheadIndex;
        }
      }
      
      // Create the item with combined name or just the quantity info if no product name found
      const combinedName = productName ? 
                          `${productName} ${currentLine}` : 
                          currentLine;
      
      console.log('Special case - Found product name:', productName);
      console.log('Special case - Combined name:', combinedName);
      
      items.push({
        id: crypto.randomUUID(),
        name: combinedName,
        price: parseFloat(totalPrice.toFixed(2)),
        notes: '',
        payers: []
      });
      
      continue;
    }
    
    // Case 1: Single line with item and price
    const singleLineMatch = currentLine.match(singleLineItemRegex);
    if (singleLineMatch && !currentLine.match(quantityRegex)) {
      const [, itemName, priceStr] = singleLineMatch;
      const price = parseFloat(priceStr);
      
      // Skip if the price is NaN or the item name is empty
      if (!isNaN(price) && itemName.trim()) {
      items.push({
        id: crypto.randomUUID(),
        name: itemName.trim(),
        price,
        notes: '',
        payers: []
      });
      }
      continue;
    }
    
    // Case 2: Product name followed by quantity and price
    if (nextLine && nextLine.match(quantityRegex)) {
      const productName = currentLine.trim();
      const quantityMatch = nextLine.match(quantityRegex);
      
      if (quantityMatch) {
        const [, quantity, unitPrice] = quantityMatch;
        // Calculate or extract the total price
        let totalPrice = parseFloat(quantity) * parseFloat(unitPrice);
        
        // If there's a third line with just a price, use that instead
        const thirdLine = i + 2 < lines.length ? lines[i + 2] : null;
        if (thirdLine && thirdLine.match(priceRegex)) {
          const priceMatch = thirdLine.match(priceRegex);
          if (priceMatch) {
            totalPrice = parseFloat(priceMatch[1]);
            i += 2; // Skip the next two lines since we've processed them
          }
        } else {
          i++; // Skip the next line since we've processed it
        }
        
        // Create a new item with the combined product name and quantity information
        const combinedName = `${productName} ${nextLine}`;
        console.log('Case 2 - Product name:', productName);
        console.log('Case 2 - Quantity line:', nextLine);
        console.log('Case 2 - Combined name:', combinedName);
        
        items.push({
          id: crypto.randomUUID(),
          name: combinedName,
          price: parseFloat(totalPrice.toFixed(2)), // Round to 2 decimal places
          notes: '',
          payers: []
        });
        continue;
      }
    }
    
    // Case 3: Try to match just a price line and look back for a product name
    const priceMatch = currentLine.match(priceRegex);
    if (priceMatch && i > 0 && !lines[i-1].match(singleLineItemRegex) && !lines[i-1].match(quantityRegex) && !lines[i-1].match(priceRegex)) {
      const productName = lines[i-1].trim();
      const price = parseFloat(priceMatch[1]);
      
      if (!isNaN(price) && productName) {
        items.push({
          id: crypto.randomUUID(),
          name: productName,
          price,
          notes: '',
          payers: []
        });
      }
    }
  }
  
  // Filter out any items that don't have a valid price or are just headers
  const validItems = items.filter(item => !isNaN(item.price) && item.price > 0 && item.name !== 'Description $');
  console.log('Final parsed items:', validItems);
  // Filter out any items that don't have a valid price or are just headers
  return items.filter(item => !isNaN(item.price) && item.price > 0 && item.name !== 'Description $');
};

// Create a receipt object from processed data
export const createReceiptFromOCR = (text: string, items: Array<{id: string; name: string; price: number; notes: string}>, imageUrl?: string): Omit<Receipt, 'sessionId'> => {
  // Ensure each item has a payers array initialized
  const itemsWithPayers = items.map(item => ({
    ...item,
    payers: [] as string[] // Initialize empty payers array for each item
  }));
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
    items: itemsWithPayers,
    rawText: text,
    imageUrl,
    date,
    total
  };
};
