'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search, Filter, MoreHorizontal,
    BarChart3, Users, BookOpen, Edit,
    CheckCircle, AlertCircle, ChevronDown, Download
} from '@/components/ui/IconWrapper';

export default function GradeManagementPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'overview';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/grades?${params.toString()}`);
    };

    // Mock Data for Overview
    const recentSubmissions = [
        { id: 1, student: 'Alice Johnson', course: 'React 101', assignment: 'Final Project', date: '2 hours ago', status: 'pending' },
        { id: 2, student: 'Bob Smith', course: 'Advanced Node.js', assignment: 'API Design Quiz', date: '4 hours ago', status: 'auto-graded' },
        { id: 3, student: 'Charlie Brown', course: 'UI/UX Fundamentals', assignment: 'Wireframe Exercise', date: '1 day ago', status: 'graded' },
    ];

    const courses = [
        { id: 1, name: 'React 101', students: 45, avgGrade: '88%', pending: 3 },
        { id: 2, name: 'Advanced Node.js', students: 32, avgGrade: '76%', pending: 12 },
        { id: 3, name: 'UI/UX Fundamentals', students: 50, avgGrade: '92%', pending: 0 },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
                    <p className="text-gray-600 mt-1">Monitor, review, and grade student submissions</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'by-course', label: 'By Course', icon: BookOpen },
                        { id: 'by-student', label: 'By Student', icon: Users },
                        { id: 'manual', label: 'Manual Grading', icon: Edit },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Pending Review</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
                                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full mt-2 inline-block">Needs Attention</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Avg. Course Grade</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">+2% from last week</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">Graded This Week</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">128</p>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2 inline-block">High Activity</span>
                            </div>
                        </div>

                        {/* Recent Submissions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">Recent Submissions</h3>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentSubmissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs mr-3">
                                                        {sub.student.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{sub.student}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.assignment}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.course}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        sub.status === 'graded' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'}`}>
                                                    {sub.status === 'pending' ? 'Needs Review' : sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {sub.status === 'pending' ? (
                                                    <button className="text-blue-600 hover:text-blue-900 font-medium">Grade Now</button>
                                                ) : (
                                                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-5 w-5" /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'by-course' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Grading</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                    <BookOpen className="h-4 w-4" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.students}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.avgGrade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {course.pending > 0 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    {course.pending} pending
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">All caught up</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {(activeTab === 'by-student' || activeTab === 'manual') && (
                    <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            {activeTab === 'manual' ? <Edit className="h-12 w-12" /> : <Users className="h-12 w-12" />}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 capitalize">{activeTab.replace('-', ' ')} View</h3>
                        <p className="text-gray-500 mt-2">This section allows for detailed {activeTab === 'manual' ? 'manual grading and feedback' : 'student grade analysis'}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
