'use client';

import React from 'react';
import { DollarSign, TrendingUp, Download, CreditCard, Calendar } from '@/components/ui/IconWrapper';

export function FinancialTab() {
    return (
        <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total Revenue (YTD)</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">$124,500.00</h3>
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +18% vs last year
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">$12,450.00</h3>
                    <p className="text-sm text-gray-500 mt-2">Scheduled for next Friday</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Refund Rate</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">1.2%</h3>
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                        -0.5% vs last month
                    </p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                    <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[
                                { id: 'TRX-98765', date: 'Oct 24, 2024', user: 'Alice Johnson', item: 'React Fundamentals', amount: '$49.99', status: 'Succeeded' },
                                { id: 'TRX-98764', date: 'Oct 24, 2024', user: 'Bob Smith', item: 'Annual Subscription', amount: '$199.00', status: 'Succeeded' },
                                { id: 'TRX-98763', date: 'Oct 23, 2024', user: 'Charlie Brown', item: 'UI/UX Design', amount: '$89.00', status: 'Refunded' },
                                { id: 'TRX-98762', date: 'Oct 23, 2024', user: 'Diana Ross', item: 'Advanced TypeScript', amount: '$59.00', status: 'Succeeded' },
                                { id: 'TRX-98761', date: 'Oct 22, 2024', user: 'Evan Wright', item: 'Monthly Subscription', amount: '$19.00', status: 'Failed' },
                            ].map((trx, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{trx.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                        {trx.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trx.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trx.item}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trx.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trx.status === 'Succeeded' ? 'bg-green-100 text-green-800' :
                                                trx.status === 'Refunded' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {trx.status}
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
