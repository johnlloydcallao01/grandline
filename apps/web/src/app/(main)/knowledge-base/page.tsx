'use client';

import React from 'react';
import Link from 'next/link';

export default function KnowledgeBasePage() {
  const categories = [
    {
      title: 'Getting Started',
      description: 'New to the platform? Start here.',
      icon: 'rocket',
      articles: [
        'Platform Overview & Navigation',
        'Setting up your profile',
        'Understanding the dashboard'
      ]
    },
    {
      title: 'Courses & Training',
      description: 'Guides on taking courses and assessments.',
      icon: 'book-open',
      articles: [
        'How to enroll in a course',
        'Video player troubleshooting',
        'Taking the final assessment'
      ]
    },
    {
      title: 'Account Management',
      description: 'Manage your account settings and security.',
      icon: 'user-circle',
      articles: [
        'Changing your password',
        'Updating personal details',
        'Two-factor authentication'
      ]
    },
    {
      title: 'Certificates & Compliance',
      description: 'Information about certification validity.',
      icon: 'badge-check',
      articles: [
        'Downloading your certificate',
        'Verifying certificate authenticity',
        'STCW compliance details'
      ]
    },
    {
      title: 'Technical Support',
      description: 'Troubleshooting technical issues.',
      icon: 'desktop-computer',
      articles: [
        'System requirements',
        'Browser compatibility',
        'Clearing cache and cookies'
      ]
    },
    {
      title: 'Billing & Payments',
      description: 'Invoices, receipts, and payment methods.',
      icon: 'credit-card',
      articles: [
        'Viewing payment history',
        'Accepted payment methods',
        'Refund policy'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse our comprehensive guides and documentation.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        {/* Search Banner */}
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 mb-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How can we help you?</h2>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-lg text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-blue-400"
              placeholder="Search for articles, guides, and tutorials..."
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {/* Simplified icon rendering based on name string - in real app would map to components */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">{category.title}</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4 h-10">{category.description}</p>
              <ul className="space-y-2">
                {category.articles.map((article, artIndex) => (
                  <li key={artIndex}>
                    <Link href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                      <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {article}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                  View all articles
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
