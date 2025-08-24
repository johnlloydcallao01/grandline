'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * Professional Menu Page - Facebook-style user menu
 * Mobile-optimized with comprehensive app navigation and user options
 */

// Mock user data
const mockUser = {
  name: 'Alex Maritime',
  email: 'alex.maritime@example.com',
  rank: 'Third Officer',
  company: 'Global Shipping Ltd.',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  memberSince: '2023',
  coursesCompleted: 8,
  certificatesEarned: 6
};

// Menu sections data
const menuSections = [
  {
    title: 'Learning',
    items: [
      { icon: 'fa-graduation-cap', label: 'My Courses', path: '/portal', badge: '3' },
      { icon: 'fa-certificate', label: 'Certificates', path: '/certificates', badge: null },
      { icon: 'fa-chart-line', label: 'Progress', path: '/progress', badge: null },
      { icon: 'fa-bookmark', label: 'Saved Courses', path: '/saved', badge: '12' },
      { icon: 'fa-history', label: 'Learning History', path: '/history', badge: null }
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: 'fa-user-edit', label: 'Edit Profile', path: '/profile', badge: null },
      { icon: 'fa-cog', label: 'Settings', path: '/settings', badge: null },
      { icon: 'fa-bell', label: 'Notifications', path: '/notifications', badge: '5' },
      { icon: 'fa-credit-card', label: 'Billing & Payments', path: '/billing', badge: null },
      { icon: 'fa-shield-alt', label: 'Privacy & Security', path: '/privacy', badge: null }
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: 'fa-question-circle', label: 'Help Center', path: '/help', badge: null },
      { icon: 'fa-comments', label: 'Contact Support', path: '/support', badge: null },
      { icon: 'fa-bug', label: 'Report Issue', path: '/report', badge: null },
      { icon: 'fa-star', label: 'Rate App', path: '/rate', badge: null }
    ]
  },
  {
    title: 'More',
    items: [
      { icon: 'fa-users', label: 'Invite Friends', path: '/invite', badge: null },
      { icon: 'fa-share-alt', label: 'Share App', path: '/share', badge: null },
      { icon: 'fa-info-circle', label: 'About', path: '/about', badge: null },
      { icon: 'fa-file-alt', label: 'Terms & Privacy', path: '/terms', badge: null }
    ]
  }
];

export default function MenuPage() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleMenuItemClick = (path: string) => {
    router.push(path as any);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    setShowLogoutConfirm(false);
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-blue-100 text-sm mt-1">Account and app settings</p>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={mockUser.avatar}
                alt={mockUser.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{mockUser.name}</h2>
              <p className="text-sm text-gray-600">{mockUser.rank}</p>
              <p className="text-sm text-gray-500">{mockUser.company}</p>
            </div>
            <button 
              onClick={() => handleMenuItemClick('/profile')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <i className="fa fa-chevron-right text-gray-600 text-sm"></i>
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-[#201a7c]">{mockUser.coursesCompleted}</div>
              <div className="text-xs text-gray-600">Courses</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{mockUser.certificatesEarned}</div>
              <div className="text-xs text-gray-600">Certificates</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{mockUser.memberSince}</div>
              <div className="text-xs text-gray-600">Member Since</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 py-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">{section.title}</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleMenuItemClick(item.path)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className={`fa ${item.icon} text-gray-600`}></i>
                    </div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    <i className="fa fa-chevron-right text-gray-400 text-sm"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fa fa-sign-out-alt text-red-600"></i>
              </div>
              <span className="font-medium text-red-600">Log Out</span>
            </div>
            <i className="fa fa-chevron-right text-red-400 text-sm"></i>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 pb-20">
        <div className="text-center text-gray-500 text-sm">
          <p>Grandline Maritime Training</p>
          <p>Version 1.0.0</p>
          <p className="mt-2">© 2024 Grandline Maritime Training Center</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa fa-sign-out-alt text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Log Out</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
