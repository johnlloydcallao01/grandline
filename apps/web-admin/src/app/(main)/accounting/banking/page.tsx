'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Landmark, Plus, Upload,
    MoreHorizontal, Check, RefreshCw
} from '@/components/ui/IconWrapper';

export default function BankingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'accounts';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/banking?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banking & Cash</h1>
                    <p className="text-gray-600 mt-1">Manage bank accounts and reconciliations</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Statement
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'accounts', label: 'Bank Accounts', icon: Landmark },
                        { id: 'reconciliation', label: 'Reconciliation', icon: RefreshCw },
                        { id: 'manual', label: 'Manual Entry', icon: Plus },
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
                {activeTab === 'accounts' && <BankAccountsList />}
                {activeTab === 'reconciliation' && <ReconciliationView />}
                {activeTab === 'manual' && <ManualEntryForm />}
            </div>
        </div>
    );
}

function BankAccountsList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { name: 'Chase Business Checking', bank: 'Chase Bank', last4: '8821', balance: '$124,500.00', status: 'Active', updated: '2 mins ago' },
                { name: 'PayPal Merchant', bank: 'PayPal', last4: 'N/A', balance: '$12,450.00', status: 'Active', updated: '1 hour ago' },
                { name: 'Stripe Clearing', bank: 'Stripe', last4: 'N/A', balance: '$45,200.00', status: 'Active', updated: '5 mins ago' },
            ].map((account, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Landmark className="h-6 w-6 text-blue-600" />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-5 w-5" /></button>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{account.bank} •••• {account.last4}</p>
                    <div className="mt-6">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Available Balance</p>
                        <h2 className="text-2xl font-bold text-gray-900 mt-1">{account.balance}</h2>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                        <span>Updated: {account.updated}</span>
                        <span className="flex items-center text-green-600 font-medium">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ReconciliationView() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 text-center py-12">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Statements to Reconcile</h3>
            <p className="text-gray-500 mt-1 max-w-md mx-auto">Great job! All your bank transactions have been matched with your accounting records.</p>
            <button className="mt-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                View History
            </button>
        </div>
    );
}

function ManualEntryForm() {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Record Manual Transaction</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>Deposit</option>
                            <option>Withdrawal</option>
                            <option>Transfer</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" placeholder="e.g. Office rent payment" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input type="number" className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>Chase Business Checking</option>
                            <option>PayPal</option>
                            <option>Petty Cash</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>Uncategorized</option>
                        <option>Office Expenses</option>
                        <option>Rent</option>
                        <option>Utilities</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">Save Transaction</button>
                </div>
            </div>
        </div>
    );
}
