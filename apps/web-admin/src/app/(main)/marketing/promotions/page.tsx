'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Ticket, Mail, Plus, Search,
    MoreHorizontal, CheckCircle,
    Calendar, Megaphone
} from '@/components/ui/IconWrapper';

export default function PromotionsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'coupons';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/marketing/promotions?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
                    <p className="text-gray-600 mt-1">Manage coupons and email marketing campaigns</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'coupons', label: 'Coupons & Discounts', icon: Ticket },
                        { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
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
                {activeTab === 'coupons' && <CouponsList />}
                {activeTab === 'campaigns' && <EmailCampaignsList />}
            </div>
        </div>
    );
}

function CouponsList() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search coupons..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { code: 'SUMMER2024', type: 'Percentage (20%)', usage: '45 / 100', status: 'Active' },
                            { code: 'WELCOME10', type: 'Fixed Amount ($10)', usage: '1,203', status: 'Active' },
                            { code: 'FLASH50', type: 'Percentage (50%)', usage: '50 / 50', status: 'Expired' },
                        ].map((coupon) => (
                            <tr key={coupon.code} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-50 rounded text-blue-600 mr-3">
                                            <Ticket className="h-4 w-4" />
                                        </div>
                                        <span className="font-mono font-medium text-gray-900">{coupon.code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{coupon.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{coupon.usage}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {coupon.status === 'Active' && <CheckCircle className="h-3 w-3 mr-1" />}
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

function EmailCampaignsList() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'October Newsletter', subject: 'New courses available this month!', sent: 'Oct 15, 2024', status: 'Sent', openRate: '24.5%', clicks: '1,203' },
                    { name: 'Black Friday Teaser', subject: 'Get ready for huge savings...', sent: '-', status: 'Draft', openRate: '-', clicks: '-' },
                    { name: 'Welcome Series #1', subject: 'Welcome to Grandline!', sent: 'Automated', status: 'Active', openRate: '45.2%', clicks: '5,600' },
                ].map((campaign, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${campaign.status === 'Sent' ? 'bg-green-100 text-green-600' :
                                campaign.status === 'Active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-5 w-5" /></button>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{campaign.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-1">{campaign.subject}</p>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Open Rate</p>
                                <p className="font-bold text-gray-900">{campaign.openRate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Clicks</p>
                                <p className="font-bold text-gray-900">{campaign.clicks}</p>
                            </div>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {campaign.sent}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${campaign.status === 'Sent' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {campaign.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

