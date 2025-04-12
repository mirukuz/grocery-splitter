import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/receipts - Get all receipts or receipts for a specific session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    // Build the query with proper typing
    const query: {
      where?: { sessionId: string };
      include: {
        items: {
          include: {
            payers: {
              include: {
                person: boolean
              }
            }
          }
        }
      };
      orderBy: {
        createdAt: 'desc' | 'asc'
      }
    } = {
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
    };
    
    // Add sessionId filter if provided
    if (sessionId) {
      query.where = { sessionId };
    }
    
    const receipts = await prisma.receipt.findMany(query);

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

    // Get all people to assign as payers to each item by default
    const people = await prisma.person.findMany();
    const peopleIds = people.map(person => ({ id: person.id }));

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
            notes: item.notes || '',
            // Connect all people as payers to this item
            payers: peopleIds.length > 0 ? {
              create: peopleIds.map(person => ({
                person: {
                  connect: { id: person.id }
                }
              }))
            } : undefined
          })) : []
        }
      },
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
