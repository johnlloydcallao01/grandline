'use client';

import React from 'react';
import {
    DollarSign, Calendar, Download,
    CheckCircle, Clock
} from '@/components/ui/IconWrapper';

export default function InstructorPayoutsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instructor Payouts</h1>
                    <p className="text-gray-600 mt-1">Manage payment schedules and view earnings reports</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payouts
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$4,250.00</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="font-medium">+12%</span>
                        <span className="text-gray-500 ml-1">vs last month</span>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Paid this Month</h3>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$18,500.00</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="font-medium">+5%</span>
                        <span className="text-gray-500 ml-1">vs last month</span>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Next Payout Date</h3>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Oct 31, 2024</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Scheduled
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Payout History</h3>
                    <div className="flex gap-2">
                        <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { date: 'Oct 15, 2024', instructor: 'Dr. Jane Smith', method: 'Bank Transfer', amount: '$1,250.00', status: 'Completed' },
                            { date: 'Oct 15, 2024', instructor: 'Mark Wilson', method: 'PayPal', amount: '$450.00', status: 'Completed' },
                            { date: 'Oct 01, 2024', instructor: 'Dr. Jane Smith', method: 'Bank Transfer', amount: '$1,100.00', status: 'Completed' },
                        ].map((payout, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {payout.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {payout.instructor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {payout.method}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {payout.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {payout.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
