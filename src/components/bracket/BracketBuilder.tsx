'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

interface Team {
  id: string;
  name: string;
  seed: number;
}

interface Game {
  id: string;
  round: number;
  region: string;
  topTeamId: string | null;
  bottomTeamId: string | null;
  winnerId: string | null;
}

interface TournamentData {
  teams: {
    [key: string]: Team[];
  };
  structure: {
    rounds: string[];
    regions: string[];
    games: Game[];
  };
}

export default function BracketBuilder() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bracketName, setBracketName] = useState('');
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTournamentData() {
      try {
        const response = await fetch('/api/tournament');
        if (!response.ok) {
          throw new Error('Failed to fetch tournament data');
        }
        const data = await response.json();
        setTournamentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tournament data');
      } finally {
        setLoading(false);
      }
    }

    fetchTournamentData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const predictions = tournamentData?.structure.games.reduce((acc, game) => {
        acc[game.id] = game.winnerId;
        return acc;
      }, {} as { [key: string]: string | null }) || {};

      const response = await fetch('/api/brackets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bracketName,
          predictions
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create bracket');
      }

      const data = await response.json();
      router.push(`/bracket/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bracket');
    } finally {
      setLoading(false);
    }
  };

  const renderTeam = (team: Team | undefined) => {
    if (!team) return null;
    return (
      <div className="flex items-center space-x-2 p-2 border rounded">
        <span className="font-bold text-sm">{team.seed}</span>
        <span className="text-sm">{team.name}</span>
      </div>
    );
  };

  const renderGame = (game: Game) => {
    const topTeam = tournamentData?.teams[game.region]?.find(t => t.id === game.topTeamId);
    const bottomTeam = tournamentData?.teams[game.region]?.find(t => t.id === game.bottomTeamId);

    return (
      <div key={game.id} className="flex flex-col space-y-1">
        {renderTeam(topTeam)}
        {renderTeam(bottomTeam)}
      </div>
    );
  };

  const renderRound = (roundNumber: number, region: string) => {
    const games = tournamentData?.structure.games.filter(
      g => g.round === roundNumber && g.region === region
    );

    return (
      <div className="flex flex-col space-y-4">
        {games?.map(game => renderGame(game))}
      </div>
    );
  };

  const renderRegion = (region: string) => {
    return (
      <div key={region} className="p-4 border rounded">
        <h3 className="text-lg font-bold mb-4">{region}</h3>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(round => (
            <div key={round}>
              <h4 className="text-sm font-semibold mb-2">
                {tournamentData?.structure.rounds[round - 1]}
              </h4>
              {renderRound(round, region)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bracketName" className="block text-sm font-medium text-gray-700">
            Bracket Name
          </label>
          <input
            type="text"
            id="bracketName"
            value={bracketName}
            onChange={(e) => setBracketName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="My March Madness Bracket"
            required
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !bracketName}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : status === 'unauthenticated' ? 'Sign in to Create Bracket' : 'Create Bracket'}
        </button>
      </form>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : tournamentData ? (
          <div className="space-y-8">
            {tournamentData.structure.regions.map(region => renderRegion(region))}
            <div className="p-4 border rounded">
              <h3 className="text-lg font-bold mb-4">Final Four</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderRound(5, 'Final Four')}
              </div>
            </div>
            <div className="p-4 border rounded">
              <h3 className="text-lg font-bold mb-4">Championship</h3>
              <div className="mx-auto max-w-md">
                {renderRound(6, 'Championship')}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 