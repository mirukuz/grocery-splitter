import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, notes, receiptId } = body;

    if (!name || !price || !receiptId) {
      return NextResponse.json(
        { error: 'Name, price, and receiptId are required' },
        { status: 400 }
      );
    }

    const item = await prisma.receiptItem.create({
      data: {
        name,
        price: parseFloat(price),
        notes: notes || '',
        receiptId
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
