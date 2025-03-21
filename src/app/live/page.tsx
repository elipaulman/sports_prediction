import LiveScores from '@/components/LiveScores';

export const metadata = {
  title: 'Live Scores - March Madness Predictor',
  description: 'Real-time scores and updates for March Madness games',
};

export default function LiveScoresPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <LiveScores />
    </main>
  );
} 