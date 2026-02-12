'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    DollarSign, Users, Calendar,
    Search, MoreHorizontal,
    CheckCircle, Clock
} from '@/components/ui/IconWrapper';

export default function PayoutsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'instructors';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/payouts?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
                    <p className="text-gray-600 mt-1">Manage instructor and affiliate payments</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payouts
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                            <h3 className="text-xl font-bold text-gray-900">$12,450.00</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Paid Last 30 Days</p>
                            <h3 className="text-xl font-bold text-gray-900">$45,200.00</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Instructors</p>
                            <h3 className="text-xl font-bold text-gray-900">84</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'instructors', label: 'Instructor Payouts', icon: Users },
                        { id: 'affiliates', label: 'Affiliate Commissions', icon: Users }, // Reusing Users icon for now
                        { id: 'schedules', label: 'Payout Schedules', icon: Calendar },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'instructors' && <PayoutsList type="instructor" />}
                {activeTab === 'affiliates' && <PayoutsList type="affiliate" />}
                {activeTab === 'schedules' && <PayoutSchedules />}
            </div>
        </div>
    );
}

function PayoutsList({ type }: { type: 'instructor' | 'affiliate' }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${type}s...`}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Failed</option>
                    </select>
                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { name: 'Sarah Jenkins', method: 'PayPal', amount: '$1,250.00', date: 'Oct 31, 2024', status: 'Pending' },
                        { name: 'Mike Ross', method: 'Bank Transfer', amount: '$2,400.00', date: 'Oct 31, 2024', status: 'Pending' },
                        { name: 'Jessica Pearson', method: 'Stripe Connect', amount: '$5,000.00', date: 'Oct 01, 2024', status: 'Paid' },
                    ].map((payout, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{payout.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{payout.method}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{payout.amount}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{payout.date}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payout.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                    payout.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {payout.status}
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
    );
}

function PayoutSchedules() {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                Configure Payout Schedules
            </h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Payout Scale</label>
                        <select className="border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500 p-2">
                            <option>Monthly (Net 30)</option>
                            <option>Monthly (Net 15)</option>
                            <option>Weekly</option>
                            <option>Manual Approval Only</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Automatic generation of payout batches</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input type="number" defaultValue="50" className="pl-6 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Affiliate Commission Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                            <input type="number" defaultValue="15" className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payout Delay (Days)</label>
                            <input type="number" defaultValue="30" className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500" />
                            <p className="text-xs text-gray-500 mt-1">Wait period for refund processing</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Schedules
                </button>
            </div>
        </div>
    );
}
