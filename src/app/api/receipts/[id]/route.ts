import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/receipts/[id] - Get a specific receipt
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = 'then' in params ? await params : params;
    const receipt = await prisma.receipt.findUnique({
      where: {
        id: resolvedParams.id
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

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}

// DELETE /api/receipts/[id] - Delete a receipt
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = 'then' in params ? await params : params;
    await prisma.receipt.delete({
      where: {
        id: resolvedParams.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json(
      { error: 'Failed to delete receipt' },
      { status: 500 }
    );
  }
}
