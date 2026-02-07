'use client';

import React from 'react';
import { Search, Plus, Filter, FileText, Clock, MoreHorizontal } from '@/components/ui/IconWrapper';

export default function AssessmentsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
                    <p className="text-gray-600 mt-1">Create and manage quizzes, tests, and exams</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                </button>
            </div>

            {/* Assessment List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Limit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { title: 'React Hooks Final Exam', type: 'Exam', questions: 25, time: '60 mins', date: 'Oct 24, 2024' },
                            { title: 'TypeScript Basics Quiz', type: 'Quiz', questions: 10, time: '15 mins', date: 'Oct 20, 2024' },
                            { title: 'UX Principles Test', type: 'Test', questions: 15, time: '30 mins', date: 'Oct 15, 2024' },
                        ].map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{item.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.questions}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                    {item.time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
