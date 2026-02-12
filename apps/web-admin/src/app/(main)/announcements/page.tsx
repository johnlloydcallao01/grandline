'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Bell, Globe, BookOpen, Plus,
    Search, Filter, Megaphone,
    Calendar, MoreHorizontal, Edit,
    User, Eye
} from '@/components/ui/IconWrapper';

export default function AnnouncementsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'global';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/announcements?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">Broadcast updates to your entire platform or specific courses</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                    { id: 'global', label: 'Global Announcements', icon: Globe },
                    { id: 'course', label: 'Course-Specific', icon: BookOpen },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                            flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                            }
                        `}
                    >
                        <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {activeTab === 'global' ? <GlobalAnnouncements /> : <CourseAnnouncements />}
            </div>
        </div>
    );
}

function GlobalAnnouncements() {
    const announcements = [
        { id: 1, title: 'Platform Maintenance Scheduled', date: 'Oct 24, 2024', author: 'System Admin', status: 'Published', views: 1250 },
        { id: 2, title: 'New Features in Course Builder', date: 'Oct 15, 2024', author: 'Product Team', status: 'Published', views: 3400 },
        { id: 3, title: 'Holiday Support Hours', date: 'Dec 20, 2024', author: 'Support Team', status: 'Scheduled', views: 0 },
    ];

    return (
        <div className="space-y-4">
            {announcements.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start">
                            <div className="p-3 bg-blue-50 rounded-lg mr-4">
                                <Globe className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {item.date}</span>
                                    <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1" /> {item.author}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Published' ? 'bg-green-100 text-green-800' :
                                item.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {item.status}
                            </span>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">{item.views} Views</span>
                        <div className="flex gap-3">
                            <button className="text-gray-600 hover:text-blue-600 font-medium text-xs flex items-center">
                                <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 font-medium text-xs flex items-center">
                                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CourseAnnouncements() {
    const announcements = [
        { id: 1, title: 'Final Exam Preparation', course: 'React Fundamentals', date: 'Oct 22, 2024', author: 'Instructor Doe', status: 'Published' },
        { id: 2, title: 'Guest Lecture Next Week', course: 'Advanced Marketing Strategies', date: 'Oct 20, 2024', author: 'Instructor Smith', status: 'Published' },
        { id: 3, title: 'Assignment Deadline Extended', course: 'UI/UX Design Principles', date: 'Oct 18, 2024', author: 'Instructor Brown', status: 'Published' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Announcement</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {announcements.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                    {item.course}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                                <div>{item.date}</div>
                                <div>by {item.author}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
