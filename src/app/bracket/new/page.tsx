import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import BracketBuilder from '@/components/bracket/BracketBuilder';

export default async function NewBracket() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Bracket</h1>
      <BracketBuilder userId={session.user.id} />
    </div>
  );
} 