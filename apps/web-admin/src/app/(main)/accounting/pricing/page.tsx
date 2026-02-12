'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    DollarSign, Tag, Globe,
    Search, Plus, MoreHorizontal, Save
} from '@/components/ui/IconWrapper';

export default function PricingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'courses';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/accounting/pricing?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
                    <p className="text-gray-600 mt-1">Configure course prices, discounts, and taxes</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'courses', label: 'Course Pricing', icon: DollarSign },
                        { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
                        { id: 'taxes', label: 'Tax Configuration', icon: Globe },
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
                {activeTab === 'courses' && <CoursePricingList />}
                {activeTab === 'coupons' && <CouponsList />}
                {activeTab === 'taxes' && <TaxConfiguration />}
            </div>
        </div>
    );
}

function CoursePricingList() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Types</option>
                        <option>One-time Purchase</option>
                        <option>Subscription</option>
                        <option>Free</option>
                    </select>
                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { name: 'React Fundamentals', model: 'One-time', price: '49.99', currency: 'USD', status: 'Active' },
                        { name: 'Advanced TypeScript', model: 'One-time', price: '79.99', currency: 'USD', status: 'Active' },
                        { name: 'Full Stack Bootcamp', model: 'Subscription', price: '29.00/mo', currency: 'USD', status: 'Active' },
                        { name: 'Intro to Programming', model: 'Free', price: '0.00', currency: 'USD', status: 'Active' },
                    ].map((course, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{course.model}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{course.price}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{course.currency}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {course.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CouponsList() {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Limit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { code: 'WELCOME20', discount: '20% OFF', limit: '100 / 500', expiry: 'Dec 31, 2024', status: 'Active' },
                            { code: 'BLACKFRIDAY', discount: '50% OFF', limit: '1000 / 1000', expiry: 'Nov 30, 2024', status: 'Expired' },
                            { code: 'TEACHER10', discount: '$10.00 OFF', limit: 'Unlimited', expiry: 'Never', status: 'Active' },
                        ].map((coupon) => (
                            <tr key={coupon.code} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">{coupon.code}</td>
                                <td className="px-6 py-4 text-sm text-green-600 font-medium">{coupon.discount}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{coupon.limit}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{coupon.expiry}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {coupon.status}
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

function TaxConfiguration() {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-gray-500" />
                Global Tax Settings
            </h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                        <div className="relative">
                            <input type="number" defaultValue="0.00" className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Applied when no regional tax finds a match</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Calculation Logic</label>
                        <select className="border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500 p-2">
                            <option>Exclusive (Price + Tax)</option>
                            <option>Inclusive (Price includes Tax)</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Regional Tax Rules</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center">
                                <span className="font-medium text-sm text-gray-900 mr-2">United Kingdom (VAT)</span>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">20%</span>
                            </div>
                            <button className="text-blue-600 text-sm hover:underline">Edit</button>
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center">
                                <span className="font-medium text-sm text-gray-900 mr-2">European Union (OSS)</span>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">Varies</span>
                            </div>
                            <button className="text-blue-600 text-sm hover:underline">Edit</button>
                        </div>
                        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors">
                            + Add Regional Rule
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}
