'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search, Filter, MoreHorizontal, Download
} from '@/components/ui/IconWrapper';

export default function TransactionsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'all';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/transactions?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-600 mt-1">View and manage all financial activities</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        New Entry
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['all', 'sales', 'refunds', 'manual'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                                ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, customer, or amount..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <input type="date" className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Status</option>
                        <option>Completed</option>
                        <option>Pending</option>
                        <option>Failed</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { id: 'TXN-100234', desc: 'Course Purchase: Advanced React', date: 'Oct 24, 2024', type: 'Sale', amount: '+$49.99', status: 'Completed', income: true },
                            { id: 'TXN-100233', desc: 'Monthly Subscription: Pro Plan', date: 'Oct 24, 2024', type: 'Sale', amount: '+$19.00', status: 'Completed', income: true },
                            { id: 'TXN-REF-009', desc: 'Refund: UI/UX Basics', date: 'Oct 23, 2024', type: 'Refund', amount: '-$29.99', status: 'Processsed', income: false },
                            { id: 'TXN-MAN-001', desc: 'Office Supplies Adjustment', date: 'Oct 22, 2024', type: 'Manual', amount: '-$150.00', status: 'Completed', income: false },
                            { id: 'TXN-100232', desc: 'Course Purchase: Python 101', date: 'Oct 22, 2024', type: 'Sale', amount: '+$39.99', status: 'Failed', income: true },
                        ].map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-gray-500">{txn.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.desc}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{txn.date}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{txn.type}</td>
                                <td className={`px-6 py-4 text-sm font-bold ${txn.income ? 'text-green-600' : 'text-gray-900'}`}>
                                    {txn.amount}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        txn.status === 'Processsed' ? 'bg-blue-100 text-blue-800' :
                                            txn.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {txn.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
