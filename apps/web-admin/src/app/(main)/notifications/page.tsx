'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Bell, Mail, FileText, Plus,
    Search, Filter, MoreHorizontal,
    CheckCircle, Clock, AlertTriangle,
    Edit, Trash2, Send, Eye
} from '@/components/ui/IconWrapper';

export default function NotificationsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'email';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/notifications?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
                    <p className="text-gray-600 mt-1">Manage automated and manual communications</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Settings
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Notification
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'email', label: 'Email Notifications', icon: Mail },
                        { id: 'in-app', label: 'In-App Notifications', icon: Bell },
                        { id: 'templates', label: 'Notification Templates', icon: FileText },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Search & Filter Bar (Common) */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Draft</option>
                            <option>Paused</option>
                        </select>
                    </div>
                </div>

                {activeTab === 'email' && <EmailNotificationsList />}
                {activeTab === 'in-app' && <InAppNotificationsList />}
                {activeTab === 'templates' && <NotificationTemplatesList />}
            </div>
        </div>
    );
}

function EmailNotificationsList() {
    const emails = [
        { id: 1, subject: 'Welcome to the Platform', trigger: 'User Signup', stats: { sent: 1250, openRate: '68%', clickRate: '45%' }, status: 'Active', lastUpdated: '2 days ago' },
        { id: 2, subject: 'Course Completion Certificate', trigger: 'Course Completed', stats: { sent: 850, openRate: '92%', clickRate: '85%' }, status: 'Active', lastUpdated: '1 week ago' },
        { id: 3, subject: 'Subscription Renewal Reminder', trigger: '7 Days Before Expiry', stats: { sent: 340, openRate: '75%', clickRate: '40%' }, status: 'Active', lastUpdated: '3 days ago' },
        { id: 4, subject: 'New Course Announcement', trigger: 'Manual', stats: { sent: 5000, openRate: '45%', clickRate: '12%' }, status: 'Draft', lastUpdated: 'Yesterday' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject / Trigger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {emails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                                        <div className="text-xs text-gray-500 mt-1">Trigger: <span className="font-medium">{email.trigger}</span></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-4 text-xs">
                                    <div>
                                        <div className="text-gray-500">Sent</div>
                                        <div className="font-medium text-gray-900">{email.stats.sent}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Opens</div>
                                        <div className="font-medium text-gray-900">{email.stats.openRate}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Clicks</div>
                                        <div className="font-medium text-gray-900">{email.stats.clickRate}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${email.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {email.status === 'Active' && <span className="w-2 h-2 mr-1.5 rounded-full bg-green-500"></span>}
                                    {email.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {email.lastUpdated}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                    <button className="p-1 text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function InAppNotificationsList() {
    const notifications = [
        { id: 1, title: 'Assignment Graded', type: 'System', recipients: 'Specific User', status: 'Active' },
        { id: 2, title: 'New Comment on Discussion', type: 'Social', recipients: 'Course Participants', status: 'Active' },
        { id: 3, title: 'System Maintenance', type: 'System', recipients: 'All Users', status: 'Scheduled' },
        { id: 4, title: 'Flash Sale', type: 'Marketing', recipients: 'Leads', status: 'Draft' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {notifications.map((notif) => (
                        <tr key={notif.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center mr-4 ${notif.type === 'System' ? 'bg-amber-100 text-amber-600' :
                                            notif.type === 'Marketing' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{notif.type}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {notif.recipients}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notif.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        notif.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {notif.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function NotificationTemplatesList() {
    const templates = [
        { id: 1, name: 'Default Email Layout', type: 'HTML Email', lastEdited: '2 months ago' },
        { id: 2, name: 'Minimalist Alert', type: 'In-App', lastEdited: '1 week ago' },
        { id: 3, name: 'Dark Mode Newsletter', type: 'HTML Email', lastEdited: 'Yesterday' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
                <div key={template.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                    <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        <FileText className="h-10 w-10 text-gray-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button className="bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:text-blue-600">Preview</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{template.type}</p>
                        </div>
                        <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{template.lastEdited}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                            <button className="hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            ))}
            <button className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[250px]">
                <Plus className="h-8 w-8 mb-2" />
                <span className="font-medium">New Template</span>
            </button>
        </div>
    );
}
