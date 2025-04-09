import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/sessions/[id] - Get a specific session
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = 'then' in params ? await params : params;
    const session = await prisma.session.findUnique({
      where: {
        id: resolvedParams.id
      },
      include: {
        participants: true,
        receipts: {
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
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] - Update a session
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const body = await request.json();
    const { title, participantIds } = body;

    const resolvedParams = 'then' in params ? await params : params;
    
    // Get current participants to determine which ones to disconnect
    const currentSession = await prisma.session.findUnique({
      where: { id: resolvedParams.id },
      include: { participants: true }
    });

    if (!currentSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Prepare participant connections/disconnections if participantIds is provided
    let participantUpdates = {};
    if (participantIds) {
      const currentParticipantIds = currentSession.participants.map(p => p.id);
      const toConnect = participantIds.filter((id: string) => !currentParticipantIds.includes(id));
      const toDisconnect = currentParticipantIds.filter(id => !participantIds.includes(id));

      participantUpdates = {
        participants: {
          ...(toConnect.length > 0 && {
            connect: toConnect.map((id: string) => ({ id }))
          }),
          ...(toDisconnect.length > 0 && {
            disconnect: toDisconnect.map(id => ({ id }))
          })
        }
      };
    }

    const updatedSession = await prisma.session.update({
      where: {
        id: resolvedParams.id
      },
      data: {
        ...(title && { title }),
        ...participantUpdates
      },
      include: {
        participants: true,
        receipts: {
          include: {
            items: true
          }
        }
      }
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = 'then' in params ? await params : params;
    await prisma.session.delete({
      where: {
        id: resolvedParams.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
