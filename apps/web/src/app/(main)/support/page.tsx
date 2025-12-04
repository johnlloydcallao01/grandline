'use client';

import React from 'react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              How can we help you today?
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        {/* Search */}
        <div className="w-full mb-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search for answers</h2>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search documentation, FAQs, and more..."
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <Link href="/faqs" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQs</h3>
            <p className="text-gray-500 text-sm">Find answers to commonly asked questions about courses and certifications.</p>
          </Link>

          <Link href="/knowledge-base" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Base</h3>
            <p className="text-gray-500 text-sm">Detailed guides and documentation for the LMS platform.</p>
          </Link>

          <Link href="/contact-us" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-500 text-sm">Get in touch with our support team for personalized assistance.</p>
          </Link>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Still need help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Email Support</h4>
                <p className="mt-1 text-sm text-gray-500">
                  For general inquiries and non-urgent matters.
                </p>
                <a href="mailto:support@maritimelms.com" className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                  support@maritimelms.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Phone Support</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Available Mon-Fri, 09:00 - 18:00 UTC.
                </p>
                <a href="tel:+1234567890" className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
