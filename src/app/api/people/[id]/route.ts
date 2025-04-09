import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/people/[id] - Get a specific person
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const person = await prisma.person.findUnique({
      where: {
        id: params.id
      },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    });

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    return NextResponse.json(
      { error: 'Failed to fetch person' },
      { status: 500 }
    );
  }
}

// DELETE /api/people/[id] - Delete a person
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.person.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    );
  }
}
