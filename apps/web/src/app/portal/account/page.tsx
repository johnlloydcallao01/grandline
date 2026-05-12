'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentUser } from '@/lib/auth';
import {
  updateUserProfile,
  getTraineeRecord,
  updateTraineeRecord,
  getEmergencyContactRecord,
  upsertEmergencyContactRecord,
} from '@/app/actions/user';
import type { User } from '@/types/auth';

const TABS = ['Profile', 'PII', 'Account', 'Preferences'];

// Helper to convert Payload's Lexical JSON to plain text for the textarea
function lexicalToPlainText(lexicalData: any): string {
  if (!lexicalData || !lexicalData.root || !lexicalData.root.children) return '';
  let text = '';
  const traverse = (node: any) => {
    if (node.type === 'text') {
      text += node.text || '';
    } else if (node.type === 'paragraph') {
      if (node.children) {
        node.children.forEach(traverse);
      }
      text += '\n';
    } else if (node.children) {
      node.children.forEach(traverse);
    }
  };
  lexicalData.root.children.forEach(traverse);
  return text.trim();
}

// Helper to convert plain text back to Payload's Lexical JSON format
function plainTextToLexical(text: string): any {
  if (!text) return null;
  const paragraphs = text.split('\n').map((p) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: p,
        type: 'text',
        version: 1
      }
    ]
  }));

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs
    }
  };
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Default to the tab in URL if valid, otherwise 'Profile'
  const initialTab = TABS.includes(tabFromUrl || '') ? tabFromUrl! : 'Profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const { theme, setTheme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [traineeId, setTraineeId] = useState<number | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    nameExtension: '',
    username: '',
    email: '',
    bio: '',
    gender: '',
    civilStatus: '',
    nationality: '',
    srn: '',
    birthDate: '',
    placeOfBirth: '',
    completeAddress: '',
    phone: '',
    password: '',
    confirmPassword: '',
    couponCode: '',
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    emergencyContactNumber: '',
    emergencyRelationship: '',
    emergencyCompleteAddress: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    security: true
  });

  // Sync state when URL changes (e.g. user hits back button)
  useEffect(() => {
    if (tabFromUrl && TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      setActiveTab('Profile');
    }
  }, [tabFromUrl]);

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      setIsLoadingUser(true);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          let fetchedSrn = '';
          let fetchedCouponCode = '';
          let fetchedEmergencyFirstName = '';
          let fetchedEmergencyMiddleName = '';
          let fetchedEmergencyLastName = '';
          let fetchedEmergencyContactNumber = '';
          let fetchedEmergencyRelationship = '';
          let fetchedEmergencyCompleteAddress = '';
          const traineeRes = await getTraineeRecord(currentUser.id);
          if (traineeRes.success && traineeRes.trainee) {
            setTraineeId(traineeRes.trainee.id);
            fetchedSrn = traineeRes.trainee.srn || '';
            fetchedCouponCode = traineeRes.trainee.couponCode || '';
          }

          const emergencyRes = await getEmergencyContactRecord(currentUser.id);
          if (emergencyRes.success && emergencyRes.emergencyContact) {
            fetchedEmergencyFirstName = emergencyRes.emergencyContact.firstName || '';
            fetchedEmergencyMiddleName = emergencyRes.emergencyContact.middleName || '';
            fetchedEmergencyLastName = emergencyRes.emergencyContact.lastName || '';
            fetchedEmergencyContactNumber = emergencyRes.emergencyContact.contactNumber || '';
            fetchedEmergencyRelationship = emergencyRes.emergencyContact.relationship || '';
            fetchedEmergencyCompleteAddress = emergencyRes.emergencyContact.completeAddress || '';
          }

          setProfileData({
            firstName: currentUser.firstName || '',
            middleName: currentUser.middleName || '',
            lastName: currentUser.lastName || '',
            nameExtension: currentUser.nameExtension || '',
            username: currentUser.username || '',
            email: currentUser.email || '',
            bio: currentUser.biography ? lexicalToPlainText(currentUser.biography) : '',
            gender: currentUser.gender || '',
            civilStatus: currentUser.civilStatus || '',
            nationality: currentUser.nationality || '',
            srn: fetchedSrn,
            birthDate: currentUser.birthDate ? new Date(currentUser.birthDate).toISOString().split('T')[0] : '',
            placeOfBirth: currentUser.placeOfBirth || '',
            completeAddress: currentUser.completeAddress || '',
            phone: currentUser.phone || '',
            password: '',
            confirmPassword: '',
            couponCode: fetchedCouponCode,
            emergencyFirstName: fetchedEmergencyFirstName,
            emergencyMiddleName: fetchedEmergencyMiddleName,
            emergencyLastName: fetchedEmergencyLastName,
            emergencyContactNumber: fetchedEmergencyContactNumber,
            emergencyRelationship: fetchedEmergencyRelationship,
            emergencyCompleteAddress: fetchedEmergencyCompleteAddress
          });
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveMessage(null); // Clear messages when user types
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (profileData.password || profileData.confirmPassword) {
        if (profileData.password !== profileData.confirmPassword) {
          setSaveMessage({ type: 'error', text: 'Passwords do not match' });
          setIsSaving(false);
          return;
        }
      }

      const updateData: any = {
        firstName: profileData.firstName,
        middleName: profileData.middleName,
        lastName: profileData.lastName,
        nameExtension: profileData.nameExtension,
        username: profileData.username,
        email: profileData.email,
        gender: profileData.gender || null,
        civilStatus: profileData.civilStatus || null,
        nationality: profileData.nationality || null,
        birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString() : null,
        placeOfBirth: profileData.placeOfBirth || null,
        completeAddress: profileData.completeAddress || null,
        phone: profileData.phone || null,
        biography: profileData.bio ? plainTextToLexical(profileData.bio) : null
      };

      if (profileData.password) {
        updateData.password = profileData.password;
      }

      const result = await updateUserProfile(user.id, updateData);

      if (result.success && result.user) {
        setUser(result.user);

        if (traineeId && (profileData.srn !== undefined || profileData.couponCode !== undefined)) {
          const traineeRes = await updateTraineeRecord(traineeId, {
            srn: profileData.srn,
            couponCode: profileData.couponCode
          });
          if (!traineeRes.success) {
            setSaveMessage({ type: 'error', text: traineeRes.error || 'Profile updated, but failed to update trainee records' });
            return;
          }
        }

        const emergencyRes = await upsertEmergencyContactRecord(user.id, {
          firstName: profileData.emergencyFirstName,
          middleName: profileData.emergencyMiddleName || null,
          lastName: profileData.emergencyLastName,
          contactNumber: profileData.emergencyContactNumber,
          relationship: profileData.emergencyRelationship,
          completeAddress: profileData.emergencyCompleteAddress,
        });
        if (!emergencyRes.success) {
          setSaveMessage({ type: 'error', text: emergencyRes.error || 'Profile updated, but failed to update emergency contact' });
          return;
        }

        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });

        // Clear passwords from state after successful save
        setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Profile') {
      router.push('/portal/account' as any);
    } else {
      router.push(`/portal/account?tab=${tab}` as any);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--background)]">
      {/* Header Section */}
      <div className="bg-[var(--card-background)] border-b border-[var(--card-border)]">
        <div className="w-full px-[10px] py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account details, profile, and preferences</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${activeTab === tab
                  ? 'border-[#201a7c] text-[#201a7c] dark:border-[#5c54e0] dark:text-[#5c54e0]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[10px] py-8">
        {activeTab === 'Profile' && (
          <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6 relative">
            {isLoadingUser && (
              <div className="absolute inset-0 bg-[var(--card-background)]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <i className="fa fa-spinner fa-spin text-[#201a7c] dark:text-[#5c54e0] text-3xl"></i>
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-[var(--card-border)]">Public Profile</h2>

            {saveMessage && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center ${saveMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                }`}>
                <i className={`fa ${saveMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <p className="text-sm font-medium">{saveMessage.text}</p>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-md flex items-center justify-center relative group cursor-pointer overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture.cloudinaryURL || user.profilePicture.url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa fa-user text-4xl text-gray-400 dark:text-gray-500"></i>
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa fa-camera text-white text-xl"></i>
                  </div>
                </div>
                <button className="text-sm text-[#201a7c] dark:text-[#5c54e0] font-medium hover:text-[#1a1563] dark:hover:text-[#6a62f5]">Change Avatar</button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={profileData.middleName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name Extension</label>
                  <input
                    type="text"
                    name="nameExtension"
                    value={profileData.nameExtension}
                    onChange={handleProfileChange}
                    placeholder="e.g. Jr., II"
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                    placeholder="Tell us a little bit about yourself..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--card-border)]">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                onClick={() => {
                  if (user) {
                    setProfileData({
                      ...profileData,
                      firstName: user.firstName || '',
                      middleName: user.middleName || '',
                      lastName: user.lastName || '',
                      nameExtension: user.nameExtension || '',
                      username: user.username || '',
                      email: user.email || '',
                      bio: user.biography ? lexicalToPlainText(user.biography) : '',
                      gender: user.gender || '',
                      civilStatus: user.civilStatus || '',
                      nationality: user.nationality || ''
                    });
                    setSaveMessage(null);
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#201a7c] dark:bg-[#3028a3] text-white rounded-lg hover:bg-[#1a1563] dark:hover:bg-[#3b32c4] font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? <i className="fa fa-spinner fa-spin"></i> : null}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'PII' && (
          <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6 relative">
            {isLoadingUser && (
              <div className="absolute inset-0 bg-[var(--card-background)]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <i className="fa fa-spinner fa-spin text-[#201a7c] dark:text-[#5c54e0] text-3xl"></i>
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-[var(--card-border)]">Personally Identifiable Information</h2>

            {saveMessage && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center ${saveMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                }`}>
                <i className={`fa ${saveMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <p className="text-sm font-medium">{saveMessage.text}</p>
              </div>
            )}

            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Middle Name (Optional)</label>
                <input
                  type="text"
                  name="middleName"
                  value={profileData.middleName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name Extension (e.g. Jr., II)</label>
                <input
                  type="text"
                  name="nameExtension"
                  value={profileData.nameExtension}
                  onChange={handleProfileChange}
                  placeholder="e.g. Jr., II"
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={profileData.gender || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Civil Status *</label>
                <select
                  name="civilStatus"
                  value={profileData.civilStatus || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                >
                  <option value="">Select civil status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SRN *</label>
                <input
                  type="text"
                  name="srn"
                  value={profileData.srn}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={profileData.nationality}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Birth Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 z-10 relative"
                    style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Place of Birth *</label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={profileData.placeOfBirth}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complete Address *</label>
                <textarea
                  name="completeAddress"
                  value={profileData.completeAddress}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
            </div>

            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Username & Password</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={profileData.password}
                    onChange={handleProfileChange}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-2 pr-10 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 pr-10 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">Marketing</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coupon Code</label>
                <input
                  type="text"
                  name="couponCode"
                  value={profileData.couponCode}
                  onChange={(e) => {
                    setProfileData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }));
                    setSaveMessage(null);
                  }}
                  placeholder="Enter a valid coupon code"
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent uppercase"
                />
              </div>
            </div>

            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">In Case of Emergency</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                <input
                  type="text"
                  name="emergencyFirstName"
                  value={profileData.emergencyFirstName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Middle Name</label>
                <input
                  type="text"
                  name="emergencyMiddleName"
                  value={profileData.emergencyMiddleName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="emergencyLastName"
                  value={profileData.emergencyLastName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Number *</label>
                <input
                  type="text"
                  name="emergencyContactNumber"
                  value={profileData.emergencyContactNumber}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relationship *</label>
                <select
                  name="emergencyRelationship"
                  value={profileData.emergencyRelationship}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="parent">Parent</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="guardian">Guardian</option>
                  <option value="friend">Friend</option>
                  <option value="relative">Relative</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complete Address *</label>
                <textarea
                  name="emergencyCompleteAddress"
                  value={profileData.emergencyCompleteAddress}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--card-border)] mt-6">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                onClick={async () => {
                  if (user) {
                    let fetchedCouponCode = '';
                    let fetchedSrn = '';
                    let fetchedEmergencyFirstName = '';
                    let fetchedEmergencyMiddleName = '';
                    let fetchedEmergencyLastName = '';
                    let fetchedEmergencyContactNumber = '';
                    let fetchedEmergencyRelationship = '';
                    let fetchedEmergencyCompleteAddress = '';

                    const traineeRes = await getTraineeRecord(user.id);
                    if (traineeRes.success && traineeRes.trainee) {
                      fetchedSrn = traineeRes.trainee.srn || '';
                      fetchedCouponCode = traineeRes.trainee.couponCode || '';
                    }

                    const emergencyRes = await getEmergencyContactRecord(user.id);
                    if (emergencyRes.success && emergencyRes.emergencyContact) {
                      fetchedEmergencyFirstName = emergencyRes.emergencyContact.firstName || '';
                      fetchedEmergencyMiddleName = emergencyRes.emergencyContact.middleName || '';
                      fetchedEmergencyLastName = emergencyRes.emergencyContact.lastName || '';
                      fetchedEmergencyContactNumber = emergencyRes.emergencyContact.contactNumber || '';
                      fetchedEmergencyRelationship = emergencyRes.emergencyContact.relationship || '';
                      fetchedEmergencyCompleteAddress = emergencyRes.emergencyContact.completeAddress || '';
                    }

                    setProfileData({
                      ...profileData,
                      firstName: user.firstName || '',
                      middleName: user.middleName || '',
                      lastName: user.lastName || '',
                      nameExtension: user.nameExtension || '',
                      gender: user.gender || '',
                      civilStatus: user.civilStatus || '',
                      nationality: user.nationality || '',
                      srn: fetchedSrn,
                      username: user.username || '',
                      email: user.email || '',
                      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
                      placeOfBirth: user.placeOfBirth || '',
                      completeAddress: user.completeAddress || '',
                      phone: user.phone || '',
                      password: '',
                      confirmPassword: '',
                      couponCode: fetchedCouponCode,
                      emergencyFirstName: fetchedEmergencyFirstName,
                      emergencyMiddleName: fetchedEmergencyMiddleName,
                      emergencyLastName: fetchedEmergencyLastName,
                      emergencyContactNumber: fetchedEmergencyContactNumber,
                      emergencyRelationship: fetchedEmergencyRelationship,
                      emergencyCompleteAddress: fetchedEmergencyCompleteAddress
                    });

                    setSaveMessage(null);
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#201a7c] dark:bg-[#3028a3] text-white rounded-lg hover:bg-[#1a1563] dark:hover:bg-[#3b32c4] font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? <i className="fa fa-spinner fa-spin"></i> : null}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="space-y-6">
            {/* Appearance Section */}
            <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-[var(--card-border)]">Appearance</h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Choose your preferred theme. System option will follow your device settings.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light Theme Option */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'light'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 flex items-center justify-center">
                      <i className="fa fa-sun text-yellow-500 text-2xl"></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Light</span>
                    {theme === 'light' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fa fa-check text-white text-xs"></i>
                      </div>
                    )}
                  </button>

                  {/* Dark Theme Option */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 shadow-sm mb-3 flex items-center justify-center">
                      <i className="fa fa-moon text-gray-300 text-2xl"></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Dark</span>
                    {theme === 'dark' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fa fa-check text-white text-xs"></i>
                      </div>
                    )}
                  </button>

                  {/* System Theme Option */}
                  <button
                    onClick={() => setTheme('system')}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${theme === 'system'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm mb-3 flex items-center justify-center overflow-hidden">
                      <div className="flex">
                        <i className="fa fa-desktop text-gray-600 dark:text-gray-400 text-xl"></i>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">System</span>
                    {theme === 'system' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fa fa-check text-white text-xs"></i>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-[var(--card-border)]">Notification Preferences</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily summaries and course updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time alerts for assignments and messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.push} onChange={() => setNotifications({ ...notifications, push: !notifications.push })} />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Security Alerts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Login attempts and password changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.security} disabled />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Account' && (
          <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa fa-tools text-gray-400 dark:text-gray-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Under Construction</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">This section is currently being updated with new features.</p>
          </div>
        )}
      </div>
    </div>
  );
}
