'use client';

import React from 'react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
            <p className="mt-1 text-sm text-gray-500">
              Get in touch with our global support team.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" id="firstName" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" id="lastName" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select id="subject" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Issue</option>
                  <option>Course Information</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info & Locations */}
          <div className="space-y-8">
            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">24/7 Emergency Support</h3>
                  <p className="mt-2 text-sm text-red-700">
                    For critical system outages or urgent operational issues, please call our dedicated emergency line.
                  </p>
                  <div className="mt-4">
                    <a href="tel:+18001234567" className="text-red-800 font-bold hover:underline">
                      +1 (800) 123-4567
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Our Offices</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Singapore (HQ)</h4>
                    <p className="text-sm text-gray-500">
                      1 Maritime Square<br />
                      #09-12 HarbourFront Centre<br />
                      Singapore 099253
                    </p>
                    <p className="mt-1 text-sm text-blue-600">+65 6123 4567</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-start space-x-3">
                  <div className="mt-1">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Manila</h4>
                    <p className="text-sm text-gray-500">
                      Level 25, One E-com Center<br />
                      Ocean Drive, Mall of Asia Complex<br />
                      Pasay City 1300, Philippines
                    </p>
                    <p className="mt-1 text-sm text-blue-600">+63 2 8123 4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
