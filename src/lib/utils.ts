import { Game, Team, Bracket, GameStatus } from '@/types';

/**
 * Calculate win probability based on team stats and historical data
 */
export function calculateWinProbability(team1: Team, team2: Team): number {
  // Simple probability calculation based on seed difference
  // In a real implementation, this would use more sophisticated analytics
  const seedDiff = Math.abs(team1.seed - team2.seed);
  const baseProbability = team1.seed < team2.seed ? 0.6 : 0.4;
  const seedAdjustment = seedDiff * 0.05;
  
  return Math.min(Math.max(baseProbability + seedAdjustment, 0.1), 0.9);
}

/**
 * Format a game time string based on status
 */
export function formatGameTime(game: Game): string {
  if (game.status === 'FINAL') {
    return 'Final';
  }
  
  if (game.status === 'LIVE') {
    if (game.scores?.timeRemaining) {
      return `${game.scores.period}${getOrdinalSuffix(game.scores.period)} - ${game.scores.timeRemaining}`;
    }
    return 'Live';
  }
  
  const gameTime = new Date(game.startTime);
  return gameTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Calculate bracket score based on correct predictions
 */
export function calculateBracketScore(bracket: Bracket, games: Game[]): number {
  let score = 0;
  const roundMultipliers = [10, 20, 40, 80, 160, 320]; // Points double each round
  
  for (const game of games) {
    if (game.status === 'FINAL' && game.winnerId) {
      const prediction = bracket.predictions[game.id];
      if (prediction === game.winnerId) {
        score += roundMultipliers[game.round - 1] || 0;
      }
    }
  }
  
  return score;
}

/**
 * Calculate maximum possible remaining score for a bracket
 */
export function calculateMaxPossibleScore(bracket: Bracket, games: Game[]): number {
  let maxScore = calculateBracketScore(bracket, games);
  const roundMultipliers = [10, 20, 40, 80, 160, 320];
  
  for (const game of games) {
    if (game.status !== 'FINAL' && bracket.predictions[game.id]) {
      maxScore += roundMultipliers[game.round - 1] || 0;
    }
  }
  
  return maxScore;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get color classes based on subscription tier
 */
export function getSubscriptionColors(tier: string): { text: string; bg: string } {
  switch (tier.toLowerCase()) {
    case 'premium':
      return { text: 'text-primary', bg: 'bg-primary/10' };
    case 'pro':
      return { text: 'text-accent', bg: 'bg-accent/10' };
    default:
      return { text: 'text-gray-600', bg: 'bg-gray-100' };
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Generate a random string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Check if a game is an upset (lower seed beats higher seed)
 */
export function isUpset(game: Game, teams: { [key: string]: Team }): boolean {
  if (game.status !== 'FINAL' || !game.winnerId) return false;
  
  const winner = teams[game.winnerId];
  const loser = teams[game.winnerId === game.topTeamId ? game.bottomTeamId : game.topTeamId];
  
  return winner.seed > loser.seed;
}

/**
 * Get game status with appropriate styling classes
 */
export function getGameStatusClasses(status: GameStatus): { text: string; bg: string } {
  switch (status) {
    case 'LIVE':
      return { text: 'text-alert', bg: 'bg-alert/10' };
    case 'FINAL':
      return { text: 'text-accent', bg: 'bg-accent/10' };
    default:
      return { text: 'text-gray-600', bg: 'bg-gray-100' };
  }
} 