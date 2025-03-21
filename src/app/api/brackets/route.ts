import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { generateId } from '@/lib/utils';
import { Bracket } from '@/types/bracket';

// In-memory storage for development
const brackets = new Map<string, Bracket>();
const userBrackets = new Map<string, string[]>();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userBracketIds = userBrackets.get(session.user.id) || [];
    const userBracketData = userBracketIds.map(id => brackets.get(id)).filter(Boolean);
    return NextResponse.json({ data: userBracketData });
  } catch (error) {
    console.error('Error fetching brackets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, predictions } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const bracketId = generateId();
    const now = new Date().toISOString();

    const bracket: Bracket = {
      id: bracketId,
      userId: session.user.id,
      name,
      createdAt: now,
      updatedAt: now,
      predictions: predictions || {},
      status: 'DRAFT',
    };

    // Save bracket
    brackets.set(bracketId, bracket);

    // Update user's brackets list
    const userBracketIds = userBrackets.get(session.user.id) || [];
    userBrackets.set(session.user.id, [...userBracketIds, bracketId]);

    return NextResponse.json({ data: bracket });
  } catch (error) {
    console.error('Error creating bracket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 