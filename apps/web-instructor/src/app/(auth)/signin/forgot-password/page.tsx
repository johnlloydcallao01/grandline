'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicRoute } from '@/components/auth';

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData({ email: value });
  };

  const isValidEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(trimmed);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const email = formData.email.trim();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
      const baseWithoutTrailingSlash = apiBase.replace(/\/$/, '');

      const response = await fetch(`${baseWithoutTrailingSlash}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset link');
      }

      setSuccessMessage(
        'If an instructor account exists for this email, we have sent a password reset link.'
      );
    } catch (requestError) {
      console.error('Forgot password request failed:', requestError);
      setError('We could not process your request. Please try again in a few moments.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
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
                    <i className="fa fa-lock text-3xl text-white"></i>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold">Grandline Maritime</h1>
                  <p className="text-blue-100">Instructor Password Recovery</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <i className="fa fa-envelope-open-text text-sm"></i>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Email Verification</h3>
                      <p className="text-sm text-blue-100">
                        We will send a reset link to your registered instructor email address.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <i className="fa fa-shield-alt text-sm"></i>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Protected Access</h3>
                      <p className="text-sm text-blue-100">
                        Your reset request is secured and handled with standard account protection measures.
                      </p>
                    </div>
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
              backgroundRepeat: 'no-repeat',
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
                <div className="mb-6 text-center lg:mb-8">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                    Forgot your password?
                  </h2>
                  <p className="text-sm text-gray-600 lg:text-base">
                    Enter the email associated with your instructor account and we will send you a
                    link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
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

                {successMessage && (
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="fa fa-check-circle text-green-400"></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-normal text-[#555]"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-[#201a7c] focus:bg-white focus:ring-2 focus:ring-[#201a7c]/20"
                      placeholder="instructor@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full transform rounded-xl bg-gradient-to-r from-[#201a7c] to-[#ab3b43] px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-[#1a1569] hover:to-[#8b2f36] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <i className="fa fa-spinner fa-spin mr-2"></i>
                        Sending reset link...
                      </div>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/signin' as any)}
                      className="font-semibold text-[#201a7c] transition-colors duration-200 hover:text-[#1a1569]"
                    >
                      Back to Sign In
                    </button>
                  </p>
                </div>

                <div className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                    <i className="fa fa-shield-alt"></i>
                    <span className="font-medium">Secure & Encrypted</span>
                  </div>
                  <p className="mt-1 text-center text-xs text-blue-600">
                    Your password reset request is handled using industry-standard security practices.
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
