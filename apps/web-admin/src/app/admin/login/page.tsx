'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from '@/components/ui/IconWrapper';
import { AdminAuthCookies } from '@/utils/admin-auth-cookies';
import { useAdminSessionRecovery } from '@/hooks/useAdminSessionRecovery';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 🚀 PROFESSIONAL ADMIN SESSION RECOVERY
  const {
    isRecovering,
    shouldShowAdminApp
  } = useAdminSessionRecovery({
    redirectOnSuccess: '/admin/dashboard',
    enableAutoRecovery: true,
    enableDebugLogging: process.env.NEXT_PUBLIC_DEBUG_ADMIN_AUTH === 'true'
  });

  // Clear any cached values on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  // Show loading while recovering admin session
  if (isRecovering) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-xl border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking admin authentication...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if admin should be redirected to app
  if (shouldShowAdminApp) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('🔐 PayloadCMS admin login initiated...');
      console.log('📧 Email:', email);
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

      // Use PayloadCMS REST API for authentication
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookie handling
      });

      // Log response details for debugging
      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Validate user role - ONLY admin allowed
      if (result.user.role !== 'admin') {
        throw new Error(`Access denied. Admin panel requires admin role. Current role: ${result.user.role}`);
      }

      if (!result.user.isActive) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      console.log('✅ PayloadCMS login successful:', {
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive,
        token: result.token ? 'Present' : 'Missing'
      });

      // 🚀 PROFESSIONAL PERSISTENT ADMIN AUTHENTICATION
      console.log('🍪 All cookies after admin login:', document.cookie);

      if (result.token) {
        console.log('🔐 Setting up persistent admin authentication...');

        // Use professional admin cookie manager for persistent login (30 days)
        AdminAuthCookies.setPersistentAdminLogin(result.token);

        // Verify admin authentication was set
        const isAuthenticated = AdminAuthCookies.isAdminAuthenticated();
        console.log('✅ Persistent admin authentication set:', isAuthenticated);

        // Log admin session info for debugging
        const sessionInfo = AdminAuthCookies.getAdminSessionInfo();
        console.log('📊 Admin Session Info:', sessionInfo);

      } else {
        console.warn('⚠️ No token received from PayloadCMS');
      }

      console.log('🔄 Redirecting to dashboard...');

      // Small delay to ensure cookie is processed
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 100);
    } catch (err: unknown) {
      console.error('❌ Admin login failed:', err);
      const errorMessage = (err as Error)?.message || 'Authentication failed. Please check your credentials and ensure you have admin privileges.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Authentication Failed</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-gray-900 bg-white"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-gray-900 bg-white"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Use your admin credentials to access the CMS dashboard
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Admin and Instructor roles only
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
