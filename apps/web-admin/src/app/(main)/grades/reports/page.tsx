'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    BarChart3, Download, FileText,
    TrendingUp, Users, Calendar, Filter, Search
} from '@/components/ui/IconWrapper';

export default function GradeReportsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'analytics';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/grades/reports?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Grade Reports</h1>
                    <p className="text-gray-600 mt-1">Analyze student performance and export grade data</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        This Semester
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {['analytics', 'students', 'export'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize
                            ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                            }
                        `}
                    >
                        {tab === 'analytics' ? 'Class Analytics' : tab === 'students' ? 'Individual Reports' : 'Export Data'}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Class Average</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">82%</h3>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-green-600 mt-2 font-medium">↑ 4% vs last semester</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Submission Rate</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">94%</h3>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">12 late submissions</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">88%</h3>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">156/178 students passed</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Top Course</p>
                                    <h3 className="text-xl font-bold text-gray-900 mt-1">React 101</h3>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Avg. Grade: 91%</p>
                        </div>
                    </div>

                    {/* Chart Area Placeholder */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center min-h-[300px] flex flex-col items-center justify-center">
                        <BarChart3 className="h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Performance Distribution</h3>
                        <p className="text-gray-500 max-w-md mt-2">
                            Visual representation of student grades across all courses.
                            (Chart component would render here)
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'export' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Download className="h-5 w-5 mr-2 text-blue-600" />
                        Export Data
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                            <select className="w-full border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>Complete Gradebook</option>
                                <option>Semester Summary</option>
                                <option>Student Attendance & Grades</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                            <div className="flex gap-4">
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                                    <input type="radio" name="format" className="h-4 w-4 text-blue-600" defaultChecked />
                                    <span className="ml-3 font-medium">CSV</span>
                                </label>
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                                    <input type="radio" name="format" className="h-4 w-4 text-blue-600" />
                                    <span className="ml-3 font-medium">Excel (XLSX)</span>
                                </label>
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                                    <input type="radio" name="format" className="h-4 w-4 text-blue-600" />
                                    <span className="ml-3 font-medium">PDF</span>
                                </label>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-4">
                            Download Report
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'students' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Individual Student Reports</h3>
                    <p className="text-gray-500 mt-2">Search for a student to view their detailed grade history and transcript.</p>
                    <div className="mt-6 max-w-md mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            )}
        </div>
    );
}
