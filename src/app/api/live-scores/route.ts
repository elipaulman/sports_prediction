import { NextResponse } from 'next/server';
import axios from 'axios';
import { Game } from '@/types';

const NCAA_API_BASE = 'https://ncaa-api.henrygd.me';

interface NCAAGame {
  game: {
    away: {
      score: string;
      names: {
        short: string;
        full: string;
      };
      winner: boolean;
      seed: string;
      description: string;
      rank?: string;
    };
    home: {
      score: string;
      names: {
        short: string;
        full: string;
      };
      winner: boolean;
      seed: string;
      description: string;
      rank?: string;
    };
    gameID: string;
    finalMessage: string;
    network: string;
    startTime: string;
    gameState: string;
    currentPeriod: string;
    contestClock: string;
  };
}

async function getLiveScores(): Promise<{ events: Game[] }> {
  try {
    // Get today's date in YYYY/MM/DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}/${month}/${day}`;

    const response = await axios.get(`${NCAA_API_BASE}/scoreboard/basketball-men/d1/${dateStr}/all-conf`);
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const games: Game[] = response.data.games.map((item: NCAAGame) => {
      const { game } = item;
      const homeTeam = game.home;
      const awayTeam = game.away;
      
      return {
        id: game.gameID,
        name: `${awayTeam.names.short} at ${homeTeam.names.short}`,
        shortName: `${awayTeam.names.short} @ ${homeTeam.names.short}`,
        status: {
          type: game.gameState,
          state: game.gameState === 'final' ? 'post' :
                 game.gameState === 'live' ? 'in' : 'pre',
          detail: game.currentPeriod === 'FINAL' ? game.finalMessage : `${game.currentPeriod} ${game.contestClock}`,
          period: game.currentPeriod === 'FINAL' ? 2 : 
                 game.currentPeriod === 'Halftime' ? 1 : 
                 parseInt(game.currentPeriod) || 0,
          clock: game.contestClock
        },
        venue: {
          name: '',
          city: '',
          state: ''
        },
        competitors: [
          {
            id: `home-${game.gameID}`,
            name: homeTeam.names.full,
            abbreviation: homeTeam.names.short,
            score: homeTeam.score,
            winner: homeTeam.winner,
            homeAway: 'home',
            rank: homeTeam.rank ? parseInt(homeTeam.rank) : undefined,
            records: homeTeam.description ? [{
              type: 'overall',
              summary: homeTeam.description
            }] : undefined,
            logo: `https://www.ncaa.com/sites/default/files/images/team-logos/${homeTeam.names.short.toLowerCase().replace(/[^a-z0-9]/g, '')}.svg`
          },
          {
            id: `away-${game.gameID}`,
            name: awayTeam.names.full,
            abbreviation: awayTeam.names.short,
            score: awayTeam.score,
            winner: awayTeam.winner,
            homeAway: 'away',
            rank: awayTeam.rank ? parseInt(awayTeam.rank) : undefined,
            records: awayTeam.description ? [{
              type: 'overall',
              summary: awayTeam.description
            }] : undefined,
            logo: `https://www.ncaa.com/sites/default/files/images/team-logos/${awayTeam.names.short.toLowerCase().replace(/[^a-z0-9]/g, '')}.svg`
          }
        ],
        broadcasts: game.network ? [{
          name: game.network,
          type: 'TV'
        }] : undefined
      };
    });

    return { events: games };
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return { events: [] };
  }
}

export async function GET() {
  const data = await getLiveScores();
  return NextResponse.json(data);
} 