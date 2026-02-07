'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleBypass = () => {
    router.push('/home');
  };

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
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#1F2937' }}>
            Welcome Back
          </h1>

          {/* Login Form Placeholder */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition">
              Sign In
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Development</span>
            </div>
          </div>

          {/* Bypass Button for Dev */}
          <button
            onClick={handleBypass}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
          >
            🚀 Skip Login (Dev Mode)
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-purple-600 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
