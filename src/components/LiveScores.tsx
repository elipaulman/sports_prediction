'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Game } from '@/types';

export default function LiveScores() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/live-scores');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data.events);
        setError(null);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setError('Failed to load live scores');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="text-center text-gray-600 p-4">
        No live games at the moment
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <div key={game.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-2">
            {game.status.detail}
          </div>
          
          {game.competitors.map((team) => (
            <div key={team.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                {team.logo && (
                  <div className="relative w-8 h-8">
                    <Image
                      src={team.logo}
                      alt={`${team.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    {team.rank && (
                      <span className="text-xs text-gray-600">#{team.rank}</span>
                    )}
                    <span className="font-semibold">{team.name}</span>
                  </div>
                  {team.records?.[0] && (
                    <div className="text-xs text-gray-600">
                      {team.records[0].summary}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xl font-bold">{team.score}</div>
            </div>
          ))}
          
          {game.broadcasts?.[0] && (
            <div className="text-sm text-gray-600 mt-2">
              Watch on: {game.broadcasts[0].name}
            </div>
          )}
          
          {game.venue?.name && (
            <div className="text-xs text-gray-500 mt-1">
              {game.venue.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 