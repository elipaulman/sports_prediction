import { getProviders } from 'next-auth/react';
import SignInComponent from '@/components/auth/SignInComponent';

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to March Madness Predictor
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to create and manage your brackets
          </p>
        </div>
        <SignInComponent providers={providers} />
      </div>
    </div>
  );
} 