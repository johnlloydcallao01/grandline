'use client';

import React from 'react';
import {
    Send, CheckCircle, AlertCircle, Search,
    Filter, Download, MoreHorizontal, FileCheck,
    Users
} from '@/components/ui/IconWrapper';

export default function CertificateIssuancePage() {
    const issuanceHistory = [
        { id: 1, batch: 'BATCH-2024-OCT-01', course: 'React 101: Fundamentals', recipients: 45, date: 'Oct 25, 2024', status: 'Completed', success: 45, fail: 0 },
        { id: 2, batch: 'BATCH-2024-OCT-02', course: 'Advanced Node.js', recipients: 32, date: 'Oct 24, 2024', status: 'Completed', success: 31, fail: 1 },
        { id: 3, batch: 'BATCH-2024-SEP-15', course: 'UI/UX Design Principles', recipients: 28, date: 'Sept 30, 2024', status: 'Completed', success: 28, fail: 0 },
        { id: 4, batch: 'BATCH-2024-SEP-10', course: 'Python for Data Science', recipients: 150, date: 'Sept 20, 2024', status: 'Processing', success: 89, fail: 0 },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Certificate Issuance</h1>
                    <p className="text-gray-600 mt-1">Issue certificates to students individually or in bulk</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Export Log
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors">
                        <Send className="h-4 w-4 mr-2" />
                        New Issuance
                    </button>
                </div>
            </div>

            {/* Quick Actions / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Issued This Month</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">1,248</h3>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> All delivered successfully
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <FileCheck className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Pending Generation</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">61</h3>
                        <p className="text-xs text-yellow-600 mt-1 flex items-center">
                            Est. time: 5 mins
                        </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                        <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Failed Deliveries</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">3</h3>
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> Needs attention
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Issuance History */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-semibold text-gray-900">Issuance History</h3>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {issuanceHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-blue-600 font-mono">{item.batch}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                                            {item.recipients}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit mb-1
                                                ${item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {item.status}
                                            </span>
                                            {item.fail > 0 && (
                                                <span className="text-xs text-red-600">{item.fail} failed</span>
                                            )}
                                        </div>
                                    </td>
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
        </div>
    );
}
