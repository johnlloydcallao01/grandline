'use client';

import React from 'react';
import { Shield, CheckCircle, AlertTriangle, FileText, Download } from '@/components/ui/IconWrapper';

export function ComplianceTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Status */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Compliance Status</h3>
                    <div className="flex items-center justify-center p-4">
                        <div className="relative h-48 w-48 rounded-full border-[12px] border-green-500 flex items-center justify-center">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-gray-900">94%</span>
                                <span className="text-sm text-gray-500">Compliant</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">2,390</p>
                            <p className="text-xs text-gray-500">Compliant Users</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">153</p>
                            <p className="text-xs text-gray-500">Non-Compliant Users</p>
                        </div>
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Expiring Certifications (Next 30 Days)</h3>
                    <div className="space-y-4">
                        {[
                            { cert: 'Cybersecurity Awareness 2024', count: 45, date: 'Oct 30, 2024' },
                            { cert: 'Data Privacy Fundamentals', count: 12, date: 'Nov 05, 2024' },
                            { cert: 'Workplace Safety Level 1', count: 8, date: 'Nov 12, 2024' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-100">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.cert}</p>
                                        <p className="text-xs text-gray-500">Expires: {item.date}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.count} Users</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-blue-600 font-medium hover:text-blue-800">
                        View All Expiring
                    </button>
                </div>
            </div>

            {/* Mandatory Training Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Mandatory Training Reports</h3>
                    <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>
                </div>
                <div className="divide-y divide-gray-200">
                    {[
                        { name: 'Annual Code of Conduct', deadline: 'Dec 31, 2024', status: 'On Track', completion: 78 },
                        { name: 'Phishing Prevention', deadline: 'Nov 15, 2024', status: 'Critical', completion: 45 },
                        { name: 'Diversity & Inclusion', deadline: 'Jan 15, 2025', status: 'On Track', completion: 82 },
                    ].map((training, idx) => (
                        <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center mb-2 md:mb-0">
                                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{training.name}</p>
                                    <p className="text-xs text-gray-500">Deadline: {training.deadline}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-32">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Completion</span>
                                        <span>{training.completion}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${training.status === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${training.completion}%` }}></div>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${training.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {training.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
