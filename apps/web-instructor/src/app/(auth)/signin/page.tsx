'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicRoute } from '@/components/auth';
import { useLogin } from '@/hooks/useAuth';

type SigninFormData = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useLogin();
  const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInitialFormData = () => {
    const shouldPrefill = process.env.NEXT_PUBLIC_DEBUG_FORMS === 'true';

    if (shouldPrefill) {
      return {
        email: '',
        password: ''
      };
    }

    return {
      email: '',
      password: ''
    };
  };

  const [formData, setFormData] = useState<SigninFormData>(() => getInitialFormData());

  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    } else {
      setErrors({});
    }
  }, [error]);

  const showError = (message: string) => {
    console.error('LOGIN ERROR:', message);
    setErrors({ general: message });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    clearError();

    if (!formData.email || !formData.password) {
      showError('Please fill in all required fields.');
      return;
    }

    if (debug) console.log('ATTEMPTING INSTRUCTOR LOGIN:', formData.email);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      if (debug) console.log('LOGIN SUCCESS - Authentication state will handle redirect');

      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/';

      if (redirectTo !== '/') {
        sessionStorage.setItem('auth:redirectAfterLogin', redirectTo);
      }
    } catch (loginError) {
      console.error('LOGIN ERROR:', loginError);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        {process.env.NEXT_PUBLIC_DEBUG_FORMS === 'true' && (
          <div className="mb-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fa fa-exclamation-triangle text-yellow-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  Debug mode is active for the instructor auth page
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex min-h-screen">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#201a7c] to-[#ab3b43] lg:flex lg:w-2/5">
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
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <i className="fa fa-arrow-left text-white"></i>
                  </button>
                </div>

                <div className="mb-8">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                    <i className="fa fa-chalkboard-teacher text-3xl text-white"></i>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold">Grandline Maritime</h1>
                  <p className="text-blue-100">Instructor Workspace</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <i className="fa fa-book text-sm"></i>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Manage Your Courses</h3>
                      <p className="text-sm text-blue-100">Access your classes, learners, and teaching materials from one dashboard.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <i className="fa fa-tasks text-sm"></i>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Review Work Faster</h3>
                      <p className="text-sm text-blue-100">Keep up with assessments, feedback, and progress monitoring efficiently.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <i className="fa fa-users text-sm"></i>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Support Learners</h3>
                      <p className="text-sm text-blue-100">Stay connected with trainees and keep course delivery organized.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-blue-100">Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">320+</div>
                    <div className="text-sm text-blue-100">Trainees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-blue-100">Focused</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative flex w-full items-center justify-center px-1.5 py-4 lg:w-3/5 lg:p-8"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop&crop=center')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="relative z-10 w-full max-w-lg md:max-w-2xl">
              <div className="mb-8 lg:hidden">
                <button
                  onClick={() => router.back()}
                  className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <i className="fa fa-arrow-left text-gray-600"></i>
                </button>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
                <div className="mb-8 hidden text-center lg:block">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Sign in to continue to your instructor workspace
                  </p>
                </div>

                <div className="mb-6 text-center lg:hidden">
                  <h2 className="mb-1 text-xl font-bold text-gray-900">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-gray-600">
                    Sign in to your instructor workspace
                  </p>
                </div>

                {errors.general && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-normal text-[#555]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-[#201a7c] focus:bg-white focus:ring-2 focus:ring-[#201a7c]/20"
                      placeholder="instructor@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-normal text-[#555]">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 transition-all duration-200 focus:border-[#201a7c] focus:bg-white focus:ring-2 focus:ring-[#201a7c]/20"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                      >
                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <Link
                      href="/signin/forgot-password"
                      className="text-sm font-medium text-[#201a7c] hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full transform rounded-xl bg-gradient-to-r from-[#201a7c] to-[#ab3b43] px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-[#1a1569] hover:to-[#8b2f36] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
                      <span className="bg-white px-4 text-gray-500">Instructor access</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      Need access to the instructor workspace?
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#201a7c]">
                      Contact the Grandline admin team to enable your account
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                    <i className="fa fa-shield-alt"></i>
                    <span className="font-medium">Secure & Encrypted</span>
                  </div>
                  <p className="mt-1 text-center text-xs text-blue-600">
                    Your instructor session is protected with industry-standard encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
