'use client';

import { useState, useEffect } from 'react';
import { Bracket, Game, Team, Region, BracketBuilderProps } from '@/types/bracket';
import { v4 as uuidv4 } from 'uuid';

const REGIONS: Region[] = ['East', 'West', 'South', 'Midwest'];
const ROUNDS = [64, 32, 16, 8, 4, 2, 1];

export default function BracketBuilder({ initialBracket, onSave, readOnly = false }: BracketBuilderProps) {
  const [bracket, setBracket] = useState<Bracket>(initialBracket || createEmptyBracket());
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const response = await fetch('/api/tournament');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setTeams(data.teams);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setLoading(false);
    }
  }

  function createEmptyBracket(): Bracket {
    return {
      id: uuidv4(),
      name: 'My Bracket',
      userId: '',
      games: generateEmptyGames(),
      created: new Date(),
      lastUpdated: new Date(),
      completed: false
    };
  }

  function generateEmptyGames(): Game[] {
    const games: Game[] = [];
    let gameId = 1;

    // Generate games for each region
    REGIONS.forEach(region => {
      // First round (32 games)
      for (let i = 0; i < 8; i++) {
        games.push({
          id: `${region}-${gameId}`,
          round: 1,
          region,
          team1: null,
          team2: null,
          winner: null,
          nextGameId: `${region}-${Math.floor(gameId/2) + 16}`,
          gameTime: undefined
        });
        gameId++;
      }
    });

    // Add later rounds
    for (let round = 2; round <= 6; round++) {
      const gamesInRound = 2 ** (6 - round);
      for (let i = 0; i < gamesInRound; i++) {
        games.push({
          id: `R${round}-G${i+1}`,
          round,
          region: round > 4 ? 'Final Four' : REGIONS[Math.floor(i / (gamesInRound/4))],
          team1: null,
          team2: null,
          winner: null,
          nextGameId: round === 6 ? null : `R${round+1}-G${Math.floor(i/2)+1}`,
          gameTime: undefined
        });
      }
    }

    return games;
  }

  function generateMockTeams(): Team[] {
    // This is temporary mock data
    return REGIONS.flatMap((region, regionIndex) => 
      Array.from({ length: 16 }, (_, i) => ({
        id: regionIndex * 16 + i + 1,
        name: `Team ${regionIndex * 16 + i + 1}`,
        seed: i + 1,
        region,
        record: '0-0'
      }))
    );
  }

  function handleTeamSelect(gameId: string, teamNumber: 1 | 2, selectedTeam: Team) {
    const updatedGames = [...bracket.games];
    const gameIndex = updatedGames.findIndex(g => g.id === gameId);
    
    if (gameIndex === -1) return;

    const game = updatedGames[gameIndex];
    if (teamNumber === 1) {
      game.team1 = selectedTeam;
    } else {
      game.team2 = selectedTeam;
    }

    setBracket(prev => ({
      ...prev,
      games: updatedGames,
      lastUpdated: new Date()
    }));
  }

  function handleWinnerSelect(gameId: string, winner: Team) {
    const updatedGames = [...bracket.games];
    const gameIndex = updatedGames.findIndex(g => g.id === gameId);
    
    if (gameIndex === -1) return;

    const game = updatedGames[gameIndex];
    game.winner = winner;

    // If there's a next game, update it
    if (game.nextGameId) {
      const nextGameIndex = updatedGames.findIndex(g => g.id === game.nextGameId);
      if (nextGameIndex !== -1) {
        const nextGame = updatedGames[nextGameIndex];
        // Determine if this winner should be team1 or team2 in the next game
        const isTeam1 = parseInt(gameId.split('-')[1]) % 2 === 1;
        if (isTeam1) {
          nextGame.team1 = winner;
        } else {
          nextGame.team2 = winner;
        }
      }
    }

    setBracket(prev => ({
      ...prev,
      games: updatedGames,
      lastUpdated: new Date()
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGIONS.map(region => (
            <div key={region} className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">{region} Region</h2>
              {bracket.games
                .filter(game => game.region === region && game.round === 1)
                .map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onTeamSelect={handleTeamSelect}
                    onWinnerSelect={handleWinnerSelect}
                    readOnly={readOnly}
                  />
                ))}
            </div>
          ))}
        </div>

        {/* Later Rounds */}
        {[2, 3, 4].map(round => (
          <div key={round} className="grid grid-cols-4 gap-4">
            {bracket.games
              .filter(game => game.round === round)
              .map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onTeamSelect={handleTeamSelect}
                  onWinnerSelect={handleWinnerSelect}
                  readOnly={readOnly}
                />
              ))}
          </div>
        ))}

        {/* Final Four and Championship */}
        <div className="flex justify-center space-x-4">
          {bracket.games
            .filter(game => game.round > 4)
            .map(game => (
              <GameCard
                key={game.id}
                game={game}
                onTeamSelect={handleTeamSelect}
                onWinnerSelect={handleWinnerSelect}
                readOnly={readOnly}
              />
            ))}
        </div>

        {!readOnly && (
          <button
            onClick={() => onSave?.(bracket)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Save Bracket
          </button>
        )}
      </div>
    </div>
  );
}

interface GameCardProps {
  game: Game;
  onTeamSelect: (gameId: string, teamNumber: 1 | 2, team: Team) => void;
  onWinnerSelect: (gameId: string, winner: Team) => void;
  readOnly: boolean;
}

function GameCard({ game, onTeamSelect, onWinnerSelect, readOnly }: GameCardProps) {
  return (
    <div className="border rounded-lg p-2 mb-2 bg-gray-50">
      <div className="flex flex-col space-y-2">
        <TeamSlot
          team={game.team1}
          isWinner={game.winner?.id === game.team1?.id}
          onClick={() => !readOnly && game.team1 && onWinnerSelect(game.id, game.team1)}
        />
        <TeamSlot
          team={game.team2}
          isWinner={game.winner?.id === game.team2?.id}
          onClick={() => !readOnly && game.team2 && onWinnerSelect(game.id, game.team2)}
        />
      </div>
    </div>
  );
}

interface TeamSlotProps {
  team: Team | null;
  isWinner: boolean;
  onClick: () => void;
}

function TeamSlot({ team, isWinner, onClick }: TeamSlotProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-2 rounded cursor-pointer transition-colors
        ${isWinner ? 'bg-green-100 border-green-500' : 'bg-white border-gray-200'}
        ${team ? 'border' : 'border border-dashed'}
        hover:bg-gray-100
      `}
    >
      {team ? (
        <div className="flex items-center space-x-2">
          <span className="font-bold">{team.seed}</span>
          <span>{team.name}</span>
        </div>
      ) : (
        <div className="text-gray-400 text-center">Empty</div>
      )}
    </div>
  );
} 