import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/receipts - Get all receipts
export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        items: {
          include: {
            payers: {
              include: {
                person: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

// POST /api/receipts - Create a new receipt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, rawText, date, total, items } = body;
    // imageUrl is intentionally not destructured as we don't want to store it

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId is required' },
        { status: 400 }
      );
    }

    // Create receipt with nested items - don't store imageUrl
    const receipt = await prisma.receipt.create({
      data: {
        sessionId,
        // imageUrl is intentionally omitted to avoid storing it in the database
        rawText,
        date,
        total,
        items: {
          create: items ? items.map((item: { name: string; price: number; notes?: string }) => ({
            name: item.name,
            price: item.price,
            notes: item.notes || ''
          })) : []
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}
