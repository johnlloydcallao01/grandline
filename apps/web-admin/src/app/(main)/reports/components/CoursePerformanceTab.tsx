'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Star } from '@/components/ui/IconWrapper';

export function CoursePerformanceTab() {
    return (
        <div className="space-y-6">
            {/* Top Performing Courses Cards */}
            <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Most Popular</p>
                            <h4 className="text-lg font-bold text-gray-900 mt-1">React Fundamentals</h4>
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                1,245 Enrolled
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Highest Rated</p>
                            <h4 className="text-lg font-bold text-gray-900 mt-1">Advanced TypeScript</h4>
                            <p className="text-sm text-yellow-600 mt-2 flex items-center">
                                <Star className="w-4 h-4 mr-1 fill-current" />
                                4.9/5.0 Average
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Highest Completion</p>
                            <h4 className="text-lg font-bold text-gray-900 mt-1">UI/UX Basics</h4>
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                92% Completion Rate
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">All Courses Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructors</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[
                                { name: 'React Fundamentals', instructor: 'Sarah J.', enrolled: 1245, time: '12h 30m', rating: 4.8, completion: 85 },
                                { name: 'Advanced TypeScript', instructor: 'Mike T.', enrolled: 850, time: '8h 15m', rating: 4.9, completion: 72 },
                                { name: 'UI/UX Design Masterclass', instructor: 'Emily R.', enrolled: 2100, time: '24h 00m', rating: 4.7, completion: 65 },
                                { name: 'Node.js Backend', instructor: 'David L.', enrolled: 950, time: '18h 45m', rating: 4.6, completion: 55 },
                                { name: 'Digital Marketing 101', instructor: 'Jessica W.', enrolled: 3200, time: '6h 30m', rating: 4.5, completion: 92 },
                            ].map((course, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{course.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.instructor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.enrolled}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                        {course.rating}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-900 mr-2">{course.completion}%</span>
                                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${course.completion > 80 ? 'bg-green-500' : course.completion > 60 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${course.completion}%` }}></div>
                                            </div>
                                        </div>
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

// Additional icon import helper since CheckCircle was used but not imported in previous context for this file
import { CheckCircle } from '@/components/ui/IconWrapper';
