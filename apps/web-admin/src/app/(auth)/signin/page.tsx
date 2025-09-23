'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from '@/components/ui/IconWrapper';
import { useAuth } from '@/hooks/useAuth';
import { PublicRoute } from '@/components/auth';
import { AuthenticationError } from '@/lib/auth';

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error: authError, clearError } = useAuth();

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Clear form and errors on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    clearError();
  }, [clearError]);

  // Update error state when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    clearError();

    try {
      console.log('🔐 Admin login initiated...');
      console.log('📧 Email:', email);

      await login({ email, password });

      console.log('✅ Login successful');
      console.log('🔄 Redirecting to:', redirectTo);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        router.push(redirectTo);
      }, 100);
    } catch (err: unknown) {
      console.error('❌ Login failed:', err);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err instanceof AuthenticationError) {
        switch (err.type) {
          case 'INVALID_CREDENTIALS':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'ACCESS_DENIED':
            errorMessage = 'Access denied. This application is restricted to admin users only.';
            break;
          case 'ACCOUNT_LOCKED':
            errorMessage = 'Account temporarily locked due to multiple failed attempts. Please try again later.';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-start pt-16 px-12 text-white">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-xl border border-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-5 leading-tight">
              Encreasl Admin
            </h1>
            <p className="text-2xl text-red-100 mb-8">
              Content Management System
            </p>
            <p className="text-lg text-red-200/80 leading-relaxed max-w-md">
              Secure access to your administrative dashboard with comprehensive content management tools.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <span className="text-red-100 text-base">Content Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <span className="text-red-100 text-base">User Administration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <span className="text-red-100 text-base">Analytics Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Encreasl Admin
            </h1>
            <p className="text-gray-600">
              Sign in to access the CMS
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to your admin account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                    required
                    disabled={isFormDisabled}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your password"
                      required
                      disabled={isFormDisabled}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                      disabled={isFormDisabled}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isFormDisabled || !email.trim() || !password.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isFormDisabled ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact your administrator
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © 2024 Encreasl Admin. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <PublicRoute redirectTo="/dashboard">
      <AdminLoginForm />
    </PublicRoute>
  );
}
