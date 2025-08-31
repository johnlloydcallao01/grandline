'use client';

import { useState, useEffect } from 'react';
import { Users,
  FileText,
  TrendingUp,
  BarChart3,
  Eye,
  MessageSquare,
  Heart,
  Share2 } from '@/components/ui/IconWrapper';
import { useAuth, getFullName } from '@/hooks/useAuth';
import type { AuthUser } from '@/hooks/useAuth';

// This hook is now replaced by the shared useAuth hook

// Hook to fetch all users from PayloadCMS
function useAllUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const apiUrl = 'https://grandline-cms.vercel.app/api';

        console.log('🍪 All cookies:', document.cookie);
        console.log('🌐 API URL:', apiUrl);
        console.log('📡 Fetching all users...');

        const response = await fetch(`${apiUrl}/users`, {
          credentials: 'include',
        });

        console.log('📡 /users STATUS:', response.status);

        if (response.ok) {
          const usersData = await response.json();
          console.log('✅ USERS FETCH SUCCESS');
          console.log('🔍 FULL USERS RESPONSE:', usersData);
          console.log('🔍 USERS RESPONSE KEYS:', Object.keys(usersData));

          // PayloadCMS typically returns { docs: [...users], totalDocs: number, ... }
          const usersList = usersData.docs || usersData.users || usersData;

          console.log('👥 USERS LIST:', usersList);
          console.log('👥 TOTAL USERS:', usersList.length);

          if (Array.isArray(usersList)) {
            usersList.forEach((user, index) => {
              console.log(`👤 User ${index + 1}:`, {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                first_name: user.first_name,
                lastName: user.lastName,
                last_name: user.last_name,
                role: user.role
              });
            });
          }

          setUsers(usersList);
        } else {
          const errorText = await response.text();
          console.log('❌ USERS FETCH FAILED');
          console.log('❌ STATUS:', response.status);
          console.log('❌ ERROR:', errorText);
          setError(`Failed to fetch users: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.log('❌ USERS FETCH ERROR:', error);
        setError(`Network error: ${error}`);
      } finally {
        setLoading(false);
      }
    }

    fetchAllUsers();
  }, []);

  return { users, loading, error };
}

export default function DashboardPage() {
  const { user: currentUser, loading: currentUserLoading, error: currentUserError } = useAuth();
  const { users, loading: usersLoading, error: usersError } = useAllUsers();
  return (
    <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of your platform performance</p>

            {/* User Greeting */}
            <div className="mt-4">
              {currentUserLoading ? (
                <div className="text-gray-600">Loading user...</div>
              ) : currentUser ? (
                <div className="text-lg text-gray-700">
                  👋 Howdy, <span className="font-medium text-gray-900">
                    {currentUser.firstName || 'Admin'}
                  </span>!
                </div>
              ) : (
                <div className="text-lg text-gray-700">
                  👋 Howdy, Admin!
                </div>
              )}
            </div>
          </div>

          {/* My Authenticated Account */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔐 My Authenticated Account Loggedin Now
            </h2>

            {currentUserLoading ? (
              <div className="text-gray-600">Loading current user from /users/me...</div>
            ) : currentUserError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-lg text-red-700 mb-2">
                  ❌ Error Fetching Current User
                </div>
                <div className="text-sm text-red-600">
                  {currentUserError}
                </div>
              </div>
            ) : currentUser ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-lg text-blue-700 mb-3">
                  ✅ Current User from /users/me endpoint:
                </div>
                <div className="bg-white border border-blue-300 rounded p-3">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Raw Response:</strong>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(currentUser, null, 2)}
                  </pre>

                  {currentUser ? (
                    <div className="mt-3">
                      <div className="font-medium text-gray-900">
                        👤 {getFullName(currentUser)}
                      </div>
                      <div className="text-sm text-gray-600">
                        📧 {currentUser.email || 'No Email'}
                      </div>
                      <div className="text-sm text-gray-600">
                        🏷️ Role: {currentUser.role || 'No Role'}
                      </div>
                      <div className="text-sm text-green-600 mt-2">
                        ✅ Successfully loaded user data from PayloadCMS!
                      </div>
                    </div>
                  ) : currentUserError ? (
                    <div className="mt-3">
                      <div className="text-red-700 mb-3">
                        ❌ Authentication Error
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {currentUserError}
                      </div>
                      <button
                        onClick={() => {
                          // Clear all cookies and redirect to login
                          document.cookie.split(";").forEach(function(c) {
                            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                          });
                          window.location.href = '/admin/login';
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        🔄 Clear Cookies & Re-login
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 text-yellow-700">
                      ⚠️ No user data available
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-gray-700">
                  No current user data received
                </div>
              </div>
            )}
          </div>

          {/* All Users Display */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🧪 PayloadCMS Users Test - Fetching All Users
            </h2>

            {usersLoading ? (
              <div className="text-gray-600">Loading all users from PayloadCMS...</div>
            ) : usersError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-lg text-red-700 mb-2">
                  ❌ Error Fetching Users
                </div>
                <div className="text-sm text-red-600">
                  {usersError}
                </div>
              </div>
            ) : users.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-lg text-green-700 mb-4">
                  ✅ Successfully Fetched {users.length} Users from PayloadCMS
                </div>
                <div className="space-y-3">
                  {users.map((user, index) => {
                    const firstName = user.firstName || 'No First Name';
                    const lastName = user.lastName || 'No Last Name';
                    const email = user.email || 'No Email';
                    const role = user.role || 'No Role';

                    return (
                      <div key={user.id || index} className="bg-white border border-green-300 rounded p-3">
                        <div className="font-medium text-gray-900">
                          👤 {firstName} {lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          📧 {email}
                        </div>
                        <div className="text-sm text-gray-600">
                          🏷️ Role: {role}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-sm text-green-600">
                  🎯 This proves PayloadCMS API is working and authentication is valid!
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-lg text-yellow-700 mb-2">
                  ⚠️ No Users Found
                </div>
                <div className="text-sm text-yellow-600">
                  PayloadCMS returned an empty users list.
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">15,420</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">89.2K</p>
                  <p className="text-sm text-green-600">+18% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">4.2K</p>
                  <p className="text-sm text-green-600">+25% from last month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">3.8%</p>
                  <p className="text-sm text-green-600">+0.5% from last month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Traffic Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Traffic Overview</h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                    <p className="text-sm text-gray-400">Integration with analytics service needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Users (24h)</span>
                    <span className="text-sm font-medium text-gray-900">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Registrations</span>
                    <span className="text-sm font-medium text-gray-900">45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <span className="text-sm font-medium text-gray-900">32.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Session Duration</span>
                    <span className="text-sm font-medium text-gray-900">4m 32s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Content Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Performing Content</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Getting Started with E-commerce Marketing
                          </div>
                          <div className="text-sm text-gray-500">Blog Post</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      12,450
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-900">234</span>
                        <Share2 className="h-4 w-4 text-blue-500 ml-3 mr-1" />
                        <span className="text-sm text-gray-900">89</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Advanced SEO Strategies for 2024
                          </div>
                          <div className="text-sm text-gray-500">Blog Post</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      8,920
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-900">156</span>
                        <Share2 className="h-4 w-4 text-blue-500 ml-3 mr-1" />
                        <span className="text-sm text-gray-900">67</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
