'use client';

import React from 'react';
import { Star, FileText } from '@/components/ui/IconWrapper';

export function AssessmentResultsTab() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Recent Assessment Scores</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {[
                        { trainee: 'Alice Johnson', quiz: 'React Hooks Final Exam', score: 95, date: 'Oct 24, 2024', status: 'Passed' },
                        { trainee: 'Bob Smith', quiz: 'TypeScript Types Quiz', score: 65, date: 'Oct 23, 2024', status: 'Failed' },
                        { trainee: 'Charlie Brown', quiz: 'Wireframing Basics', score: 88, date: 'Oct 22, 2024', status: 'Passed' },
                        { trainee: 'Diana Ross', quiz: 'Project Scoping', score: 100, date: 'Oct 21, 2024', status: 'Passed' },
                        { trainee: 'Evan Wright', quiz: 'CSS Grid Challenge', score: 78, date: 'Oct 20, 2024', status: 'Passed' },
                    ].map((result, idx) => (
                        <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-start md:items-center mb-4 md:mb-0">
                                <div className={`p-3 rounded-lg mr-4 ${result.status === 'Passed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{result.quiz}</h4>
                                    <p className="text-sm text-gray-500">Taken by <span className="font-medium text-gray-700">{result.trainee}</span> on {result.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Score</p>
                                    <p className={`text-xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {result.score}%
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.status === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {result.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
