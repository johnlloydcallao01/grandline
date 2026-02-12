'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    PieChart, FileText, TrendingUp,
    Calendar, Download, Briefcase, DollarSign, Activity
} from '@/components/ui/IconWrapper';

export default function FinancialReportsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'statements';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/reports?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600 mt-1">Comprehensive financial analysis and statements</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        This Month
                    </button>
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'statements', label: 'Financial Statements', icon: FileText },
                        { id: 'earnings', label: 'Tax & Instructor Earnings', icon: DollarSign },
                        { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
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
                {activeTab === 'statements' && <FinancialStatements />}
                {activeTab === 'earnings' && <TaxAndEarnings />}
                {activeTab === 'analytics' && <SalesAnalytics />}
            </div>
        </div>
    );
}

function FinancialStatements() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profit & Loss */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText className="h-6 w-6" />
                    </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Income Statement (P&L)</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Revenue, expenses, and net income over a period.</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-medium text-gray-900">$124,500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Expenses</span>
                        <span className="font-medium text-gray-900">$45,200</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2 mt-2">
                        <span className="font-bold text-gray-900">Net Income</span>
                        <span className="font-bold text-green-600">$79,300</span>
                    </div>
                </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <Briefcase className="h-6 w-6" />
                    </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Balance Sheet</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Assets, liabilities, and equity snapshot.</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Assets</span>
                        <span className="font-medium text-gray-900">$1,245,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Liabilities</span>
                        <span className="font-medium text-gray-900">$45,000</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2 mt-2">
                        <span className="font-bold text-gray-900">Total Equity</span>
                        <span className="font-bold text-blue-600">$1,200,000</span>
                    </div>
                </div>
            </div>

            {/* Cash Flow */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Cash Flow Statement</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Cash inflows and outflows from operations, investing, and financing.</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Operating Cash Flow</span>
                        <span className="font-medium text-green-600">+$65,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Investing Cash Flow</span>
                        <span className="font-medium text-red-600">-$12,000</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaxAndEarnings() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Sales Tax Liability</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Region</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Tax Collected</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="py-2 text-sm text-gray-900">United States (NY)</td>
                            <td className="py-2 text-sm text-gray-900 text-right">$1,240.50</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-sm text-gray-900">European Union (VAT)</td>
                            <td className="py-2 text-sm text-gray-900 text-right">$3,450.00</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-sm text-gray-900 font-bold">Total</td>
                            <td className="py-2 text-sm text-gray-900 text-right font-bold">$4,690.50</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Instructor Earnings Summary</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Category</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="py-2 text-sm text-gray-900">Total Commissions</td>
                            <td className="py-2 text-sm text-gray-900 text-right">$15,400.00</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-sm text-gray-900">Referral Bonuses</td>
                            <td className="py-2 text-sm text-gray-900 text-right">$2,450.00</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-sm text-gray-900">Net Payouts</td>
                            <td className="py-2 text-sm text-gray-900 text-right">$17,850.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SalesAnalytics() {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-6">Revenue by Course Category</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chart visualization placeholder</p>
                    <p className="text-xs text-gray-400">Integrate with Chart.js or Recharts</p>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase">Development</p>
                    <p className="text-lg font-bold text-gray-900">45%</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase">Design</p>
                    <p className="text-lg font-bold text-gray-900">25%</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase">Marketing</p>
                    <p className="text-lg font-bold text-gray-900">20%</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase">Business</p>
                    <p className="text-lg font-bold text-gray-900">10%</p>
                </div>
            </div>
        </div>
    );
}
