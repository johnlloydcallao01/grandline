'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'To reset your password, go to the login page and click on "Forgot Password". Follow the instructions sent to your registered email address to create a new password.'
        },
        {
          question: 'Can I access the LMS on my mobile device?',
          answer: 'Yes, our LMS is fully responsive and can be accessed on any mobile device with a modern web browser. We also have a dedicated mobile app available for iOS and Android.'
        }
      ]
    },
    {
      category: 'Certification',
      questions: [
        {
          question: 'How long does it take to get my certificate?',
          answer: 'Certificates are automatically generated upon successful completion of a course and passing the final assessment. You can download them immediately from the "Certificates" page.'
        },
        {
          question: 'Are the certificates recognized internationally?',
          answer: 'Yes, our courses are STCW compliant and recognized by major maritime authorities. Please check the specific course details for accreditation information.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'What are the system requirements for the simulator?',
          answer: 'The ECDIS simulator requires a Windows PC with at least 8GB RAM and a dedicated graphics card. Please refer to the "Downloads" page for detailed system specifications.'
        },
        {
          question: 'My video player is not loading. What should I do?',
          answer: 'Please check your internet connection and try clearing your browser cache. If the issue persists, try using a different browser or contact our support team.'
        }
      ]
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Find answers to common questions about our platform and courses.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        <div className="w-full space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, index) => {
                  const globalIndex = catIndex * 100 + index;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleAccordion(globalIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`transition-all duration-200 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-4 text-gray-600 text-sm border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Can't find what you're looking for?{' '}
            <Link href="/contact-us" className="text-blue-600 font-medium hover:text-blue-800">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
