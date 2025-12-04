'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: 'user' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'billing', label: 'Billing & Plans', icon: 'credit-card' },
    { id: 'maritime', label: 'Maritime Preferences', icon: 'anchor' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-[10px]">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="mt-2 text-gray-500">Manage your account settings and preferences</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[10px] py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex flex-col">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-l-4 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">
                      {tab.icon === 'user' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      {tab.icon === 'shield' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {tab.icon === 'bell' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                        </svg>
                      )}
                      {tab.icon === 'credit-card' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      {tab.icon === 'anchor' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21.575c0-.88.716-1.597 1.597-1.597H19.5c.88 0 1.597.716 1.597 1.597m0 0h.75m-3.75 0H13.5m5.25 0v-1.5a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5m-3 0v-6.036a2.25 2.25 0 00-3.182-2.048l-.486.194a.75.75 0 01-.968-.576l-.322-1.59a.75.75 0 01.576-.88l.194-.04a2.25 2.25 0 001.606-2.675l-.166-.664a2.25 2.25 0 00-2.755-1.623l-1.328.266a2.25 2.25 0 00-1.766 2.58l.166.664a.75.75 0 01-.527.897l-1.589.397a.75.75 0 01-.897-.527l-.166-.664a2.25 2.25 0 00-2.58-1.766l-1.328.266a2.25 2.25 0 00-1.623 2.755l.166.664a.75.75 0 01-.397.897l-1.59.322a.75.75 0 01-.88-.576l-.194-.486a2.25 2.25 0 00-2.048-3.182H3.75" />
                        </svg>
                      )}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                  <p className="mt-1 text-sm text-gray-500">Update your photo and personal details.</p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 border-4 border-white shadow-sm">
                    AM
                  </div>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Change Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        defaultValue="Alex"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        defaultValue="Mercer"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue="alex.mercer@grandline.com"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <div className="mt-1">
                      <select
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      >
                        <option>Singapore</option>
                        <option>Philippines</option>
                        <option>India</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                      Timezone
                    </label>
                    <div className="mt-1">
                      <select
                        id="timezone"
                        name="timezone"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      >
                        <option>Asia/Singapore (GMT+8)</option>
                        <option>UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
                  <p className="mt-1 text-sm text-gray-500">Manage how you receive alerts and updates.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="expiry_alerts"
                        name="expiry_alerts"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="expiry_alerts" className="font-medium text-gray-700">
                        Certificate Expiry Alerts
                      </label>
                      <p className="text-gray-500">Receive notifications 90, 60, and 30 days before a certificate expires.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="course_updates"
                        name="course_updates"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="course_updates" className="font-medium text-gray-700">
                        Course Updates
                      </label>
                      <p className="text-gray-500">Get notified when new modules are added to your enrolled courses.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="marketing"
                        name="marketing"
                        type="checkbox"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="marketing" className="font-medium text-gray-700">
                        Promotional Emails
                      </label>
                      <p className="text-gray-500">Receive news about new courses and special offers.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maritime' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Maritime Preferences</h2>
                  <p className="mt-1 text-sm text-gray-500">Customize your learning path based on your career goals.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
                      Current Rank
                    </label>
                    <div className="mt-1">
                      <select
                        id="rank"
                        name="rank"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      >
                        <option>Master</option>
                        <option>Chief Officer</option>
                        <option>Second Officer</option>
                        <option>Third Officer</option>
                        <option>Cadet (Deck)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="vessel-type" className="block text-sm font-medium text-gray-700">
                      Primary Vessel Type
                    </label>
                    <div className="mt-1">
                      <select
                        id="vessel-type"
                        name="vessel-type"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      >
                        <option>LNG Carrier</option>
                        <option>LPG Carrier</option>
                        <option>Oil Tanker</option>
                        <option>Container Ship</option>
                        <option>Bulk Carrier</option>
                        <option>Offshore Support Vessel</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interested Categories
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Navigation', 'Cargo Handling', 'Engineering', 'Safety & Security', 'Maritime Law', 'Leadership'].map((category) => (
                        <div key={category} className="flex items-center h-5">
                          <input
                            id={`cat-${category}`}
                            name={`cat-${category}`}
                            type="checkbox"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                          />
                          <label htmlFor={`cat-${category}`} className="text-sm text-gray-600">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'security' || activeTab === 'billing') && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Secure Area</h3>
                <p className="mt-1 text-sm text-gray-500">Please verify your identity to access these settings.</p>
                <div className="mt-6">
                  <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Verify Identity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
