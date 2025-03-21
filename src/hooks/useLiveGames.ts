import useSWR, { KeyedMutator } from 'swr';
import { Game, APIResponse } from '@/types';

interface UseLiveGamesOptions {
  region?: string;
  status?: 'SCHEDULED' | 'LIVE' | 'FINAL';
  limit?: number;
}

interface UseLiveGamesReturn {
  games: Game[];
  isLoading: boolean;
  isError: boolean;
  mutate: KeyedMutator<Game[]>;
}

async function fetcher(url: string): Promise<Game[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }
  const data: APIResponse<Game[]> = await response.json();
  return data.data || [];
}

export function useLiveGames(options: UseLiveGamesOptions = {}): UseLiveGamesReturn {
  const { region, status, limit } = options;
  
  // Build query parameters
  const params = new URLSearchParams();
  if (region) params.append('region', region);
  if (status) params.append('status', status);
  if (limit) params.append('limit', limit.toString());
  
  const queryString = params.toString();
  const url = `/api/games${queryString ? `?${queryString}` : ''}`;
  
  const { data: games = [], error, mutate } = useSWR<Game[]>(url, fetcher, {
    refreshInterval: status === 'LIVE' ? 30000 : 0, // Refresh every 30 seconds for live games
  });
  
  return {
    games,
    isLoading: !games && !error,
    isError: !!error,
    mutate,
  };
} 