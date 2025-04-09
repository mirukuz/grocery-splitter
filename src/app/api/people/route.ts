import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/people - Get all people
export async function GET() {
  try {
    const people = await prisma.person.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}

// POST /api/people - Create a new person
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const person = await prisma.person.create({
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    );
  }
}
