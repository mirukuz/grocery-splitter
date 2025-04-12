import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// POST /api/items/[id]/payers - Assign a person to an item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse request body
    const body = await request.json();
    const { personId } = body;
    
    // Get the item ID from params
    const itemId = params.id;

    // Validate personId
    if (!personId) {
      return NextResponse.json(
        { error: 'PersonId is required' },
        { status: 400 }
      );
    }

    // Check if the assignment already exists
    const existingAssignment = await prisma.personOnItem.findUnique({
      where: {
        personId_itemId: {
          personId,
          itemId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Person is already assigned to this item' },
        { status: 400 }
      );
    }

    // Get the item with its receipt and session information
    const item = await prisma.receiptItem.findUnique({
      where: { id: itemId },
      include: {
        receipt: {
          include: {
            session: true
          }
        }
      }
    });

    if (!item || !item.receipt || !item.receipt.session) {
      return NextResponse.json(
        { error: 'Item, receipt, or session not found' },
        { status: 404 }
      );
    }

    // Create the assignment
    const assignment = await prisma.personOnItem.create({
      data: {
        personId,
        itemId
      },
      include: {
        person: true,
        item: true
      }
    });

    // Add the person as a participant to the session if they're not already
    const sessionId = item.receipt.sessionId;
    
    // Get the session to check if the person is already a participant
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true }
    });
    
    if (session) {
      const isParticipant = session.participants.some(p => p.id === personId);
      
      if (!isParticipant) {
        // Add person to session participants
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            participants: {
              connect: { id: personId }
            }
          }
        });
      }
    }
    
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error assigning person to item:', error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to assign person to item', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id]/payers - Remove a person from an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const itemId = params.id;

    if (!personId) {
      return NextResponse.json(
        { error: 'PersonId is required' },
        { status: 400 }
      );
    }

    // Delete the assignment
    await prisma.personOnItem.delete({
      where: {
        personId_itemId: {
          personId,
          itemId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing person from item:', error);
    return NextResponse.json(
      { error: 'Failed to remove person from item' },
      { status: 500 }
    );
  }
}
