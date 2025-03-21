const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball';

export async function getTournamentGames() {
  try {
    // NCAA Men's Tournament Group ID
    const tournamentGroupId = '100000100';
    const response = await fetch(
      `${ESPN_BASE_URL}/scoreboard?groups=${tournamentGroupId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch tournament data');
    }

    const data = await response.json();
    return transformESPNData(data);
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    throw error;
  }
}

export async function getTeamStats(teamId: string) {
  try {
    const response = await fetch(
      `${ESPN_BASE_URL}/teams/${teamId}/statistics`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch team statistics');
    }

    const data = await response.json();
    return transformTeamStats(data);
  } catch (error) {
    console.error('Error fetching team statistics:', error);
    throw error;
  }
}

function transformESPNData(data: any) {
  return {
    games: data.events.map((event: any) => ({
      id: event.id,
      status: transformGameStatus(event.status.type.name),
      startTime: event.date,
      venue: event.competitions[0]?.venue?.fullName,
      topTeamId: event.competitions[0]?.competitors[0]?.id,
      bottomTeamId: event.competitions[0]?.competitors[1]?.id,
      scores: event.competitions[0] ? {
        topTeam: parseInt(event.competitions[0].competitors[0]?.score || '0'),
        bottomTeam: parseInt(event.competitions[0].competitors[1]?.score || '0'),
        period: event.status.period,
        timeRemaining: event.status.displayClock,
      } : undefined,
      winnerId: event.competitions[0]?.competitors.find((c: any) => c.winner)?.id,
    })),
    teams: data.events.reduce((acc: any, event: any) => {
      event.competitions[0]?.competitors.forEach((team: any) => {
        if (!acc[team.id]) {
          acc[team.id] = {
            id: team.id,
            name: team.team.name,
            seed: parseInt(team.curatedRank?.current || '0'),
            region: team.team.conferenceId, // We'll map this to tournament region
            logo: team.team.logo,
            primaryColor: team.team.color,
            secondaryColor: team.team.alternateColor,
          };
        }
      });
      return acc;
    }, {}),
  };
}

function transformGameStatus(status: string): 'SCHEDULED' | 'LIVE' | 'FINAL' {
  switch (status.toUpperCase()) {
    case 'IN':
      return 'LIVE';
    case 'POST':
      return 'FINAL';
    default:
      return 'SCHEDULED';
  }
}

function transformTeamStats(data: any) {
  const stats = data.stats[0];
  return {
    wins: stats.splits.regularSeason?.wins || 0,
    losses: stats.splits.regularSeason?.losses || 0,
    pointsPerGame: stats.splits.regularSeason?.avgPointsFor || 0,
    pointsAllowedPerGame: stats.splits.regularSeason?.avgPointsAgainst || 0,
    fieldGoalPercentage: stats.splits.regularSeason?.fgPct || 0,
    threePointPercentage: stats.splits.regularSeason?.threePtPct || 0,
    strengthOfSchedule: stats.splits.regularSeason?.strengthOfSchedule || 0,
  };
} 