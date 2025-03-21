import useSWR from 'swr';
import { Bracket, Game, APIResponse } from '@/types';
import { calculateBracketScore, calculateMaxPossibleScore } from '@/lib/utils';

interface UseBracketOptions {
  includeGames?: boolean;
}

interface UseBracketReturn {
  bracket: Bracket | null;
  games: Game[];
  score: number;
  maxPossibleScore: number;
  isLoading: boolean;
  isError: boolean;
  updatePrediction: (gameId: string, teamId: string) => Promise<void>;
  submitBracket: () => Promise<void>;
}

async function fetcher(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data: APIResponse<any> = await response.json();
  return data.data;
}

export function useBracket(bracketId: string, options: UseBracketOptions = {}): UseBracketReturn {
  const { includeGames = true } = options;
  
  // Fetch bracket data
  const { data: bracket, error: bracketError, mutate: mutateBracket } = useSWR<Bracket>(
    bracketId ? `/api/brackets/${bracketId}` : null,
    fetcher
  );
  
  // Fetch games if needed
  const { data: games = [], error: gamesError } = useSWR<Game[]>(
    includeGames ? '/api/games' : null,
    fetcher
  );
  
  const isLoading = (!bracket && !bracketError) || (includeGames && !games && !gamesError);
  const isError = !!bracketError || (includeGames && !!gamesError);
  
  // Calculate scores
  const score = bracket ? calculateBracketScore(bracket, games) : 0;
  const maxPossibleScore = bracket ? calculateMaxPossibleScore(bracket, games) : 0;
  
  // Update a prediction
  const updatePrediction = async (gameId: string, teamId: string) => {
    if (!bracket) return;
    
    try {
      const response = await fetch(`/api/brackets/${bracketId}/predictions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, teamId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update prediction');
      }
      
      // Update local data
      await mutateBracket();
    } catch (error) {
      console.error('Error updating prediction:', error);
      throw error;
    }
  };
  
  // Submit bracket
  const submitBracket = async () => {
    if (!bracket) return;
    
    try {
      const response = await fetch(`/api/brackets/${bracketId}/submit`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit bracket');
      }
      
      // Update local data
      await mutateBracket();
    } catch (error) {
      console.error('Error submitting bracket:', error);
      throw error;
    }
  };
  
  return {
    bracket: bracket || null,
    games,
    score,
    maxPossibleScore,
    isLoading,
    isError,
    updatePrediction,
    submitBracket,
  };
}

// Helper hook for user's brackets
export function useUserBrackets(): {
  brackets: Bracket[];
  isLoading: boolean;
  isError: boolean;
  createBracket: (name: string) => Promise<string>;
} {
  const { data: brackets = [], error, mutate } = useSWR<Bracket[]>(
    '/api/brackets',
    fetcher
  );
  
  const createBracket = async (name: string): Promise<string> => {
    try {
      const response = await fetch('/api/brackets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create bracket');
      }
      
      const data: APIResponse<Bracket> = await response.json();
      if (!data.data) {
        throw new Error('No bracket data received');
      }
      
      // Update local data
      await mutate();
      
      return data.data.id;
    } catch (error) {
      console.error('Error creating bracket:', error);
      throw error;
    }
  };
  
  return {
    brackets,
    isLoading: !error && !brackets,
    isError: !!error,
    createBracket,
  };
} 