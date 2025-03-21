'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            <p className="font-medium text-red-600">
              {error === 'Configuration' && 'There is a problem with the server configuration.'}
              {error === 'AccessDenied' && 'You do not have permission to sign in.'}
              {error === 'Verification' && 'The sign in link is no longer valid.'}
              {!error && 'An unknown error occurred.'}
            </p>
            <p className="mt-4">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 