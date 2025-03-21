// Team Types
export interface Team {
  id: string;
  name: string;
  seed: number;
  region: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  stats: TeamStats;
}

export interface TeamStats {
  wins: number;
  losses: number;
  pointsPerGame: number;
  pointsAllowedPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  strengthOfSchedule: number;
  lastTenGames: GameResult[];
}

// Game Types
export interface Game {
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
  }[];
  broadcasts?: {
    name: string;
    type: string;
  }[];
}

export type GameStatus = 'SCHEDULED' | 'LIVE' | 'FINAL';

export interface GameScores {
  topTeam: number;
  bottomTeam: number;
  period: number;
  timeRemaining?: string;
}

export interface GameStats {
  topTeam: TeamGameStats;
  bottomTeam: TeamGameStats;
}

export interface TeamGameStats {
  fieldGoals: string;
  threePointers: string;
  freeThrows: string;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

export type GameResult = 'W' | 'L';

// Bracket Types
export interface Bracket {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  predictions: { [gameId: string]: string }; // gameId -> winning teamId
  score?: number;
  maxPossibleScore?: number;
  status: BracketStatus;
}

export type BracketStatus = 'DRAFT' | 'SUBMITTED' | 'LOCKED' | 'COMPLETED';

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  subscription?: SubscriptionTier;
  brackets: string[]; // bracket IDs
  preferences: UserPreferences;
  stripeCustomerId?: string;
}

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PRO';

export interface UserPreferences {
  notifications: NotificationPreferences;
  favoriteTeams: string[]; // team IDs
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  gameStart: boolean;
  upsets: boolean;
  bracketUpdates: boolean;
}

// API Response Types
export interface APIResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
} 