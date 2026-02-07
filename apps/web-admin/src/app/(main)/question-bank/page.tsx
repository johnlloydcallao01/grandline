'use client';

import React from 'react';
import { Search, Plus, Filter, Tag, Flag, MoreHorizontal } from '@/components/ui/IconWrapper';

export default function QuestionBankPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                    <p className="text-gray-600 mt-1">Repository of all assessment questions</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search question text..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-3">
                    <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white">
                        <option>Type: All</option>
                        <option>Multiple Choice</option>
                        <option>True/False</option>
                        <option>Essay</option>
                    </select>
                    <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white">
                        <option>Category: All</option>
                        <option>Frontend</option>
                        <option>Backend</option>
                        <option>Design</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {[
                        { text: 'Which of the following is NOT a React Hook?', type: 'Multiple Choice', category: 'Frontend', difficulty: 'Easy' },
                        { text: 'Node.js is a single-threaded runtime.', type: 'True/False', category: 'Backend', difficulty: 'Medium' },
                        { text: 'Explain the difference between Grid and Flexbox.', type: 'Essay', category: 'Design', difficulty: 'Hard' },
                        { text: 'What does SOLID stand for?', type: 'Multiple Choice', category: 'Architecture', difficulty: 'Medium' },
                    ].map((q, idx) => (
                        <div key={idx} className="p-6 hover:bg-gray-50 flex items-start justify-between group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {q.type}
                                    </span>
                                    <span className="inline-flex items-center text-xs text-gray-500">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {q.category}
                                    </span>
                                    <span className={`inline-flex items-center text-xs font-medium ${q.difficulty === 'Easy' ? 'text-green-600' : q.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        <Flag className="h-3 w-3 mr-1" />
                                        {q.difficulty}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{q.text}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
