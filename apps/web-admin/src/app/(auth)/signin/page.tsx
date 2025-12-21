'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from '@/components/ui/IconWrapper';
import { PublicRoute } from '@/components/auth';
import { useLogin } from '@/hooks/useAuth';

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const { login, isLoading, error: authError, clearError } = useLogin();
  const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';

  useEffect(() => {
    if (authError) {
      setError(authError);
    } else {
      setError('');
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (debug) console.log('🔐 ATTEMPTING LOGIN:', email);

    try {
      await login({ email, password });

      if (debug) console.log('✅ LOGIN SUCCESS - Authentication state will handle redirect');

      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/dashboard';

      if (redirectTo !== '/dashboard') {
        sessionStorage.setItem('auth:redirectAfterLogin', redirectTo);
      }

      if (debug) console.log('🔄 REDIRECT STORED:', redirectTo);
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
              }}
            ></div>
          </div>

          <div className="relative z-10 flex flex-col px-12 py-5 text-white">
            <div className="max-w-md">
              <div className="mb-6">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <i className="fa fa-arrow-left text-white"></i>
                </button>
              </div>

              <div className="mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <i className="fa fa-shield-alt text-3xl text-white"></i>
                </div>
                <h1 className="text-3xl font-bold mb-2">Grandline Maritime</h1>
                <p className="text-blue-100">Admin Dashboard</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-users-cog text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">User Management</h3>
                    <p className="text-blue-100 text-sm">Manage trainees, instructors, and permissions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-book-open text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Course Oversight</h3>
                    <p className="text-blue-100 text-sm">Review and manage published training content</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-chart-line text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Reports</h3>
                    <p className="text-blue-100 text-sm">Track platform usage and performance metrics</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">Secure</div>
                  <div className="text-blue-100 text-sm">Access</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Role</div>
                  <div className="text-blue-100 text-sm">Gated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Audit</div>
                  <div className="text-blue-100 text-sm">Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full lg:w-3/5 flex items-center justify-center px-1.5 py-4 lg:p-8 relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="w-full max-w-lg md:max-w-2xl relative z-10">
            <div className="lg:hidden mb-8">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center mb-6 hover:shadow-lg transition-shadow"
              >
                <i className="fa fa-arrow-left text-gray-600"></i>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to continue to the admin dashboard</p>
              </div>

              <div className="lg:hidden text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-gray-600 text-sm">Sign in to admin portal</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fa fa-exclamation-circle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a1569] hover:to-[#8b2f36] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <i className="fa fa-spinner fa-spin mr-2"></i>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-600">Need access?</p>
                  <p className="mt-2 text-[#201a7c] font-semibold">
                    Contact your administrator
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                  <i className="fa fa-shield-alt"></i>
                  <span className="font-medium">Secure &amp; Encrypted</span>
                </div>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Admin access is protected with industry-standard security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <PublicRoute redirectTo="/dashboard">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </PublicRoute>
  );
}
