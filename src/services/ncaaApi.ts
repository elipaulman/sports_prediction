const NCAA_API_BASE_URL = 'https://ncaa-api.henrygd.me';

export async function getLiveScores() {
  try {
    // Get current date for the API endpoint
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const response = await fetch(
      `${NCAA_API_BASE_URL}/scoreboard/basketball-men/d1/${year}/${month}/all-conf`,
      {
        next: { revalidate: 30 }, // Revalidate every 30 seconds
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return transformGameData(data);
  } catch (error) {
    console.error('Error fetching live scores:', error);
    throw error;
  }
}

interface TransformedGame {
  id: string;
  name: string;
  shortName: string;
  status: {
    type: string;
    state: string;
    detail: string;
    period: number;
    clock?: string;
  };
  venue: {
    name: string;
    city: string;
    state: string;
  };
  competitors: {
    id: string;
    name: string;
    abbreviation: string;
    score: string;
    winner: boolean;
    homeAway: string;
    rank?: number;
    records?: {
      type: string;
      summary: string;
    }[];
    logo?: string;
    color?: string;
    alternateColor?: string;
  }[];
  broadcasts?: {
    name: string;
    type: string;
  }[];
  odds?: {
    spread: string;
    overUnder: string;
  };
  notes?: string[];
  situation?: {
    possession?: string;
    lastPlay?: string;
  };
}

function transformGameData(data: any): { events: TransformedGame[] } {
  if (!data.games || !Array.isArray(data.games)) {
    return { events: [] };
  }

  const events = data.games.map((gameWrapper: any) => {
    const game = gameWrapper.game;
    if (!game) return null;

    const homeTeam = {
      id: game.gameID,
      name: game.home.names.full,
      abbreviation: game.home.names.short,
      score: game.home.score,
      winner: game.home.winner,
      homeAway: 'home',
      rank: game.home.rank ? parseInt(game.home.rank) : undefined,
      records: game.home.description ? [{
        type: 'overall',
        summary: game.home.description
      }] : undefined,
      logo: `https://a.espncdn.com/i/teamlogos/ncaa/500/${game.gameID}.png`
    };

    const awayTeam = {
      id: game.gameID,
      name: game.away.names.full,
      abbreviation: game.away.names.short,
      score: game.away.score,
      winner: game.away.winner,
      homeAway: 'away',
      rank: game.away.rank ? parseInt(game.away.rank) : undefined,
      records: game.away.description ? [{
        type: 'overall',
        summary: game.away.description
      }] : undefined,
      logo: `https://a.espncdn.com/i/teamlogos/ncaa/500/${game.gameID}.png`
    };

    const gameState = game.gameState === 'final' ? 'post' :
                     game.gameState === 'live' ? 'in' : 'pre';

    return {
      id: game.gameID,
      name: `${game.away.names.full} at ${game.home.names.full}`,
      shortName: game.title || `${game.away.names.short} @ ${game.home.names.short}`,
      status: {
        type: game.gameState,
        state: gameState,
        detail: game.finalMessage || game.currentPeriod || game.startTime,
        period: parseInt(game.currentPeriod) || 0,
        clock: game.contestClock
      },
      venue: {
        name: game.venue?.name || 'TBD',
        city: game.venue?.city || '',
        state: game.venue?.state || ''
      },
      competitors: [homeTeam, awayTeam],
      broadcasts: game.network ? [{ name: game.network, type: 'TV' }] : undefined
    };
  }).filter(Boolean);

  return { events };
} 