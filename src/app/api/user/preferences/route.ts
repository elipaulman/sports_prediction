import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { kv } from '@vercel/kv';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from '@/types';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const preferences = await request.json();
    const userProfile = await kv.hget<{ profile: User }>(`user:${session.user.id}`, 'profile');
    
    if (!userProfile?.profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update preferences while preserving other user data
    const updatedProfile = {
      ...userProfile.profile,
      preferences: {
        ...userProfile.profile.preferences,
        ...preferences,
      },
    };

    await kv.hset(`user:${session.user.id}`, { profile: updatedProfile });

    return NextResponse.json({ data: updatedProfile.preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userProfile = await kv.hget<{ profile: User }>(`user:${session.user.id}`, 'profile');
    
    if (!userProfile?.profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: userProfile.profile.preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 