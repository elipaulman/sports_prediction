'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

interface SignInComponentProps {
  providers: Record<string, Provider> | null;
}

export default function SignInComponent({ providers }: SignInComponentProps) {
  return (
    <div className="mt-8 space-y-6">
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name} className="flex justify-center">
            <button
              onClick={() => signIn(provider.id, { callbackUrl: '/' })}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-gray-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Image
                  src="/google.svg"
                  alt="Google Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </span>
              Sign in with {provider.name}
            </button>
          </div>
        ))}
    </div>
  );
} 