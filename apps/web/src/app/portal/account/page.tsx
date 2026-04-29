'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TABS = ['Profile', 'PII', 'Account', 'Preferences'];

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Default to the tab in URL if valid, otherwise 'Profile'
  const initialTab = TABS.includes(tabFromUrl || '') ? tabFromUrl! : 'Profile';

  const [activeTab, setActiveTab] = useState(initialTab);
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
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-[10px] py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Account</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your account details, profile, and preferences</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Public Profile</h2>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center relative group cursor-pointer">
                  <i className="fa fa-user text-4xl text-gray-400"></i>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa fa-camera text-white text-xl"></i>
                  </div>
                </div>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Change Avatar</button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rank / Position</label>
                  <input
                    type="text"
                    defaultValue="Cadet"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Type Experience</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Container Ship</option>
                    <option>Oil Tanker</option>
                    <option>Bulk Carrier</option>
                    <option>LNG/LPG</option>
                    <option>Cruise Ship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <input
                    type="text"
                    defaultValue="Philippines"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="Aspiring deck officer with a passion for maritime safety and navigation."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'PII' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Personally Identifiable Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name</label>
                <input
                  type="text"
                  defaultValue="John Michael Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  defaultValue="1995-03-15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Government ID / SSN</label>
                <input
                  type="text"
                  placeholder="XXX-XX-XXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Encrypted and securely stored</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                <input
                  type="text"
                  placeholder="P12345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seaman's Book Number</label>
                <input
                  type="text"
                  placeholder="S1234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Philippines</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>India</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Home Address</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="123 Main Street, Barangay San Antonio, Manila, Philippines 1000"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    defaultValue="Jane Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    defaultValue="+63 912 345 6789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Notification Preferences</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive daily summaries and course updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Real-time alerts for assignments and messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.push} onChange={() => setNotifications({ ...notifications, push: !notifications.push })} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Security Alerts</h3>
                  <p className="text-sm text-gray-500">Login attempts and password changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.security} disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Account' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa fa-tools text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Under Construction</h3>
            <p className="text-gray-500 mt-2">This section is currently being updated with new features.</p>
          </div>
        )}
      </div>
    </div>
  );
}
