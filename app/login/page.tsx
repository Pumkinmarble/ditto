'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/home');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8F0' }}>
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8F0' }}>
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div
          className="rounded-2xl shadow-xl p-8 border border-white/20"
          style={{
            background: `
              linear-gradient(90deg,
                rgba(255, 123, 107, 0.03) 0%,
                rgba(168, 85, 247, 0.03) 50%,
                rgba(59, 130, 246, 0.03) 100%
              ),
              linear-gradient(145deg, #FFFFFF, #FFF5E8)
            `
          }}
        >
          <h1 className="text-3xl font-bold text-center mb-4" style={{ color: '#1F2937' }}>
            Welcome to Ditto!
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Create your AI digital twin that lives forever!
          </p>

          {/* Auth0 Login Button */}
          <div className="space-y-4">
            <a
              href="/api/auth/login"
              className="acrylic-button block w-full py-3 rounded-lg font-semibold hover:opacity-90 transition text-center text-gray-800"
            >
              Sign In with Auth0
            </a>

            {/* Google Login - Direct to Google */}
            <a
              href="/api/auth/login?connection=google-oauth2"
              className="block w-full py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-center border border-gray-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>

          {/* Development Only Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500" style={{ backgroundColor: '#FFF8F0' }}>Development Only</span>
            </div>
          </div>

          {/* Dev Mode Bypass Button */}
          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
          >
            Skip Login (Dev Mode)
          </button>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            New to Ditto? Creating an account is automatic on first login.
          </p>
        </div>
      </div>
    </main>
  );
}
