'use client';

import { useEffect, useState } from 'react';
import { getTournamentGames } from '@/lib/espn';

interface Game {
  id: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINAL';
  startTime: string;
  venue: string;
  topTeamId: string;
  bottomTeamId: string;
  scores?: {
    topTeam: number;
    bottomTeam: number;
    period: number;
    timeRemaining: string;
  };
  winnerId?: string;
}

interface Team {
  id: string;
  name: string;
  seed: number;
  logo: string;
}

export default function LiveScores() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games?status=LIVE');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data.data.games || []);
        setTeams(data.data.teams || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    // Refresh every 30 seconds
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No live games at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <div
          key={game.id}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                {game.status === 'LIVE' ? 'LIVE' : new Date(game.startTime).toLocaleTimeString()}
              </span>
              {game.status === 'LIVE' && (
                <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
                  {game.scores?.timeRemaining}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {[game.topTeamId, game.bottomTeamId].map((teamId) => {
                const team = teams[teamId];
                const isWinner = game.winnerId === teamId;
                const score = teamId === game.topTeamId ? game.scores?.topTeam : game.scores?.bottomTeam;

                return (
                  <div key={teamId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {team?.logo && (
                        <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                      )}
                      <div>
                        <p className={`font-medium ${isWinner ? 'text-green-600' : ''}`}>
                          {team?.seed}. {team?.name}
                        </p>
                      </div>
                    </div>
                    {score !== undefined && (
                      <span className={`text-xl font-bold ${isWinner ? 'text-green-600' : ''}`}>
                        {score}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {game.venue && (
              <div className="mt-4 text-sm text-gray-500">
                {game.venue}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 