'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicRoute } from '@/components/auth';

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

function validatePassword(value: string): string | null {
  if (value.length < 8 || value.length > 40) {
    return 'Password must be between 8 and 40 characters.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/\d/.test(value)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasToken = token.trim().length > 0;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!hasToken) {
      setError('Invalid or missing reset link. Please request a new password reset email.');
      return;
    }

    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
      const baseWithoutTrailingSlash = apiBase.replace(/\/$/, '');

      const response = await fetch(`${baseWithoutTrailingSlash}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        let message = 'We could not reset your password. Please try again.';

        try {
          const data = await response.json();
          if (typeof data?.message === 'string' && data.message.trim().length > 0) {
            message = data.message;
          } else if (Array.isArray(data?.errors) && data.errors[0]?.message) {
            message = String(data.errors[0].message);
          }
        } catch (parseError) {
          console.error('Failed to parse reset password error response:', parseError);
        }

        setError(message);
        return;
      }

      setSuccessMessage('Your password has been reset successfully. Redirecting to sign in...');

      setTimeout(() => {
        router.push('/signin');
      }, 2500);
    } catch (requestError) {
      console.error('Reset password request failed:', requestError);
      setError('We could not process your request. Please try again in a few moments.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showInvalidState = !hasToken && !successMessage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] relative overflow-hidden">
          <div className="relative z-10 flex flex-col px-12 py-5 text-white">
            <div className="max-w-md">
              <div className="mb-6">
                <button
                  type="button"
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
                    <h3 className="font-semibold mb-1">Secure Reset</h3>
                    <p className="text-blue-100 text-sm">
                      Your new password is encrypted and never shared with third parties.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-shield-alt text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Strong Security</h3>
                    <p className="text-blue-100 text-sm">
                      Use a unique, strong password to protect your maritime training records.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa fa-check-circle text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">One-time Link</h3>
                    <p className="text-blue-100 text-sm">
                      This reset link can only be used once and expires after a short period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8">
          <div className="w-full max-w-lg">
            <div className="lg:hidden mb-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center mb-6 hover:shadow-lg transition-shadow"
              >
                <i className="fa fa-arrow-left text-gray-600"></i>
              </button>
            </div>

            {showInvalidState ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Invalid reset link
                </h2>
                <p className="text-gray-600 mb-6">
                  The password reset link is invalid or has expired. Please request a new reset
                  link.
                </p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    router.push('/signin/forgot-password');
                  }}
                >
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#1a1569] hover:to-[#8b2f36] transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Request new reset link
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Set a new password
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base">
                    Choose a strong password to secure your Grandline Maritime account.
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

                {!successMessage && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-blue-800">
                        Password must be 8–40 characters and include at least one uppercase letter,
                        one number, and one special character.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-normal mb-2"
                          style={{ color: '#555' }}
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((previous) => !previous)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <i
                              className={
                                showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'
                              }
                            ></i>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-normal mb-2"
                          style={{ color: '#555' }}
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                            placeholder="Re-enter new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((previous) => !previous)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <i
                              className={
                                showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'
                              }
                            ></i>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a1569] hover:to-[#8b2f36] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <i className="fa fa-spinner fa-spin mr-2"></i>
                            Updating password...
                          </div>
                        ) : (
                          'Update password'
                        )}
                      </button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-600">
                        Remember your password?
                        <button
                          type="button"
                          onClick={() => router.push('/signin')}
                          className="ml-1 text-[#201a7c] font-semibold hover:text-[#1a1569] transition-colors duration-200"
                        >
                          Back to Sign In
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                <i className="fa fa-shield-alt"></i>
                <span className="font-medium">Secure &amp; Encrypted</span>
              </div>
              <p className="text-xs text-blue-600 text-center mt-1">
                Your new password is processed using industry-standard security practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3">
                <i className="fa fa-spinner fa-spin text-[#201a7c]"></i>
                <p className="text-gray-700 text-sm">Loading reset password...</p>
              </div>
            </div>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </PublicRoute>
  );
}
