const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball';

export async function getTournamentData() {
  try {
    // This endpoint gets the tournament bracket
    const response = await fetch(`${ESPN_BASE_URL}/scoreboard/tournaments/ncaa`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    throw error;
  }
}

export async function getLiveScores() {
  try {
    // Get all NCAA tournament games
    const response = await fetch(`${ESPN_BASE_URL}/scoreboard`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });
    const data = await response.json();
    return transformGameData(data);
  } catch (error) {
    console.error('Error fetching live scores:', error);
    throw error;
  }
}

export async function getTeamStats(teamId: string) {
  try {
    const response = await fetch(`${ESPN_BASE_URL}/teams/${teamId}/statistics`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching team stats:', error);
    throw error;
  }
}

export async function getGameDetails(gameId: string) {
  try {
    const response = await fetch(`${ESPN_BASE_URL}/summary?event=${gameId}`, {
      next: { revalidate: 30 },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching game details:', error);
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
  const events = data.events?.map((event: any) => {
    const game = event.competitions[0];
    return {
      id: event.id,
      name: event.name,
      shortName: event.shortName,
      status: {
        type: event.status.type.name,
        state: event.status.type.state,
        detail: event.status.type.detail,
        period: event.status.period,
        clock: event.status.displayClock,
      },
      venue: game.venue,
      competitors: game.competitors.map((team: any) => ({
        id: team.id,
        name: team.team.name,
        abbreviation: team.team.abbreviation,
        score: team.score,
        winner: team.winner,
        homeAway: team.homeAway,
        rank: team.curatedRank?.current,
        records: team.records,
        logo: team.team.logo,
        color: team.team.color,
        alternateColor: team.team.alternateColor,
      })),
      broadcasts: game.broadcasts,
      odds: game.odds?.[0],
      notes: game.notes,
      situation: game.situation,
    };
  }) || [];

  return { events };
} 