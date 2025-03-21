import { NextResponse } from 'next/server';
import { Team, Region } from '@/types/bracket';
import { getTournamentData } from '@/services/espnApi';

const REGIONS: Region[] = ['East', 'West', 'South', 'Midwest'];

// 2024 NCAA Tournament Teams
const tournamentTeams = {
  "West": [
    { id: "gonzaga", name: "Gonzaga", seed: 1 },
    { id: "baylor", name: "Baylor", seed: 2 },
    { id: "arkansas", name: "Arkansas", seed: 3 },
    { id: "alabama", name: "Alabama", seed: 4 },
    { id: "connecticut", name: "Connecticut", seed: 5 },
    { id: "byu", name: "BYU", seed: 6 },
    { id: "usc", name: "USC", seed: 7 },
    { id: "lsu", name: "LSU", seed: 8 },
    { id: "stmarys", name: "St. Mary's", seed: 9 },
    { id: "virginia", name: "Virginia", seed: 10 },
    { id: "utah", name: "Utah State", seed: 11 },
    { id: "uab", name: "UAB", seed: 12 },
    { id: "vermont", name: "Vermont", seed: 13 },
    { id: "montana", name: "Montana State", seed: 14 },
    { id: "princeton", name: "Princeton", seed: 15 },
    { id: "norfolk", name: "Norfolk State", seed: 16 }
  ],
  "East": [
    { id: "purdue", name: "Purdue", seed: 1 },
    { id: "marquette", name: "Marquette", seed: 2 },
    { id: "kansas", name: "Kansas", seed: 3 },
    { id: "tennessee", name: "Tennessee", seed: 4 },
    { id: "duke", name: "Duke", seed: 5 },
    { id: "kentucky", name: "Kentucky", seed: 6 },
    { id: "michigan", name: "Michigan State", seed: 7 },
    { id: "iowa", name: "Iowa", seed: 8 },
    { id: "memphis", name: "Memphis", seed: 9 },
    { id: "providence", name: "Providence", seed: 10 },
    { id: "ncstate", name: "NC State", seed: 11 },
    { id: "drake", name: "Drake", seed: 12 },
    { id: "yale", name: "Yale", seed: 13 },
    { id: "oakland", name: "Oakland", seed: 14 },
    { id: "vermont", name: "Vermont", seed: 15 },
    { id: "grambling", name: "Grambling", seed: 16 }
  ],
  "South": [
    { id: "houston", name: "Houston", seed: 1 },
    { id: "texas", name: "Texas", seed: 2 },
    { id: "creighton", name: "Creighton", seed: 3 },
    { id: "xavier", name: "Xavier", seed: 4 },
    { id: "miami", name: "Miami (FL)", seed: 5 },
    { id: "tcu", name: "TCU", seed: 6 },
    { id: "missouri", name: "Missouri", seed: 7 },
    { id: "iowa", name: "Iowa", seed: 8 },
    { id: "auburn", name: "Auburn", seed: 9 },
    { id: "utah", name: "Utah State", seed: 10 },
    { id: "ncstate", name: "NC State", seed: 11 },
    { id: "oral", name: "Oral Roberts", seed: 12 },
    { id: "kent", name: "Kent State", seed: 13 },
    { id: "ucsd", name: "UC Santa Barbara", seed: 14 },
    { id: "colgate", name: "Colgate", seed: 15 },
    { id: "northern", name: "Northern Kentucky", seed: 16 }
  ],
  "Midwest": [
    { id: "kansas", name: "Kansas", seed: 1 },
    { id: "ucla", name: "UCLA", seed: 2 },
    { id: "gonzaga", name: "Gonzaga", seed: 3 },
    { id: "indiana", name: "Indiana", seed: 4 },
    { id: "miami", name: "Miami (FL)", seed: 5 },
    { id: "iowa", name: "Iowa State", seed: 6 },
    { id: "texas", name: "Texas A&M", seed: 7 },
    { id: "memphis", name: "Memphis", seed: 8 },
    { id: "auburn", name: "Auburn", seed: 9 },
    { id: "penn", name: "Penn State", seed: 10 },
    { id: "pitt", name: "Pittsburgh", seed: 11 },
    { id: "drake", name: "Drake", seed: 12 },
    { id: "kent", name: "Kent State", seed: 13 },
    { id: "ucsd", name: "UC Santa Barbara", seed: 14 },
    { id: "princeton", name: "Princeton", seed: 15 },
    { id: "howard", name: "Howard", seed: 16 }
  ]
};

// Generate initial tournament structure
function generateTournamentStructure() {
  const regions = Object.keys(tournamentTeams);
  const rounds = ['First Round', 'Second Round', 'Sweet 16', 'Elite Eight', 'Final Four', 'Championship'];
  const structure = {
    rounds,
    regions,
    games: [] as any[]
  };

  // Generate games for each region
  regions.forEach(region => {
    const teams = tournamentTeams[region as keyof typeof tournamentTeams];
    
    // First round games
    for (let i = 0; i < 8; i++) {
      structure.games.push({
        id: `${region}-R1-${i + 1}`,
        round: 1,
        region,
        topTeamId: teams[i].id,
        bottomTeamId: teams[15 - i].id,
        winnerId: null
      });
    }

    // Second round games
    for (let i = 0; i < 4; i++) {
      structure.games.push({
        id: `${region}-R2-${i + 1}`,
        round: 2,
        region,
        topTeamId: null,
        bottomTeamId: null,
        winnerId: null
      });
    }

    // Sweet 16 games
    for (let i = 0; i < 2; i++) {
      structure.games.push({
        id: `${region}-R3-${i + 1}`,
        round: 3,
        region,
        topTeamId: null,
        bottomTeamId: null,
        winnerId: null
      });
    }

    // Elite Eight game
    structure.games.push({
      id: `${region}-R4-1`,
      round: 4,
      region,
      topTeamId: null,
      bottomTeamId: null,
      winnerId: null
    });
  });

  // Final Four games
  structure.games.push(
    {
      id: 'FF-1',
      round: 5,
      region: 'Final Four',
      topTeamId: null,
      bottomTeamId: null,
      winnerId: null
    },
    {
      id: 'FF-2',
      round: 5,
      region: 'Final Four',
      topTeamId: null,
      bottomTeamId: null,
      winnerId: null
    }
  );

  // Championship game
  structure.games.push({
    id: 'CH-1',
    round: 6,
    region: 'Championship',
    topTeamId: null,
    bottomTeamId: null,
    winnerId: null
  });

  return structure;
}

export async function GET() {
  try {
    const structure = generateTournamentStructure();
    return NextResponse.json({
      teams: tournamentTeams,
      structure
    });
  } catch (error) {
    console.error('Error generating tournament structure:', error);
    return NextResponse.json(
      { error: 'Failed to generate tournament structure' },
      { status: 500 }
    );
  }
} 