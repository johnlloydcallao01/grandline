'use client';

import React from 'react';
import { User, CheckCircle, Clock, AlertTriangle } from '@/components/ui/IconWrapper';

export function IndividualProgressTab() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Individual Progress Tracking</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[
                                { name: 'Alice Johnson', course: 'React Fundamentals', modules: '8/10', progress: 80, status: 'On Track' },
                                { name: 'Bob Smith', course: 'Advanced TypeScript', modules: '3/12', progress: 25, status: 'Behind' },
                                { name: 'Charlie Brown', course: 'UI/UX Design', modules: '1/8', progress: 12, status: 'At Risk' },
                                { name: 'Diana Ross', course: 'Project Management', modules: '10/10', progress: 100, status: 'Completed' },
                            ].map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                                            {item.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.modules}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                            <div
                                                className={`h-2 rounded-full ${item.status === 'Completed' ? 'bg-green-500' : item.status === 'At Risk' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{item.progress}%</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Behind' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.status === 'At Risk' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                            }`}>
                                            {item.status}
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
