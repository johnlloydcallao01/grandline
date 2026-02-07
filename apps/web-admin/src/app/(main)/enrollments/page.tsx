'use client';

import React, { useState } from 'react';
import { User, Users, RefreshCw, Plus, Search, Filter, Download } from '@/components/ui/IconWrapper';

export default function EnrollmentsPage() {
    const [activeTab, setActiveTab] = useState('manual'); // manual, bulk, auto

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Enrollments</h1>
                    <p className="text-gray-600 mt-1">Manage access and enrollment rules</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'manual', label: 'Manual Enrollment', icon: User },
                        { id: 'bulk', label: 'Bulk Enrollment', icon: Users },
                        { id: 'auto', label: 'Auto-Enrollment Rules', icon: RefreshCw },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
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

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === 'manual' && (
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 max-w-2xl">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Enroll Single User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Search by name or email..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                <select className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option>Choose a course...</option>
                                    <option>React Fundamentals</option>
                                    <option>Advanced TypeScript</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label className="ml-2 block text-sm text-gray-900">Send enrollment email notification</label>
                            </div>
                            <div className="pt-4">
                                <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                    Enroll User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center text-center py-12">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Bulk Import Enrollments</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Upload a CSV file containing user emails and course IDs to enroll multiple users at once.</p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </button>
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                Upload CSV
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'auto' && (
                    <div className="space-y-4">
                        {[
                            { name: 'All New Hires', condition: 'If Department = "All" AND Role = "Employee"', action: 'Enroll in "Onboarding 101"', status: 'Active' },
                            { name: 'Developers Path', condition: 'If Job Title contains "Developer"', action: 'Enroll in "Git Basics"', status: 'Active' },
                            { name: 'Sales Training', condition: 'If Department = "Sales"', action: 'Enroll in "Sales Fundamentals"', status: 'Paused' },
                        ].map((rule, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{rule.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Condition: {rule.condition}</p>
                                    <p className="text-xs text-blue-600 mt-1">Action: {rule.action}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {rule.status}
                                </span>
                            </div>
                        ))}
                        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700">
                            + Add New Rule
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
