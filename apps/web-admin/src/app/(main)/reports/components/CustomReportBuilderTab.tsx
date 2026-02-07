'use client';

import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Plus, Trash2, Check, CheckCircle } from '@/components/ui/IconWrapper';

export function CustomReportBuilderTab() {
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['user_name', 'course_completion']);

    const toggleMetric = (metric: string) => {
        if (selectedMetrics.includes(metric)) {
            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
        } else {
            setSelectedMetrics([...selectedMetrics, metric]);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Q3 Progress Summary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Quarter to Date</option>
                                <option>Year to Date</option>
                                <option>Custom Range</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" name="format" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" defaultChecked />
                                    <span className="ml-2 text-sm text-gray-700">CSV</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="format" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                    <span className="ml-2 text-sm text-gray-700">PDF</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="format" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                    <span className="ml-2 text-sm text-gray-700">Excel</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Metrics</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {[
                            { id: 'user_name', label: 'User Name' },
                            { id: 'user_email', label: 'Email Address' },
                            { id: 'course_name', label: 'Course Name' },
                            { id: 'course_completion', label: 'Completion %' },
                            { id: 'quiz_scores', label: 'Quiz Scores' },
                            { id: 'time_spent', label: 'Time Spent' },
                            { id: 'last_login', label: 'Last Login' },
                            { id: 'cert_status', label: 'Certificate Status' },
                            { id: 'department', label: 'Department' },
                            { id: 'manager', label: 'Manager' },
                        ].map((metric) => (
                            <label key={metric.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.includes(metric.id)}
                                    onChange={() => toggleMetric(metric.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm text-gray-700">{metric.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                </button>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Live Preview</h3>
                        <span className="text-xs text-gray-500">Showing first 5 rows</span>
                    </div>
                    <div className="flex-1 p-0 overflow-auto">
                        {selectedMetrics.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12">
                                <FileText className="h-12 w-12 mb-4 opacity-50" />
                                <p>Select metrics to preview report structure</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {selectedMetrics.map(m => (
                                            <th key={m} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {m.replace('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[1, 2, 3, 4, 5].map((row) => (
                                        <tr key={row}>
                                            {selectedMetrics.map(m => (
                                                <td key={`${row}-${m}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    --
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
