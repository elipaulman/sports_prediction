import { NextResponse } from 'next/server';
import { Game } from '@/types';
import { getTournamentGames } from '@/lib/espn';
import redis from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    // Try to get cached data first
    const cacheKey = `games:${region || 'all'}:${status || 'all'}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({ data: JSON.parse(cachedData) });
    }

    // If no cached data, get tournament data from ESPN
    const { games } = await getTournamentGames();

    // Apply filters
    let filteredGames = [...games];
    if (region) {
      filteredGames = filteredGames.filter(game => game.region === region);
    }
    if (status) {
      filteredGames = filteredGames.filter(game => game.status === status);
    }

    // Sort games by start time
    filteredGames.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Apply limit if specified
    if (limit) {
      filteredGames = filteredGames.slice(0, parseInt(limit));
    }

    // Cache the results in Redis for 30 seconds
    await redis.set(cacheKey, JSON.stringify(filteredGames), 'EX', 30);

    return NextResponse.json({ data: filteredGames });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// In a real application, you would have POST/PUT endpoints to update game data
// These would be called by an admin interface or automated system
// For demo purposes, we'll create a helper function to seed some test data

export async function POST(request: Request) {
  // This would typically be protected by admin authentication
  try {
    const games = await request.json();
    
    // Validate games data
    if (!Array.isArray(games)) {
      return NextResponse.json({ error: 'Invalid games data' }, { status: 400 });
    }

    // Use Redis pipeline for better performance
    const pipeline = redis.pipeline();
    
    games.forEach((game: Game) => {
      pipeline.hset(`game:${game.id}`, 'data', JSON.stringify(game));
    });

    await pipeline.exec();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 