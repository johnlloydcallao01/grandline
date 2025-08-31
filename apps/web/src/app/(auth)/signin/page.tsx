'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { validateUserRegistration, type FlatUserRegistrationData } from '@/server/validators/user-registration-schemas';

/**
 * Modern Professional Sign In / Sign Up Page
 * Responsive design with split layout for desktop and mobile-optimized forms
 */

export default function SignInPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  // Simple notification functions without Redux
  const showSuccess = (message: string) => {
    alert(`✅ ${message}`);
  };

  const showError = (message: string) => {
    alert(`❌ ${message}`);
  };
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: 'Juan',
    middleName: 'Ponze',
    lastName: 'Enrile',
    nameExtension: 'Jr',
    gender: 'male',
    civilStatus: 'single',
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
    couponCode: '334ssdfsdf',

    // Emergency Contact
    emergencyFirstName: 'Johny',
    emergencyMiddleName: 'Buli',
    emergencyLastName: 'Dana',
    emergencyContactNumber: '+639468748743',
    emergencyRelationship: 'relative',
    emergencyCompleteAddress: 'Pangi, Zamboanga',

    // Terms
    agreeToTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const relationshipOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'friend', label: 'Friend' },
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
      console.log('⚠️ Already loading, ignoring submission');
      return;
    }

    setIsLoading(true);

    // DIAGNOSTIC LOGGING
    console.log('🚀 FORM SUBMISSION STARTED');
    console.log('📋 isSignUp:', isSignUp);
    console.log('📋 Form Data:', formData);
    console.log('📋 isLoading:', isLoading);

    try {
      if (isSignUp) {
        // Validate form data for signup
        console.log('🔍 VALIDATING FORM DATA...');
        const validation = validateUserRegistration(formData);
        console.log('📊 Validation result:', validation);

        if (!validation.success) {
          console.log('❌ VALIDATION FAILED!');
          console.log('📋 Validation errors:', validation.error.errors);
          const newErrors: Record<string, string> = {};
          validation.error.errors.forEach((error) => {
            const fieldName = error.path.join('.');
            newErrors[fieldName] = error.message;
            console.log(`❌ Field error: ${fieldName} = ${error.message}`);
          });
          setErrors(newErrors);
          console.log('📋 Setting errors:', newErrors);
          return;
        }

        console.log('✅ VALIDATION PASSED!');

        // CORS is completely disabled on the CMS - use direct URL
        const registrationUrl = 'https://grandline-cms.vercel.app/api/trainee-register';

        console.log('🚀 Starting trainee registration...');
        console.log('📍 Registration URL:', registrationUrl);

        // Add a simple connectivity test
        console.log('🔍 Testing API connectivity...');
        try {
          const testResponse = await fetch(registrationUrl, {
            method: 'OPTIONS',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log('✅ OPTIONS request successful:', testResponse.status);
        } catch (optionsError) {
          console.warn('⚠️ OPTIONS request failed:', optionsError);
        }
        console.log('📋 Form data being sent:', {
          ...formData,
          password: '[HIDDEN]',
          confirmPassword: '[HIDDEN]'
        });

        console.log('📊 Form data summary:', {
          hasFirstName: !!formData.firstName,
          hasLastName: !!formData.lastName,
          hasEmail: !!formData.email,
          hasUsername: !!formData.username,
          hasPassword: !!formData.password,
          hasSRN: !!formData.srn,
          hasEmergencyContact: !!(formData.emergencyFirstName && formData.emergencyLastName),
          agreeToTerms: formData.agreeToTerms
        });

        const response = await fetch(registrationUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Registration successful!', result);
          console.log('🎉 User created:', {
            id: result.data?.user?.id,
            email: result.data?.user?.email,
            name: `${result.data?.user?.firstName} ${result.data?.user?.lastName}`,
            srn: result.data?.trainee?.srn
          });
          showSuccess(result.message || 'Registration successful! Your trainee account has been created.');

          // Reset form after successful registration
          setFormData({
            firstName: 'Juan',
            middleName: 'Ponze',
            lastName: 'Enrile',
            nameExtension: 'Jr',
            gender: 'male',
            civilStatus: 'single',
            srn: 'SRN-343',
            nationality: 'Filipino',
            birthDate: '2000-12-28',
            placeOfBirth: 'Manila, Philippines',
            completeAddress: 'Manila, Philippines',
            email: 'carlos@gmail.com',
            phoneNumber: '+639092809767',
            username: 'juancarlos',
            password: '@Iamachessgrandmaster23',
            confirmPassword: '@Iamachessgrandmaster23',
            couponCode: '334ssdfsdf',
            emergencyFirstName: 'Johny',
            emergencyMiddleName: 'Buli',
            emergencyLastName: 'Dana',
            emergencyContactNumber: '+639468748743',
            emergencyRelationship: 'relative',
            emergencyCompleteAddress: 'Pangi, Zamboanga',
            agreeToTerms: true
          });
        } else {
          // Try to get the response text first, then parse as JSON
          const responseText = await response.text();
          console.error('❌ Registration failed - Raw response:', responseText);

          let error;
          try {
            error = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ Failed to parse error response as JSON:', parseError);
            error = { error: 'Server returned invalid JSON', rawResponse: responseText };
          }

          console.error('❌ Registration failed:', {
            status: response.status,
            statusText: response.statusText,
            error: error
          });

          // Show more specific error messages based on error type
          let errorMessage = 'Registration failed. Please try again.';

          if (error?.type === 'duplicate') {
            errorMessage = error.message || `This ${error.field || 'information'} is already registered. Please use different information.`;
          } else if (error?.type === 'validation') {
            errorMessage = error.message || 'Please check your form data and try again.';

            // If there are specific field errors, show them
            if (error?.details && typeof error.details === 'object') {
              console.log('📋 Validation details:', error.details);
              // You could set specific field errors here if needed
            }
          } else if (error?.type === 'server_error') {
            errorMessage = error.message || 'We encountered a server error. Please try again in a few moments.';
          } else {
            errorMessage = error?.error || error?.message || 'Registration failed. Please try again.';
          }

          showError(errorMessage);
        }
      } else {
        // Login form - EXACT same as web-admin, just trainee role
        console.log('🔐 PayloadCMS trainee login initiated...');
        console.log('📧 Email:', formData.email);
        console.log('🌐 API URL:', 'https://grandline-cms.vercel.app/api');

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

          // Log response details for debugging
          console.log('📡 Login response status:', response.status);
          console.log('📡 Login response headers:', Object.fromEntries(response.headers.entries()));

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

          console.log('✅ PayloadCMS login successful:', {
            email: result.user.email,
            role: result.user.role,
            isActive: result.user.isActive,
            token: result.token ? 'Present' : 'Missing'
          });

          // Check what cookies were set
          console.log('🍪 All cookies after login:', document.cookie);

          // PayloadCMS should set the cookie, but if not, set it manually
          if (result.token) {
            const hasPayloadToken = document.cookie.includes('payload-token');
            console.log('🔍 Has payload-token cookie:', hasPayloadToken);

            if (!hasPayloadToken) {
              console.log('⚠️ PayloadCMS did not set cookie, setting manually...');
              // Set the cookie manually with proper settings for localhost
              const isSecure = window.location.protocol === 'https:';
              const cookieString = `payload-token=${result.token}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
              document.cookie = cookieString;
              console.log('✅ Cookie set manually:', cookieString);

              // Verify the cookie was set
              const verification = document.cookie.includes('payload-token');
              console.log('🔍 Cookie verification after manual set:', verification);
            } else {
              console.log('✅ PayloadCMS cookie already set');
            }
          } else {
            console.warn('⚠️ No token received from PayloadCMS');
          }

          console.log('🔄 Redirecting to main page...');

          // Longer delay to ensure cookie is processed and available
          setTimeout(() => {
            // Final verification before redirect
            const finalCookieCheck = document.cookie.includes('payload-token');
            console.log('🔍 Final cookie check before redirect:', finalCookieCheck);
            console.log('🍪 Final cookies:', document.cookie);
            router.push('/'); // Redirect to your original main page
          }, 500);
        } catch (err: unknown) {
          console.error('❌ Trainee login failed:', err);
          const errorMessage = (err as Error)?.message || 'Authentication failed. Please check your credentials and ensure you have trainee privileges.';
          showError(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      // Personal Information
      firstName: 'Juan',
      middleName: 'Ponze',
      lastName: 'Enrile',
      nameExtension: 'Jr',
      gender: 'male',
      civilStatus: 'single',
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
      couponCode: '334ssdfsdf',

      // Emergency Contact
      emergencyFirstName: 'Johny',
      emergencyMiddleName: 'Buli',
      emergencyLastName: 'Dana',
      emergencyContactNumber: '+639468748743',
      emergencyRelationship: 'relative',
      emergencyCompleteAddress: 'Pangi, Zamboanga',

      // Terms
      agreeToTerms: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
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
                  {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600">
                  {isSignUp
                    ? 'Join thousands of maritime professionals'
                    : 'Sign in to continue your learning journey'
                  }
                </p>
              </div>

              {/* Mobile Form Header */}
              <div className="lg:hidden text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isSignUp
                    ? 'Join the maritime community'
                    : 'Sign in to your portal'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sign Up Fields */}
                {isSignUp && (
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
                )}

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
                  onClick={() => console.log('🔘 BUTTON CLICKED! isSignUp:', isSignUp, 'isLoading:', isLoading)}
                  className="w-full bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#1a1569] hover:to-[#8b2f36] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <i className="fa fa-spinner fa-spin mr-2"></i>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
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
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    onClick={toggleForm}
                    className="mt-2 text-[#201a7c] font-semibold hover:text-[#1a1569] transition-colors duration-200"
                  >
                    {isSignUp ? 'Sign In Instead' : 'Create New Account'}
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
