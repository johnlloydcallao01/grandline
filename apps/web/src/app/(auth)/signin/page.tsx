'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { validateUserRegistration, type FlatUserRegistrationData } from '@/server/validators/user-registration-schemas';

// Simple signin form data type
type SigninFormData = {
  email: string;
  password: string;
};



/**
 * Modern Professional Sign In / Sign Up Page
 * Responsive design with split layout for desktop and mobile-optimized forms
 */

export default function SignInPage() {
  const router = useRouter();

  // 🚀 ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [isSignUp] = useState(false); // Always false for signin page
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get initial form data - simplified for signin only
  const getInitialFormData = () => {
    const shouldPrefill = process.env.NEXT_PUBLIC_DEBUG_FORMS === 'true';

    if (shouldPrefill) {
      return {
        email: 'carlos@gmail.com',
        password: '@Iamachessgrandmaster23'
      };
    }

    return {
      email: '',
      password: ''
    };
  };

  const [formData, setFormData] = useState<SigninFormData>(() => getInitialFormData());

  // Professional error handling - no popup alerts
  const showError = (message: string) => {
    console.error('❌ LOGIN ERROR:', message);
    // Set error state instead of showing alert
    setErrors({ general: message });
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Use PayloadCMS REST API for authentication
      const response = await fetch('https://grandline-cms.vercel.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: 'include', // Important for cookie handling
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Validate user role - ONLY trainee allowed
      if (result.user.role !== 'trainee') {
        throw new Error(`Access denied. Trainee portal requires trainee role. Current role: ${result.user.role}`);
      }

      if (!result.user.isActive) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Set session cookie for this domain
      if (result.token) {
        // Set the payload-token cookie as session cookie (expires when browser closes)
        document.cookie = `payload-token=${result.token}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;

        console.log('✅ LOGIN: Session cookie set successfully for domain:', window.location.hostname);
      }

      // Simple redirect after login
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        if (redirectTo) {
          router.push(redirectTo as any);
        } else {
          router.push('/');
        }
      }, 100);
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'Authentication failed. Please check your credentials and ensure you have trainee privileges.';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Debug Mode Indicator */}
      {process.env.NEXT_PUBLIC_DEBUG_FORMS === 'true' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fa fa-exclamation-triangle text-yellow-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                🚧 Debug Mode Active: Forms are pre-filled with test data
              </p>
              <p className="text-xs mt-1">
                Set NEXT_PUBLIC_DEBUG_FORMS=false in .env.local to disable
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Split Layout */}
      <div className="min-h-screen flex">
        {/* Left Side - Branding & Info (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
            }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col px-12 py-5 text-white">
            <div className="max-w-md">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <i className="fa fa-arrow-left text-white"></i>
                </button>
              </div>

              {/* Logo */}
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <i className="fa fa-anchor text-3xl text-white"></i>
                </div>
                <h1 className="text-3xl font-bold mb-2">Grandline Maritime</h1>
                <p className="text-blue-100">Training & Development Center</p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-graduation-cap text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Professional Training</h3>
                    <p className="text-blue-100 text-sm">IMO certified courses designed by industry experts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-certificate text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Industry Recognition</h3>
                    <p className="text-blue-100 text-sm">Globally recognized certifications for career advancement</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-users text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Expert Instructors</h3>
                    <p className="text-blue-100 text-sm">Learn from experienced captains and chief officers</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">5000+</div>
                  <div className="text-blue-100 text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-blue-100 text-sm">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-blue-100 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div
          className="w-full lg:w-3/5 flex items-center justify-center px-1.5 py-4 lg:p-8 relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="w-full max-w-lg md:max-w-2xl relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center mb-6 hover:shadow-lg transition-shadow"
              >
                <i className="fa fa-arrow-left text-gray-600"></i>
              </button>

            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to continue your learning journey
                </p>
              </div>

              {/* Mobile Form Header */}
              <div className="lg:hidden text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-sm">
                  Sign in to your portal
                </p>
              </div>

              {/* General Error/Success Messages */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fa fa-exclamation-circle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {errors.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fa fa-check-circle text-green-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">{errors.success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">


                {/* Sign In Fields - Email and Password for sign in only */}
                {!isSignUp && (
                  <>
                    <div>
                      <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                        placeholder="john.smith@example.com"
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
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Forgot Password (Sign In only) */}
                {!isSignUp && (
                  <div className="text-right">
                    <a href="#" className="text-sm text-[#201a7c] hover:underline font-medium">
                      Forgot your password?
                    </a>
                  </div>
                )}

                {/* Submit Button */}
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

              {/* Toggle Form */}
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
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?
                  </p>
                  <button
                    onClick={navigateToRegister}
                    className="mt-2 text-[#201a7c] font-semibold hover:text-[#1a1569] transition-colors duration-200"
                  >
                    Create New Account
                  </button>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                  <i className="fa fa-shield-alt"></i>
                  <span className="font-medium">Secure & Encrypted</span>
                </div>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Your data is protected with industry-standard encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
