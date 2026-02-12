'use client';

import { useState } from 'react';
import { Settings, Save, Mail, Globe } from '@/components/ui/IconWrapper';

export default function GeneralSettingsPage() {
  const [activeTab, setActiveTab] = useState('site');
  const [settings, setSettings] = useState({
    site: {
      name: 'Encreasl Admin',
      description: 'Professional admin dashboard for content management',
      timezone: 'UTC',
      logo: null, // Placeholder for logo upload
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUser: 'admin@example.com',
      smtpPassword: '••••••••',
      senderName: 'Encreasl System',
      senderEmail: 'noreply@example.com',
    }
  });

  const tabs = [
    { id: 'site', name: 'Site Configuration', icon: Globe },
    { id: 'email', name: 'Email Settings (SMTP)', icon: Mail },
  ];

  const handleSave = () => {
    // TODO: Implement settings save
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="text-gray-600 mt-1">Manage site configuration and email preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                        flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                      `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'site' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.site.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, site: { ...prev.site, name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                      <span className="text-xs">Logo</span>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Upload New
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.site.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, site: { ...prev.site, timezone: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.site.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, site: { ...prev.site, description: e.target.value } }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">SMTP Configuration</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: { ...prev.email, smtpHost: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: { ...prev.email, smtpPort: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: { ...prev.email, smtpUser: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: { ...prev.email, smtpPassword: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 mt-4">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Sender Information</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
                  <input
                    type="text"
                    value={settings.email.senderName}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: { ...prev.email, senderName: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sender Email</label>
                  <input
                    type="email"
                    value={settings.email.senderEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: { ...prev.email, senderEmail: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
