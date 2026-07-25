'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Shield, Users, UserCheck, Activity, Key, Clock,
    CheckCircle, XCircle, AlertTriangle, RefreshCw, Bell, EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import {
    fetchSecurityDashboard,
    fetchSecurityEvents,
    fetchUsersSecurityStatus,
    toggleUserActiveStatus,
    updateUserSecurityAlerts,
    type SecurityDashboardData,
    type SecurityEventItem,
    type UserSecurityItem,
} from './actions';

function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getEventBadge(eventType: string) {
    const styles: Record<string, string> = {
        LOGIN_SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        LOGIN_FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        PASSWORD_CHANGED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
        USER_CREATED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        ROLE_CHANGED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
        PROFILE_UPDATED: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
        USER_DEACTIVATED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        USER_REACTIVATED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    };
    const label = eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { label, className: styles[eventType] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' };
}

function getUserName(user: SecurityEventItem['user']): string {
    if (typeof user === 'object' && user !== null) {
        return `${user.firstName} ${user.lastName}`;
    }
    return `User #${user}`;
}

function getUserEmail(user: SecurityEventItem['user']): string {
    if (typeof user === 'object' && user !== null) {
        return user.email;
    }
    return '';
}

export default function SecuritySettingsPage() {
    const [dashboard, setDashboard] = useState<SecurityDashboardData | null>(null);
    const [events, setEvents] = useState<SecurityEventItem[]>([]);
    const [users, setUsers] = useState<UserSecurityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit'>('overview');
    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [dashData, eventsData, usersData] = await Promise.all([
                fetchSecurityDashboard(),
                fetchSecurityEvents(50),
                fetchUsersSecurityStatus(),
            ]);
            setDashboard(dashData);
            setEvents(eventsData);
            setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load security data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void loadData(); }, [loadData]);

    const handleToggleActive = async (userId: number, current: boolean) => {
        try {
            await toggleUserActiveStatus(userId, !current);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !current } : u));
            addToast({ title: 'User status updated', type: 'success' });
        } catch {
            addToast({ title: 'Failed to update user status', type: 'error' });
        }
    };

    const handleToggleAlerts = async (userId: number, current: boolean) => {
        try {
            await updateUserSecurityAlerts(userId, !current);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, securityAlertsEmailEnabled: !current } : u));
            addToast({ title: 'Security alert preference updated', type: 'success' });
        } catch {
            addToast({ title: 'Failed to update alert preference', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
                    </div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Failed to Load Security Data</h2>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button onClick={loadData} className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-sm font-medium">
                        <RefreshCw className="h-4 w-4 mr-2" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: Shield },
        { id: 'users' as const, label: 'Users & MFA', icon: Users },
        { id: 'audit' as const, label: 'Audit Log', icon: Activity },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage security preferences, users, and access controls</p>
                </div>
                <button onClick={loadData} className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[var(--card-background)] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </button>
            </div>

            <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
                <nav className="flex space-x-6">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
                            >
                                <Icon className="h-4 w-4 mr-2" /> {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {activeTab === 'overview' && dashboard && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[var(--card-background)] p-5 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dashboard.totalUsers}</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"><Users className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] p-5 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Users</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{dashboard.activeUsers}</p>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg"><UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] p-5 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Inactive Users</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{dashboard.inactiveUsers}</p>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"><EyeOff className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] p-5 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Security Events</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{events.length}</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg"><Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[var(--card-background)] p-6 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600 dark:text-blue-400 mr-3"><Key className="h-5 w-5" /></div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Password Policy</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Password Expiry</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dashboard.securityConfig.passwordExpiryDays} Days</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Max Login Attempts</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dashboard.securityConfig.maxLoginAttempts}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Lockout Duration</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dashboard.securityConfig.lockoutDuration} minutes</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Require 2FA</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dashboard.securityConfig.requireTwoFA ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                        {dashboard.securityConfig.requireTwoFA ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[var(--card-background)] p-6 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-purple-600 dark:text-purple-400 mr-3"><Clock className="h-5 w-5" /></div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Session & Login</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Session Timeout</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.floor(dashboard.securityConfig.sessionTimeout / 60)} minutes</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Token Expiration</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">30 days</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Users with Recent Login</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{users.filter(u => u.lastLogin).length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-orange-600 dark:text-orange-400 mr-3"><Bell className="h-5 w-5" /></div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security Alert Preferences</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Users with security email alerts enabled will receive notifications for password changes and suspicious login attempts.
                            </p>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Users with Alerts Enabled</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {users.filter(u => u.securityAlertsEmailEnabled).length} of {users.length} users
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all" style={{ width: `${users.length ? (users.filter(u => u.securityAlertsEmailEnabled).length / users.length) * 100 : 0}%` }} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {users.length ? Math.round((users.filter(u => u.securityAlertsEmailEnabled).length / users.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Security Status</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage user account status and security alert preferences</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Last Login</th>
                                    <th className="px-6 py-3">Security Alerts</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400"><CheckCircle className="h-4 w-4 mr-1.5" /> Active</span>
                                            ) : (
                                                <span className="inline-flex items-center text-sm text-red-600 dark:text-red-400"><XCircle className="h-4 w-4 mr-1.5" /> Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {user.lastLogin ? formatTimestamp(user.lastLogin) : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleAlerts(user.id, !!user.securityAlertsEmailEnabled)}
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${user.securityAlertsEmailEnabled ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${user.securityAlertsEmailEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleActive(user.id, user.isActive)}
                                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${user.isActive ? 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30'}`}
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security Audit Log</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recent security events across the platform</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">Event</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {events.map(event => {
                                    const badge = getEventBadge(event.eventType);
                                    return (
                                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getUserName(event.user)}</p>
                                                    {getUserEmail(event.user) && <p className="text-xs text-gray-500 dark:text-gray-400">{getUserEmail(event.user)}</p>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{event.ipAddress || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatTimestamp(event.timestamp)}</td>
                                        </tr>
                                    );
                                })}
                                {events.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No security events recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
