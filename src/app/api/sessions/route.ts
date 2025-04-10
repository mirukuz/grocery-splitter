import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/sessions - Get all sessions
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        participants: true,
        receipts: {
          include: {
            items: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, participantIds } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        title,
        ...(participantIds && participantIds.length > 0 && {
          participants: {
            connect: participantIds.map((id: string) => ({ id }))
          }
        })
      },
      include: {
        participants: true,
        receipts: true
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
