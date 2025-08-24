"use client";

import React from "react";

/**
 * Help page component - Support and assistance
 */
export default function HelpPage() {

  const helpCategories = [
    {
      id: 1,
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      icon: "🚀",
      articles: [
        "How to create an account",
        "Setting up your profile",
        "First steps guide",
        "Understanding the dashboard"
      ]
    },
    {
      id: 2,
      title: "Account & Billing",
      description: "Manage your account settings and billing",
      icon: "💳",
      articles: [
        "Update payment method",
        "View billing history",
        "Change subscription plan",
        "Cancel subscription"
      ]
    },
    {
      id: 3,
      title: "Features & Tools",
      description: "Learn how to use our features effectively",
      icon: "🛠️",
      articles: [
        "Using the analytics dashboard",
        "Creating campaigns",
        "Managing content",
        "Team collaboration"
      ]
    },
    {
      id: 4,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: "🔧",
      articles: [
        "Login problems",
        "Performance issues",
        "Data not loading",
        "Browser compatibility"
      ]
    }
  ];

  const contactOptions = [
    {
      id: 1,
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: "💬",
      action: "Start Chat",
      available: true
    },
    {
      id: 2,
      title: "Email Support",
      description: "Send us a detailed message",
      icon: "📧",
      action: "Send Email",
      available: true
    },
    {
      id: 3,
      title: "Phone Support",
      description: "Call us for urgent matters",
      icon: "📞",
      action: "Call Now",
      available: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-sm md:text-base text-gray-600">Find answers to your questions and get the help you need</p>
      </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, index) => (
                      <li key={index} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                        {article}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option) => (
                <div
                  key={option.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center ${
                    option.available ? 'hover:shadow-md cursor-pointer' : 'opacity-60'
                  }`}
                >
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      option.available
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!option.available}
                  >
                    {option.available ? option.action : 'Unavailable'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">How do I reset my password?</h3>
                  <p className="text-gray-600">You can reset your password by clicking the &quot;Forgot Password&quot; link on the login page and following the instructions sent to your email.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">How do I upgrade my plan?</h3>
                  <p className="text-gray-600">Go to your account settings and click on &quot;Billing&quot; to view available plans and upgrade options.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
                  <p className="text-gray-600">Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">How do I contact support?</h3>
                  <p className="text-gray-600">You can reach our support team through live chat, email, or by submitting a support ticket through your dashboard.</p>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
