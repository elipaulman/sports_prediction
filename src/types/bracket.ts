export interface Team {
  id: string;
  name: string;
  seed: number;
}

export interface Game {
  id: string;
  round: number;
  region: string;
  topTeamId: string | null;
  bottomTeamId: string | null;
  winnerId: string | null;
}

export interface Bracket {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  predictions: {
    [key: string]: string | null;
  };
  status: 'DRAFT' | 'SUBMITTED' | 'COMPLETED';
}

export type Region = 'East' | 'West' | 'South' | 'Midwest';
export type Round = 'First Round' | 'Second Round' | 'Sweet 16' | 'Elite Eight' | 'Final Four' | 'Championship';

export interface BracketBuilderProps {
  initialBracket?: Bracket;
  onSave?: (bracket: Bracket) => void;
  readOnly?: boolean;
} 