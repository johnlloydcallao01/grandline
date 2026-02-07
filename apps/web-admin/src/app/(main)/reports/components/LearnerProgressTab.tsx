'use client';

import React from 'react';
import { Search, Filter, Download, User, CheckCircle, Clock, AlertCircle } from '@/components/ui/IconWrapper';

export function LearnerProgressTab() {
    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search learner..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </button>
                    <button className="flex items-center px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Learners</p>
                    <p className="text-2xl font-bold text-gray-900">2,543</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Active Today</p>
                    <p className="text-2xl font-bold text-green-600">432</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Avg. Completion</p>
                    <p className="text-2xl font-bold text-blue-600">68%</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">At Risk</p>
                    <p className="text-2xl font-bold text-red-600">12</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Individual Progress</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[
                                { name: 'Alice Johnson', email: 'alice@example.com', course: 'React Fundamentals', progress: 100, score: 98, lastActive: '2 hours ago', status: 'Completed' },
                                { name: 'Bob Smith', email: 'bob@example.com', course: 'Advanced TypeScript', progress: 45, score: 85, lastActive: '1 day ago', status: 'In Progress' },
                                { name: 'Charlie Brown', email: 'charlie@example.com', course: 'UI/UX Design', progress: 12, score: null, lastActive: '5 days ago', status: 'In Progress' },
                                { name: 'Diana Ross', email: 'diana@example.com', course: 'React Fundamentals', progress: 0, score: null, lastActive: 'Never', status: 'Not Started' },
                                { name: 'Evan Wright', email: 'evan@example.com', course: 'Advanced TypeScript', progress: 89, score: 92, lastActive: '10 mins ago', status: 'In Progress' },
                            ].map((learner, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{learner.name}</div>
                                                <div className="text-sm text-gray-500">{learner.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${learner.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{learner.progress}%</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.score ? `${learner.score}%` : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{learner.lastActive}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${learner.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                learner.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {learner.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {learner.status === 'In Progress' && <Clock className="w-3 h-3 mr-1" />}
                                            {learner.status === 'Not Started' && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {learner.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
