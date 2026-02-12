'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    FileText, Plus, Search,
    MoreHorizontal, Download, Send,
    RefreshCw
} from '@/components/ui/IconWrapper';

export default function InvoicesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'all';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/invoices?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoicing</h1>
                    <p className="text-gray-600 mt-1">Manage client invoices and recurring payments</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Overdue Amount</p>
                    <h3 className="text-xl font-bold text-red-600 mt-1">$4,250.00</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Draft Amount</p>
                    <h3 className="text-xl font-bold text-gray-600 mt-1">$1,200.00</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Unpaid Amount</p>
                    <h3 className="text-xl font-bold text-amber-500 mt-1">$8,500.00</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Paid (This Month)</p>
                    <h3 className="text-xl font-bold text-green-600 mt-1">$24,500.00</h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                    { id: 'all', label: 'All Invoices', icon: FileText },
                    { id: 'recurring', label: 'Recurring', icon: RefreshCw },
                    { id: 'templates', label: 'Templates', icon: FileText },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                            flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                            }
                        `}
                    >
                        <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoice # or client..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { id: 'INV-2024-001', client: 'Acme Corp', date: 'Oct 20, 2024', due: 'Oct 30, 2024', amount: '$1,500.00', status: 'Paid' },
                            { id: 'INV-2024-002', client: 'Global Tech', date: 'Oct 22, 2024', due: 'Nov 05, 2024', amount: '$3,200.00', status: 'Pending' },
                            { id: 'INV-2024-003', client: 'StartUp Inc', date: 'Oct 15, 2024', due: 'Oct 25, 2024', amount: '$750.00', status: 'Overdue' },
                            { id: 'INV-2024-004', client: 'Design Studio', date: 'Oct 24, 2024', due: 'Nov 07, 2024', amount: '$2,100.00', status: 'Draft' },
                        ].map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{invoice.client}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{invoice.date}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{invoice.due}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{invoice.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                        invoice.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                            invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button className="p-1 text-gray-400 hover:text-blue-600" title="Send Reminder"><Send className="h-4 w-4" /></button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600" title="Download"><Download className="h-4 w-4" /></button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
