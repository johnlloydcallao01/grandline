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
        'If an account exists for this email, we have sent a password reset link.'
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
                    <i className="fa fa-anchor text-3xl text-white"></i>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Grandline Maritime</h1>
                  <p className="text-blue-100">Training &amp; Development Center</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fa fa-lock text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Account Security</h3>
                      <p className="text-blue-100 text-sm">
                        Reset your password securely using your verified email address.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fa fa-envelope-open-text text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Verification</h3>
                      <p className="text-blue-100 text-sm">
                        We will send a reset link to your registered email address.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fa fa-shield-alt text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Protected Access</h3>
                      <p className="text-blue-100 text-sm">
                        Your credentials are encrypted and never shared with third parties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-blue-100 text-sm">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-blue-100 text-sm">Secure</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">ISO</div>
                    <div className="text-blue-100 text-sm">Compliant</div>
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
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Forgot your password?
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base">
                    Enter the email associated with your account and we will send you a
                    link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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
                      className="block text-sm font-normal mb-2"
                      style={{ color: '#555' }}
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                      placeholder="john.smith@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a1569] hover:to-[#8b2f36] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
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
                      onClick={() => router.push('/signin')}
                      className="text-[#201a7c] font-semibold hover:text-[#1a1569] transition-colors duration-200"
                    >
                      Back to Sign In
                    </button>
                  </p>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                    <i className="fa fa-shield-alt"></i>
                    <span className="font-medium">Secure &amp; Encrypted</span>
                  </div>
                  <p className="text-xs text-blue-600 text-center mt-1">
                    Your password reset request is handled using industry-standard security
                    practices.
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
