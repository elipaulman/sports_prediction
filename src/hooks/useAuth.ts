import { useSession, signIn, signOut } from 'next-auth/react';
import useSWR from 'swr';
import { User, APIResponse } from '@/types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  login: (provider?: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

async function fetcher(url: string): Promise<User> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  const data: APIResponse<User> = await response.json();
  if (!data.data) {
    throw new Error('No user data received');
  }
  return data.data;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  
  // Only fetch user data if we have a session
  const { data: user, error, mutate } = useSWR<User>(
    session ? '/api/user' : null,
    fetcher
  );
  
  const isLoading = status === 'loading' || (!user && !error && status === 'authenticated');
  const isAuthenticated = !!session && !!user;
  
  const login = async (provider: string = 'google') => {
    try {
      await signIn(provider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      // Update local data
      await mutate();
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };
  
  return {
    user: user || null,
    isLoading,
    isError: !!error,
    isAuthenticated,
    login,
    logout,
    updatePreferences,
  };
}

// Helper hook for subscription status
export function useSubscription(): {
  isSubscribed: boolean;
  tier: string;
  isLoading: boolean;
  subscribe: (tier: string) => Promise<void>;
} {
  const { user, isLoading } = useAuth();
  
  const subscribe = async (tier: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate subscription');
      }
      
      const data = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  };
  
  return {
    isSubscribed: !!user?.subscription && user.subscription !== 'FREE',
    tier: user?.subscription || 'FREE',
    isLoading,
    subscribe,
  };
} 