import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/items/[id] - Get a specific item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = 'then' in params ? await params : params;
    const item = await prisma.receiptItem.findUnique({
      where: {
        id: resolvedParams.id
      },
      include: {
        payers: {
          include: {
            person: true
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - Update an item
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const body = await request.json();
    const { name, price, notes } = body;

    const resolvedParams = 'then' in params ? await params : params;
    const updatedItem = await prisma.receiptItem.update({
      where: {
        id: resolvedParams.id
      },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(notes !== undefined && { notes })
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = 'then' in params ? await params : params;
    await prisma.receiptItem.delete({
      where: {
        id: resolvedParams.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
