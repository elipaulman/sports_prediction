import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Test Redis connection
    await redis.set('test-key', 'Hello from Redis!');
    const value = await redis.get('test-key');
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Redis connection working',
      testValue: value
    });
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 