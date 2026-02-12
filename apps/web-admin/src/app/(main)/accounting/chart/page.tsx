'use client';

import React from 'react';
import {
    MoreHorizontal, Plus, Search,
    Briefcase, DollarSign, TrendingUp
} from '@/components/ui/IconWrapper';

export default function ChartOfAccountsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
                    <p className="text-gray-600 mt-1">Manage your financial structure</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Assets</p>
                            <h3 className="text-xl font-bold text-gray-900">$1,245,000</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
                            <h3 className="text-xl font-bold text-gray-900">$45,000</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Equity</p>
                            <h3 className="text-xl font-bold text-gray-900">$1,200,000</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>All Types</option>
                            <option>Asset</option>
                            <option>Liability</option>
                            <option>Equity</option>
                            <option>Revenue</option>
                            <option>Expense</option>
                        </select>
                    </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { code: '1000', name: 'Cash on Hand', type: 'Asset', balance: '$5,000.00', status: 'Active' },
                            { code: '1010', name: 'Bank - Chase Operating', type: 'Asset', balance: '$125,000.00', status: 'Active' },
                            { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: '$2,450.00', status: 'Active' },
                            { code: '4000', name: 'Course Revenue', type: 'Revenue', balance: '$850,000.00', status: 'Active' },
                            { code: '6000', name: 'Software Subscriptions', type: 'Expense', balance: '$1,200.00', status: 'Active' },
                        ].map((account) => (
                            <tr key={account.code} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{account.code}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{account.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{account.type}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{account.balance}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {account.status}
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
