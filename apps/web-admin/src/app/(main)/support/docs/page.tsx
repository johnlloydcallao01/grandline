'use client';

import React from 'react';
import {
    BookOpen, Search, FileText, ChevronDown,
    HelpCircle, Plus
} from '@/components/ui/IconWrapper';

export default function DocumentationPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
                    <p className="text-gray-600 mt-1">Manage user guides and frequently asked questions</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Article
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Guides */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                            User Guides
                        </h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {[
                            { title: 'Getting Started with the Platform', views: '2.5k', updated: '2 days ago' },
                            { title: 'Managing Courses', views: '1.8k', updated: '1 week ago' },
                            { title: 'Instructor Dashboard Overview', views: '950', updated: '3 weeks ago' },
                            { title: 'Student Enrollment Process', views: '3.2k', updated: '1 month ago' },
                        ].map((guide, idx) => (
                            <div key={idx} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 group-hover:text-blue-500 transition-colors" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{guide.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{guide.updated}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{guide.views} views</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Frequently Asked Questions
                        </h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {[
                            { question: 'How do I reset my password?', category: 'Account' },
                            { question: 'Can I download videos offline?', category: 'Content' },
                            { question: 'How are instructor payouts calculated?', category: 'Payments' },
                            { question: 'Is there a mobile app available?', category: 'General' },
                        ].map((faq, idx) => (
                            <div key={idx} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{faq.question}</h3>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {faq.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
