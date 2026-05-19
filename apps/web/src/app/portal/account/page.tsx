'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLogout } from '@/hooks/useAuth';
import { getCurrentUser } from '@/lib/auth';
import {
  updateUserProfile,
  getTraineeRecord,
  updateTraineeRecord,
  getEmergencyContactRecord,
  upsertEmergencyContactRecord,
} from '@/app/actions/user';
import { disableWebPush, enableWebPush, getWebPushState } from '@/lib/push';
import type { User } from '@/types/auth';

const TABS = ['Profile', 'PII', 'Account', 'Preferences'];
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');
const COURSE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600';

type EnrollmentMedia = {
  cloudinaryURL?: string | null;
  url?: string | null;
};

type AccountEnrollment = {
  id: string | number;
  enrollmentType?: string | null;
  status: string;
  finalEvaluation?: 'passed' | 'failed' | null;
  progressPercentage?: number | null;
  amountPaid?: number | null;
  enrolledAt?: string | null;
  course?: {
    id: string | number;
    title?: string | null;
    price?: number | null;
    difficultyLevel?: string | null;
    estimatedDuration?: number | null;
    estimatedDurationUnit?: string | null;
    thumbnail?: EnrollmentMedia | null;
    instructor?: {
      user?: {
        firstName?: string | null;
        lastName?: string | null;
        profilePicture?: EnrollmentMedia | null;
      } | null;
    } | null;
  } | null;
};

type ProfileFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  nameExtension: string;
  username: string;
  email: string;
  bio: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  srn: string;
  birthDate: string;
  placeOfBirth: string;
  completeAddress: string;
  phone: string;
  password: string;
  confirmPassword: string;
  couponCode: string;
  emergencyFirstName: string;
  emergencyMiddleName: string;
  emergencyLastName: string;
  emergencyContactNumber: string;
  emergencyRelationship: string;
  emergencyCompleteAddress: string;
};

type ProfileFormSnapshot = Omit<ProfileFormState, 'password' | 'confirmPassword'>;

function createProfileSnapshot(profile: ProfileFormState): ProfileFormSnapshot {
  const { password, confirmPassword, ...snapshot } = profile;
  void password;
  void confirmPassword;
  return snapshot;
}

function getMediaUrl(media?: EnrollmentMedia | null): string {
  if (!media) return COURSE_FALLBACK_IMAGE;
  if (media.cloudinaryURL) return media.cloudinaryURL;
  if (media.url) {
    if (media.url.startsWith('http')) return media.url;
    return `${API_BASE_URL}${media.url}`;
  }
  return COURSE_FALLBACK_IMAGE;
}

function formatStatusLabel(status?: string | null): string {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getEnrollmentDisplayStatus(enrollment: AccountEnrollment): string {
  if (enrollment.status === 'completed' && enrollment.finalEvaluation === 'passed') {
    return 'Passed';
  }

  if (enrollment.status === 'completed' && enrollment.finalEvaluation === 'failed') {
    return 'Failed';
  }

  if (enrollment.status === 'completed') {
    return 'Completed';
  }

  return formatStatusLabel(enrollment.status);
}

function getEnrollmentBadgeClasses(enrollment: AccountEnrollment): string {
  const displayStatus = getEnrollmentDisplayStatus(enrollment);

  switch (displayStatus) {
    case 'Active':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'Passed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'Failed':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    case 'Suspended':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    case 'Pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'Dropped':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    case 'Expired':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  }
}

function getEnrollmentActionLabel(status?: string | null): string {
  void status;
  return 'View Details';
}

function getEnrollmentTimestamp(enrollment: AccountEnrollment): number {
  if (!enrollment.enrolledAt) return 0;
  const timestamp = new Date(enrollment.enrolledAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatEnrollmentHistoryGroup(enrolledAt?: string | null): string {
  if (!enrolledAt) return 'Undated';

  const date = new Date(enrolledAt);
  if (Number.isNaN(date.getTime())) return 'Undated';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function formatEnrollmentHistoryDate(enrolledAt?: string | null): string {
  if (!enrolledAt) return 'No date';

  const date = new Date(enrolledAt);
  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return 'PHP 0.00';

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);
}

function AccountFormSkeleton({ dense = false }: { dense?: boolean }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="border-b border-[var(--card-border)] pb-4">
        <div className="h-6 w-44 rounded bg-gray-200 dark:bg-gray-800"></div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-col items-center gap-4">
          <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800"></div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: dense ? 10 : 6 }).map((_, index) => (
            <div key={index} className={dense && index >= 8 ? 'md:col-span-2' : ''}>
              <div className="mb-2 h-4 w-28 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="mb-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className={`w-full rounded-lg bg-gray-200 dark:bg-gray-800 ${dense ? 'h-24' : 'h-20'}`}></div>
          </div>
        </div>
      </div>

      {dense ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: sectionIndex === 2 ? 6 : 4 }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className={fieldIndex === 4 || fieldIndex === 5 ? 'md:col-span-2' : ''}>
                    <div className="mb-2 h-4 w-28 rounded bg-gray-200 dark:bg-gray-800"></div>
                    <div className={`w-full rounded-lg bg-gray-200 dark:bg-gray-800 ${fieldIndex >= 4 ? 'h-20' : 'h-10'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex justify-end gap-3 border-t border-[var(--card-border)] pt-6">
        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
      </div>
    </div>
  );
}

function AccountTabOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
          <div className="space-y-3">
            <div className="h-6 w-36 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 w-72 max-w-full rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="h-6 w-44 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-4 w-80 max-w-full rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800 lg:w-80"></div>
          </div>
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
            <div className="space-y-4">
              <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-10 w-28 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-[var(--card-border)] px-5 py-4 last:border-b-0"
          >
            <div className="hidden min-w-[92px] space-y-2 md:block">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="h-4 w-48 max-w-full rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-800"></div>
              </div>
              <div className="h-3 w-64 max-w-full rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-3 w-10 rounded bg-gray-200 dark:bg-gray-800"></div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
            <div className="hidden h-4 w-24 rounded bg-gray-200 dark:bg-gray-800 md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const { logout, isLoggingOut } = useLogout();

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
  const profileSnapshotRef = useRef<ProfileFormSnapshot | null>(null);

  const [notifications, setNotifications] = useState({
    push: true,
    marketing: false,
    security: true
  });
  const [isUpdatingPushPreference, setIsUpdatingPushPreference] = useState(false);
  const [isUpdatingSecurityPreference, setIsUpdatingSecurityPreference] = useState(false);
  const [pushSupport, setPushSupport] = useState<{
    supported: boolean;
    permission: NotificationPermission | 'unsupported';
  }>({
    supported: false,
    permission: 'unsupported',
  });
  const [preferenceMessage, setPreferenceMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [accountEnrollments, setAccountEnrollments] = useState<AccountEnrollment[]>([]);
  const [isLoadingAccountEnrollments, setIsLoadingAccountEnrollments] = useState(true);
  const [isEditingAccountCouponCode, setIsEditingAccountCouponCode] = useState(false);
  const [accountCouponCodeDraft, setAccountCouponCodeDraft] = useState('');
  const [accountCouponSaveMessage, setAccountCouponSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
          setNotifications((prev) => ({
            ...prev,
            push: currentUser.pushNotificationsEnabled !== false,
            security: currentUser.securityAlertsEmailEnabled !== false,
          }));

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

          const nextProfileData: ProfileFormState = {
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
          };

          setProfileData(nextProfileData);
          profileSnapshotRef.current = createProfileSnapshot(nextProfileData);

          try {
            const pushState = await getWebPushState();
            setPushSupport({
              supported: pushState.supported,
              permission: pushState.permission,
            });
            setNotifications((prev) => ({
              ...prev,
              push: currentUser.pushNotificationsEnabled !== false && pushState.subscribed,
            }));
          } catch (pushError) {
            console.error('Failed to inspect web push state', pushError);
            setPushSupport({
              supported: false,
              permission: 'unsupported',
            });
            setNotifications((prev) => ({
              ...prev,
              push: false,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!user?.id) {
      setAccountEnrollments([]);
      setIsLoadingAccountEnrollments(false);
      return;
    }

    const userId = user.id;
    let isCancelled = false;

    async function loadAccountEnrollments() {
      setIsLoadingAccountEnrollments(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/lms/enrollments?userId=${userId}&limit=100`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch enrollments: ${response.status}`);
        }

        const data = await response.json();
        if (!isCancelled) {
          setAccountEnrollments(Array.isArray(data.docs) ? data.docs : []);
        }
      } catch (error) {
        console.error('Failed to load account enrollments', error);
        if (!isCancelled) {
          setAccountEnrollments([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAccountEnrollments(false);
        }
      }
    }

    loadAccountEnrollments();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, isLoadingUser]);

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

      const currentSnapshot = createProfileSnapshot(profileData);
      const previousSnapshot = profileSnapshotRef.current;
      const hasPasswordChange = Boolean(profileData.password);
      const hasUserFieldChanges = !previousSnapshot || (
        currentSnapshot.firstName !== previousSnapshot.firstName ||
        currentSnapshot.middleName !== previousSnapshot.middleName ||
        currentSnapshot.lastName !== previousSnapshot.lastName ||
        currentSnapshot.nameExtension !== previousSnapshot.nameExtension ||
        currentSnapshot.username !== previousSnapshot.username ||
        currentSnapshot.email !== previousSnapshot.email ||
        currentSnapshot.bio !== previousSnapshot.bio ||
        currentSnapshot.gender !== previousSnapshot.gender ||
        currentSnapshot.civilStatus !== previousSnapshot.civilStatus ||
        currentSnapshot.nationality !== previousSnapshot.nationality ||
        currentSnapshot.birthDate !== previousSnapshot.birthDate ||
        currentSnapshot.placeOfBirth !== previousSnapshot.placeOfBirth ||
        currentSnapshot.completeAddress !== previousSnapshot.completeAddress ||
        currentSnapshot.phone !== previousSnapshot.phone
      );
      const hasTraineeChanges = Boolean(traineeId) && (!previousSnapshot || (
        currentSnapshot.srn !== previousSnapshot.srn ||
        currentSnapshot.couponCode !== previousSnapshot.couponCode
      ));
      const hasEmergencyChanges = !previousSnapshot || (
        currentSnapshot.emergencyFirstName !== previousSnapshot.emergencyFirstName ||
        currentSnapshot.emergencyMiddleName !== previousSnapshot.emergencyMiddleName ||
        currentSnapshot.emergencyLastName !== previousSnapshot.emergencyLastName ||
        currentSnapshot.emergencyContactNumber !== previousSnapshot.emergencyContactNumber ||
        currentSnapshot.emergencyRelationship !== previousSnapshot.emergencyRelationship ||
        currentSnapshot.emergencyCompleteAddress !== previousSnapshot.emergencyCompleteAddress
      );

      if (!hasPasswordChange && !hasUserFieldChanges && !hasTraineeChanges && !hasEmergencyChanges) {
        setSaveMessage({ type: 'success', text: 'No changes to save.' });
        return;
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

      let updatedUser = user;

      if (hasPasswordChange || hasUserFieldChanges) {
        const result = await updateUserProfile(user.id, updateData);

        if (!result.success || !result.user) {
          setSaveMessage({ type: 'error', text: result.error || 'Failed to update profile' });
          return;
        }

        updatedUser = result.user;
        setUser(result.user);
      }

      const followUpUpdates: Array<Promise<{ success: boolean; error?: string }>> = [];

      if (hasTraineeChanges && traineeId) {
        followUpUpdates.push(updateTraineeRecord(traineeId, {
          srn: profileData.srn,
          couponCode: profileData.couponCode
        }));
      }

      if (hasEmergencyChanges) {
        followUpUpdates.push(upsertEmergencyContactRecord(user.id, {
          firstName: profileData.emergencyFirstName,
          middleName: profileData.emergencyMiddleName || null,
          lastName: profileData.emergencyLastName,
          contactNumber: profileData.emergencyContactNumber,
          relationship: profileData.emergencyRelationship,
          completeAddress: profileData.emergencyCompleteAddress,
        }));
      }

      const followUpResults = await Promise.all(followUpUpdates);
      const failedFollowUp = followUpResults.find((result) => !result.success);

      if (failedFollowUp) {
        setSaveMessage({ type: 'error', text: failedFollowUp.error || 'Failed to update related profile records' });
        return;
      }

      const nextProfileData: ProfileFormState = {
        ...profileData,
        password: '',
        confirmPassword: '',
      };

      setProfileData(nextProfileData);
      profileSnapshotRef.current = createProfileSnapshot(nextProfileData);
      setUser(updatedUser);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccountCouponCode = async () => {
    if (!traineeId) {
      setAccountCouponSaveMessage({ type: 'error', text: 'Coupon code cannot be updated right now.' });
      return;
    }

    const normalizedCouponCode = accountCouponCodeDraft.toUpperCase();

    if (normalizedCouponCode === profileData.couponCode) {
      setAccountCouponSaveMessage({ type: 'success', text: 'No changes to save.' });
      setIsEditingAccountCouponCode(false);
      return;
    }

    setIsSaving(true);
    setAccountCouponSaveMessage(null);
    setSaveMessage(null);

    try {
      const result = await updateTraineeRecord(traineeId, {
        srn: profileData.srn,
        couponCode: normalizedCouponCode,
      });

      if (!result.success) {
        setAccountCouponSaveMessage({ type: 'error', text: result.error || 'Failed to update coupon code' });
        return;
      }

      const nextProfileData: ProfileFormState = {
        ...profileData,
        couponCode: normalizedCouponCode,
      };

      setProfileData(nextProfileData);
      profileSnapshotRef.current = profileSnapshotRef.current
        ? { ...profileSnapshotRef.current, couponCode: normalizedCouponCode }
        : createProfileSnapshot(nextProfileData);
      setAccountCouponCodeDraft(normalizedCouponCode);
      setIsEditingAccountCouponCode(false);
      setAccountCouponSaveMessage({ type: 'success', text: 'Coupon code updated successfully!' });
    } catch (error: any) {
      setAccountCouponSaveMessage({ type: 'error', text: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushNotificationsToggle = async () => {
    if (!user || isUpdatingPushPreference) return;

    const nextEnabled = !notifications.push;

    setIsUpdatingPushPreference(true);
    setPreferenceMessage(null);

    try {
      if (nextEnabled) {
        await enableWebPush();
      } else {
        await disableWebPush();
      }

      const result = await updateUserProfile(user.id, {
        pushNotificationsEnabled: nextEnabled,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update push notification preference');
      }

      const refreshedPushState = await getWebPushState().catch(() => ({
        supported: false,
        permission: 'unsupported' as const,
        subscribed: false,
      }));

      setPushSupport({
        supported: refreshedPushState.supported,
        permission: refreshedPushState.permission,
      });
      setNotifications((prev) => ({
        ...prev,
        push: nextEnabled && refreshedPushState.subscribed,
      }));
      setUser((prev) => prev ? {
        ...prev,
        pushNotificationsEnabled: nextEnabled,
      } : prev);
      setPreferenceMessage({
        type: 'success',
        text: nextEnabled
          ? 'Web push notifications are enabled for this browser.'
          : 'Web push notifications are disabled for this browser.',
      });
    } catch (error: any) {
      const refreshedPushState = await getWebPushState().catch(() => ({
        supported: false,
        permission: 'unsupported' as const,
        subscribed: false,
      }));

      setPushSupport({
        supported: refreshedPushState.supported,
        permission: refreshedPushState.permission,
      });
      setNotifications((prev) => ({
        ...prev,
        push: user.pushNotificationsEnabled !== false && refreshedPushState.subscribed,
      }));
      setPreferenceMessage({
        type: 'error',
        text: error?.message || 'Failed to update push notification preference',
      });
    } finally {
      setIsUpdatingPushPreference(false);
    }
  };

  const handleSecurityAlertsToggle = async () => {
    if (!user || isUpdatingSecurityPreference) return;

    const nextEnabled = !notifications.security;

    setIsUpdatingSecurityPreference(true);
    setPreferenceMessage(null);

    try {
      const result = await updateUserProfile(user.id, {
        securityAlertsEmailEnabled: nextEnabled,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update security alert preference');
      }

      setNotifications((prev) => ({
        ...prev,
        security: nextEnabled,
      }));
      setUser((prev) => prev ? {
        ...prev,
        securityAlertsEmailEnabled: nextEnabled,
      } : prev);
      setPreferenceMessage({
        type: 'success',
        text: nextEnabled
          ? 'Security alert emails are enabled.'
          : 'Security alert emails are disabled.',
      });
    } catch (error: any) {
      setNotifications((prev) => ({
        ...prev,
        security: user.securityAlertsEmailEnabled !== false,
      }));
      setPreferenceMessage({
        type: 'error',
        text: error?.message || 'Failed to update security alert preference',
      });
    } finally {
      setIsUpdatingSecurityPreference(false);
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

  const filteredAccountEnrollments = useMemo(() => {
    return [...accountEnrollments]
      .filter((enrollment) => {
        const courseTitle = enrollment.course?.title || '';
        return courseTitle.toLowerCase().includes(accountSearchQuery.toLowerCase());
      })
      .sort((a, b) => getEnrollmentTimestamp(b) - getEnrollmentTimestamp(a));
  }, [accountEnrollments, accountSearchQuery]);

  const groupedAccountEnrollments = useMemo(() => {
    return filteredAccountEnrollments.reduce<Array<{ label: string; items: AccountEnrollment[] }>>((groups, enrollment) => {
      const label = formatEnrollmentHistoryGroup(enrollment.enrolledAt);
      const existingGroup = groups[groups.length - 1];

      if (existingGroup && existingGroup.label === label) {
        existingGroup.items.push(enrollment);
      } else {
        groups.push({ label, items: [enrollment] });
      }

      return groups;
    }, []);
  }, [filteredAccountEnrollments]);

  const totalAmountPaid = useMemo(() => {
    return accountEnrollments.reduce((total, enrollment) => {
      return total + (typeof enrollment.amountPaid === 'number' ? enrollment.amountPaid : 0);
    }, 0);
  }, [accountEnrollments]);

  const totalPayableAmount = useMemo(() => {
    return accountEnrollments.reduce((total, enrollment) => {
      if (enrollment.enrollmentType !== 'paid') {
        return total;
      }

      const coursePrice = typeof enrollment.course?.price === 'number' ? enrollment.course.price : 0;
      const amountPaid = typeof enrollment.amountPaid === 'number' ? enrollment.amountPaid : 0;
      const remainingBalance = Math.max(coursePrice - amountPaid, 0);

      return total + remainingBalance;
    }, 0);
  }, [accountEnrollments]);

  const isAccountOverviewReady = !isLoadingUser && !isLoadingAccountEnrollments;

  const handleAccountLogout = async () => {
    try {
      await logout();
      window.location.href = 'https://grandlinemaritime.com';
    } catch (error) {
      console.error('Logout failed:', error);
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
              <div className="absolute inset-0 bg-[var(--card-background)] z-10 rounded-xl p-6">
                <AccountFormSkeleton />
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
                    const nextProfileData: ProfileFormState = {
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
                    };

                    setProfileData(nextProfileData);
                    profileSnapshotRef.current = createProfileSnapshot(nextProfileData);
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
              <div className="absolute inset-0 bg-[var(--card-background)] z-10 rounded-xl p-6">
                <AccountFormSkeleton dense />
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

                    const nextProfileData: ProfileFormState = {
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
                    };

                    setProfileData(nextProfileData);
                    profileSnapshotRef.current = createProfileSnapshot(nextProfileData);

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

              {preferenceMessage && (
                <div className={`mb-6 rounded-xl border p-4 text-sm ${preferenceMessage.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                  {preferenceMessage.text}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Real-time browser alerts for course enrollments and other important updates.
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Clicking Enable will trigger the native browser permission popup only while this site's notification permission is still undecided.
                    </p>
                    {!pushSupport.supported && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        This browser does not currently support web push notifications, or the site is not running in a secure context.
                      </p>
                    )}
                    {pushSupport.supported && pushSupport.permission === 'denied' && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        Browser notification permission is blocked. Re-enable it in your browser settings to turn push back on.
                      </p>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.push}
                      disabled={isUpdatingPushPreference || (!pushSupport.supported && !notifications.push)}
                      onChange={handlePushNotificationsToggle}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Security Alerts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email alerts for meaningful failed login attempts and password changes.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.security}
                      disabled={isUpdatingSecurityPreference}
                      onChange={handleSecurityAlertsToggle}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Account' && (
          <div className="space-y-6">
            {!isAccountOverviewReady ? (
              <AccountTabOverviewSkeleton />
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Coupon Code</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Update the coupon code associated with your account.
                        </p>
                      </div>
                      {!isEditingAccountCouponCode ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountCouponCodeDraft(profileData.couponCode);
                            setAccountCouponSaveMessage(null);
                            setIsEditingAccountCouponCode(true);
                          }}
                          className="inline-flex items-center justify-center self-start rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm font-medium text-[#201a7c] transition-colors hover:bg-gray-50 dark:text-[#7b75ef] dark:hover:bg-gray-800"
                          aria-label="Edit coupon code"
                          title="Edit"
                        >
                          <i className="fa fa-pencil text-sm"></i>
                        </button>
                      ) : null}
                    </div>
                    {accountCouponSaveMessage && (
                      <div className={`mt-4 rounded-xl border p-4 text-sm ${accountCouponSaveMessage.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                        {accountCouponSaveMessage.text}
                      </div>
                    )}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coupon Code</label>
                      {isEditingAccountCouponCode ? (
                        <>
                          <input
                            type="text"
                            name="couponCode"
                            value={accountCouponCodeDraft}
                            onChange={(e) => {
                              setAccountCouponCodeDraft(e.target.value.toUpperCase());
                              setAccountCouponSaveMessage(null);
                            }}
                            placeholder="Enter a valid coupon code"
                            className="w-full px-4 py-2 bg-[var(--background)] text-gray-900 dark:text-gray-100 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent uppercase"
                          />
                          <div className="mt-4 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setAccountCouponCodeDraft(profileData.couponCode);
                                setAccountCouponSaveMessage(null);
                                setIsEditingAccountCouponCode(false);
                              }}
                              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={handleSaveAccountCouponCode}
                              className="px-4 py-2 bg-[#201a7c] dark:bg-[#3028a3] text-white rounded-lg hover:bg-[#1a1563] dark:hover:bg-[#3b32c4] font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                            >
                              {isSaving ? <i className="fa fa-spinner fa-spin"></i> : null}
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="min-h-[42px] rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-gray-900 dark:text-gray-100">
                          {profileData.couponCode || 'No coupon code added'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Enrolled Courses</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          All of your enrolled courses are shown here in one list, regardless of status.
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          {accountEnrollments.length} total enrollments
                        </p>
                      </div>

                      <div className="relative w-full lg:w-80">
                        <input
                          type="text"
                          placeholder="Search enrolled courses..."
                          value={accountSearchQuery}
                          onChange={(e) => setAccountSearchQuery(e.target.value)}
                          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-10 pr-4 text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] dark:text-gray-100 dark:placeholder:text-gray-400"
                        />
                        <i className="fa fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Total Amount Paid
                      </p>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(totalAmountPaid)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Combined `Amount Paid` across all enrolled courses in your account.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Based on {accountEnrollments.length} enrollment{accountEnrollments.length === 1 ? '' : 's'}
                          </div>
                          <Link
                            href={{ pathname: '/portal/account/payments' }}
                            className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[#201a7c] transition-colors hover:bg-gray-50 dark:text-[#7b75ef] dark:hover:bg-gray-800"
                          >
                            Breakdown
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Payable Amount
                      </p>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(totalPayableAmount)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Remaining balance for paid enrollments, calculated from `Course Price` minus `Amount Paid`.
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Only includes enrollments with `Enrollment Type` set to `paid`
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {filteredAccountEnrollments.length > 0 ? (
                  <div className="space-y-6">
                    {groupedAccountEnrollments.map((group) => (
                      <div key={group.label} className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
                        <div className="border-b border-[var(--card-border)] bg-gray-50 px-5 py-3 dark:bg-gray-800/40">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                              {group.label}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {group.items.length} {group.items.length === 1 ? 'enrollment' : 'enrollments'}
                            </span>
                          </div>
                        </div>

                        {group.items.map((enrollment) => {
                          const course = enrollment.course;
                          if (!course) return null;

                          const instructorName = course.instructor?.user?.firstName
                            ? `${course.instructor.user.firstName} ${course.instructor.user.lastName || ''}`.trim()
                            : 'Instructor';
                          const progress = enrollment.progressPercentage || 0;
                          const displayStatus = getEnrollmentDisplayStatus(enrollment);
                          const enrolledDate = formatEnrollmentHistoryDate(enrollment.enrolledAt);

                          return (
                            <div
                              key={enrollment.id}
                              className="group flex flex-col gap-4 border-b border-[var(--card-border)] px-5 py-4 transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/30 last:border-b-0 md:flex-row md:items-start"
                            >
                              <div className="min-w-[92px] flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                <div className="font-semibold text-gray-700 dark:text-gray-200">{enrolledDate}</div>
                                <div className="mt-1">Enrolled</div>
                              </div>

                              <div className="flex min-w-0 items-start gap-4 flex-1">
                                <img
                                  src={getMediaUrl(course.thumbnail)}
                                  alt={course.title || 'Course'}
                                  className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                />

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                                    <h3 className="truncate font-semibold text-gray-900 transition-colors group-hover:text-[#201a7c] dark:text-gray-100 dark:group-hover:text-[#7b75ef]">
                                      {course.title}
                                    </h3>
                                    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${getEnrollmentBadgeClasses(enrollment)}`}>
                                      {displayStatus}
                                    </span>
                                  </div>

                                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{instructorName}</span>
                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                    <span>{course.difficultyLevel || 'Standard'}</span>
                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                    <span>
                                      {course.estimatedDuration
                                        ? `${course.estimatedDuration} ${course.estimatedDurationUnit || 'Hours'}`
                                        : 'Self-paced'}
                                    </span>
                                  </div>

                                  <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                                    <div className="min-w-[140px]">
                                      <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Progress</span>
                                        <span className="font-medium">{progress}%</span>
                                      </div>
                                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                          className="h-2 rounded-full bg-[#201a7c] dark:bg-[#5c54e0]"
                                          style={{ width: `${progress}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                      Enrollment status: {formatStatusLabel(enrollment.status)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-shrink-0 md:pl-4">
                                <Link
                                  href={`/portal/account/enrollments/${enrollment.id}`}
                                  className="whitespace-nowrap text-sm font-medium text-[#201a7c] transition-colors hover:text-[#1a1563] dark:text-[#7b75ef] dark:hover:text-[#968fff]"
                                >
                                  {getEnrollmentActionLabel(enrollment.status)} →
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <i className="fa fa-book-open text-2xl text-gray-400 dark:text-gray-500"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {accountEnrollments.length === 0 ? 'No enrolled courses yet' : 'No matching courses found'}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {accountEnrollments.length === 0
                        ? 'Your enrollments will appear here as soon as they are added to your account.'
                        : 'Try a different search term to find one of your enrolled courses.'}
                    </p>
                    {accountEnrollments.length === 0 ? (
                      <Link
                        href="/portal/courses"
                        className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#201a7c] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#1a1563] dark:bg-[#3028a3] dark:hover:bg-[#3b32c4]"
                      >
                        View Courses
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAccountSearchQuery('')}
                        className="mt-6 inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Sign out</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    End your current session on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAccountLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
