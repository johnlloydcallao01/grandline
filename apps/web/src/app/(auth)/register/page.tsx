'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { validateUserRegistration, type FlatUserRegistrationData } from '@/server/validators/user-registration-schemas';

/**
 * Modern Professional Registration Page
 * Responsive design with split layout for desktop and mobile-optimized forms
 */

export default function RegisterPage() {
  const router = useRouter();

  // 🚀 ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [isSignUp] = useState(true); // Always true for register page
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get initial form data
  const getInitialFormData = () => {
    const shouldPrefill = process.env.NEXT_PUBLIC_DEBUG_FORMS === 'true';

    if (shouldPrefill) {
      return {
        // Personal Information
        firstName: 'Juan',
        middleName: 'Ponze',
        lastName: 'Enrile',
        nameExtension: 'Jr',
        gender: 'male' as const,
        civilStatus: 'single' as const,
        srn: 'SRN-343',
        nationality: 'Filipino',
        birthDate: '2000-12-28',
        placeOfBirth: 'Manila, Philippines',
        completeAddress: 'Manila, Philippines',

        // Contact Information
        email: 'carlos@gmail.com',
        phoneNumber: '+639092809767',

        // Username & Password
        username: 'juancarlos',
        password: '@Iamachessgrandmaster23',
        confirmPassword: '@Iamachessgrandmaster23',

        // Marketing
        couponCode: '',
        referralSource: 'social_media',

        // Emergency Contact
        emergencyFirstName: 'Maria',
        emergencyMiddleName: 'Santos',
        emergencyLastName: 'Enrile',
        emergencyContactNumber: '+639092809768',
        emergencyRelationship: 'parent',
        emergencyCompleteAddress: 'Manila, Philippines',

        // Terms
        agreeToTerms: true,
      };
    }

    return {
      // Personal Information
      firstName: '',
      middleName: '',
      lastName: '',
      nameExtension: '',
      gender: '' as any,
      civilStatus: '' as any,
      srn: '',
      nationality: '',
      birthDate: '',
      placeOfBirth: '',
      completeAddress: '',

      // Contact Information
      email: '',
      phoneNumber: '',

      // Username & Password
      username: '',
      password: '',
      confirmPassword: '',

      // Marketing
      couponCode: '',
      referralSource: '',

      // Emergency Contact
      emergencyFirstName: '',
      emergencyMiddleName: '',
      emergencyLastName: '',
      emergencyContactNumber: '',
      emergencyRelationship: '',
      emergencyCompleteAddress: '',

      // Terms
      agreeToTerms: false,
    };
  };

  const [formData, setFormData] = useState<FlatUserRegistrationData>(getInitialFormData());

  // Dropdown options for form fields
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  const civilStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' }
  ];

  const referralSourceOptions = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'search_engine', label: 'Search Engine' },
    { value: 'friend_referral', label: 'Friend Referral' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'relative', label: 'Relative' },
    { value: 'other', label: 'Other' }
  ];

  const relationshipOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'relative', label: 'Relative' },
    { value: 'other', label: 'Other' }
  ];

  // Helper function to display field errors
  const getFieldError = (fieldName: string) => {
    return errors[fieldName];
  };

  const renderFieldError = (fieldName: string) => {
    const error = getFieldError(fieldName);
    if (!error) return null;

    return (
      <p className="mt-1 text-sm text-red-600">
        <i className="fa fa-exclamation-circle mr-1"></i>
        {error}
      </p>
    );
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const navigateToSignin = () => {
    router.push('/signin');
  };

  // Show error function
  const showError = (message: string) => {
    setErrors({ general: message });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate form data for signup
      const validation = validateUserRegistration(formData);

      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          const fieldName = error.path.join('.');
          newErrors[fieldName] = error.message;
        });
        setErrors(newErrors);
        return;
      }

      // CORS is completely disabled on the CMS - use direct URL
      const registrationUrl = 'https://grandline-cms.vercel.app/api/trainee-register';

      const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ REGISTRATION SUCCESS:', result.message || 'Registration successful');

        // Reset form after successful registration
        setFormData(getInitialFormData());

        // Show success state in UI instead of popup
        setErrors({ success: result.message || 'Registration successful! Your trainee account has been created.' });
      } else {
        // Try to get the response text first, then parse as JSON
        const responseText = await response.text();

        let error: any;
        try {
          error = JSON.parse(responseText);
        } catch (parseError) {
          error = { error: 'Server returned invalid JSON', rawResponse: responseText };
        }

        // Show more specific error messages based on error type
        let errorMessage = 'Registration failed. Please try again.';

        if (error?.type === 'duplicate') {
          errorMessage = error.message || `This ${error.field || 'information'} is already registered. Please use different information.`;
        } else if (error?.type === 'validation') {
          errorMessage = error.message || 'Please check your form data and try again.';

          // If there are specific field errors, show them
          if (error?.details && typeof error.details === 'object') {
            // You could set specific field errors here if needed
          }
        } else if (error?.type === 'server_error') {
          errorMessage = error.message || 'We encountered a server error. Please try again in a few moments.';
        } else {
          errorMessage = error?.error || error?.message || 'Registration failed. Please try again.';
        }

        showError(errorMessage);
      }
    } catch (error) {
      console.error('❌ REGISTRATION ERROR:', error);
      showError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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
                  Create Your Account
                </h2>
                <p className="text-gray-600">
                  Join thousands of maritime professionals
                </p>
              </div>

              {/* Mobile Form Header */}
              <div className="lg:hidden text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Create Account
                </h2>
                <p className="text-gray-600 text-sm">
                  Join the maritime community
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

              {/* Error Messages */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <i className="fa fa-exclamation-circle text-red-500 mr-2"></i>
                    <p className="text-red-700 text-sm">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Success Messages */}
              {errors.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <i className="fa fa-check-circle text-green-500 mr-2"></i>
                    <p className="text-green-700 text-sm">{errors.success}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration Fields */}
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white ${
                            getFieldError('firstName')
                              ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                              : 'border-gray-200 focus:ring-[#201a7c]/20 focus:border-[#201a7c]'
                          }`}
                          placeholder="Juan"
                        />
                        {renderFieldError('firstName')}
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Middle Name (Optional)
                        </label>
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Carlos"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Dela Cruz"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Name Extension (e.g. Jr., II)
                        </label>
                        <input
                          type="text"
                          name="nameExtension"
                          value={formData.nameExtension}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Jr."
                        />
                      </div>
                    </div>

                    {/* Gender and Civil Status */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                        >
                          <option value="">Select gender</option>
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Civil Status *
                        </label>
                        <select
                          name="civilStatus"
                          value={formData.civilStatus}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                        >
                          <option value="">Select civil status</option>
                          {civilStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* SRN and Nationality */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          SRN *
                        </label>
                        <input
                          type="text"
                          name="srn"
                          value={formData.srn}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="SRN-123456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Nationality *
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Filipino"
                        />
                      </div>
                    </div>

                    {/* Birth Date and Place of Birth */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Birth Date *
                        </label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Place of Birth *
                        </label>
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Manila, Philippines"
                        />
                      </div>
                    </div>

                    {/* Complete Address */}
                    <div className="mb-4">
                      <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                        Complete Address *
                      </label>
                      <textarea
                        name="completeAddress"
                        value={formData.completeAddress}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white resize-none"
                        placeholder="123 Main Street, Barangay Sample, City, Province, ZIP Code"
                      />
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="juan.delacruz@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username & Password Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      Username & Password
                    </h3>

                    <div className="space-y-4">
                      {/* Username and Password - 50/50 on desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                            Username *
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                            placeholder="juan_delacruz"
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
                      </div>

                      {/* Confirm Password - Full width */}
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      Marketing
                    </h3>

                    <div>
                      <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                        placeholder="Enter coupon code (optional)"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      In Case of Emergency
                    </h3>

                    {/* Emergency Contact Name */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="emergencyFirstName"
                          value={formData.emergencyFirstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Maria"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Middle Name *
                        </label>
                        <input
                          type="text"
                          name="emergencyMiddleName"
                          value={formData.emergencyMiddleName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Santos"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="emergencyLastName"
                          value={formData.emergencyLastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="Dela Cruz"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactNumber"
                          value={formData.emergencyContactNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Relationship *
                        </label>
                        <select
                          name="emergencyRelationship"
                          value={formData.emergencyRelationship}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                        >
                          <option value="">Select relationship</option>
                          {relationshipOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-normal mb-2" style={{ color: '#555' }}>
                          Complete Address *
                        </label>
                        <textarea
                          name="emergencyCompleteAddress"
                          value={formData.emergencyCompleteAddress}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white resize-none"
                          placeholder="456 Emergency Street, Barangay Sample, City, Province, ZIP Code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-4 h-4 text-[#201a7c] border-gray-300 rounded focus:ring-[#201a7c]"
                    />
                    <label className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-[#201a7c] hover:underline font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-[#201a7c] hover:underline font-medium">Privacy Policy</a>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}

                  className="w-full bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a1569] hover:to-[#8b2f36] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <i className="fa fa-spinner fa-spin mr-2"></i>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
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
                    Already have an account?
                  </p>
                  <button
                    onClick={navigateToSignin}
                    className="mt-2 text-[#201a7c] font-semibold hover:text-[#1a1569] transition-colors duration-200"
                  >
                    Sign In Instead
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
