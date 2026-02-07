'use client';

import React from 'react';
import { Clock, TrendingUp } from '@/components/ui/IconWrapper';

export function TimeSpentTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 font-medium">Total Learning Hours</p>
                            <h3 className="text-4xl font-bold mt-2">1,248h</h3>
                            <p className="mt-2 text-sm text-blue-100 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                +12% vs last month
                            </p>
                        </div>
                        <Clock className="h-12 w-12 text-blue-400 opacity-50" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Average Time per Course</h4>
                    <div className="space-y-4">
                        {[
                            { course: 'React Fundamentals', time: '12h 30m', target: '15h' },
                            { course: 'Advanced TypeScript', time: '8h 45m', target: '10h' },
                            { course: 'UI/UX Design', time: '22h 15m', target: '20h' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                <span className="text-sm font-medium text-gray-700">{item.course}</span>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-gray-900">{item.time}</span>
                                    <span className="text-xs text-gray-500">Target: {item.target}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Learner Time Logs</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Session</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { name: 'Alice Johnson', date: 'Today, 10:30 AM', duration: '2h 15m', activity: 'Watched "Hooks Deep Dive"' },
                            { name: 'Bob Smith', date: 'Yesterday, 2:00 PM', duration: '45m', activity: 'Completed Quiz: Types' },
                            { name: 'Charlie Brown', date: 'Oct 23, 9:00 AM', duration: '1h 30m', activity: 'Read Documentation' },
                        ].map((log, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{log.duration}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.activity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
