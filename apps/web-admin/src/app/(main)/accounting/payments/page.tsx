'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    CreditCard, Plus, Search, Filter,
    Download, DollarSign
} from '@/components/ui/IconWrapper';

export default function PaymentsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'received';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/payments?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments & Receipts</h1>
                    <p className="text-gray-600 mt-1">Track incoming payments and manage methods</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'received', label: 'Payments Received', icon: DollarSign },
                        { id: 'methods', label: 'Payment Methods', icon: CreditCard },
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
                {activeTab === 'received' ? <PaymentsList /> : <PaymentMethodsList />}
            </div>
        </div>
    );
}

function PaymentsList() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ref # or payer..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        Filter
                    </button>
                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { ref: 'PAY-8821', payer: 'John Doe', date: 'Oct 24, 2024', method: 'Credit Card (Stripe)', amount: '$49.99' },
                        { ref: 'PAY-8820', payer: 'Jane Smith', date: 'Oct 24, 2024', method: 'PayPal', amount: '$199.00' },
                        { ref: 'PAY-8819', payer: 'Acme Corp', date: 'Oct 23, 2024', method: 'Bank Transfer', amount: '$1,500.00' },
                    ].map((payment) => (
                        <tr key={payment.ref} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-blue-600">{payment.ref}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{payment.payer}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{payment.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{payment.amount}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-gray-600 p-1" title="Download Receipt"><Download className="h-4 w-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PaymentMethodsList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Active</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Stripe</h3>
                <p className="text-sm text-gray-500 mt-1">Credit/Debit Card Processing</p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">ID: acc_8s9d...</span>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Configure</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Active</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">PayPal</h3>
                <p className="text-sm text-gray-500 mt-1">Global Payment Gateway</p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">ID: pp_merchant...</span>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Configure</button>
                </div>
            </div>

            <button className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[200px]">
                <Plus className="h-8 w-8 mb-3" />
                <span className="font-medium">Add Payment Method</span>
            </button>
        </div>
    );
}
