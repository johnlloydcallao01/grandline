"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "What courses do you offer?",
      answer: "We offer basic and advanced maritime training programs, including STCW courses and refresher trainings."
    },
    {
      question: "How do I enroll in a course?",
      answer: "You can enroll online through our website or visit our training center for assistance."
    },
    {
      question: "Are your courses accredited?",
      answer: "Yes, all our programs are MARINA and IMO-compliant."
    },
    {
      question: "Do you offer job placement after training?",
      answer: "We provide guidance and referrals through our partner agencies, but placement is not guaranteed."
    },
    {
      question: "What should I bring on my first day of training?",
      answer: "Bring a valid ID, medical certificate, seaman’s book (if available), and any required documents listed during enrollment."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">Frequently Asked</span> <span className="text-[#ab3b43]">Questions</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto mb-8">
              Find answers to common questions about our platform, courses, and services. 
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFAQ === index;
              
              return (
                <div 
                  key={index}
                  className={`border rounded-xl transition-all ${isOpen ? 'border-[#201a7c] ring-1 ring-[#201a7c]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#201a7c]' : 'text-gray-400'}`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our support team is here to help you 24/7. Get in touch and we'll respond within 2 hours.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <i className="fas fa-comments text-3xl text-[#201a7c] mb-4"></i>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">Get instant help from our support team</p>
              <button className="text-[#201a7c] hover:text-[#1a1569] font-medium">
                Start Chat →
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <i className="fas fa-envelope text-3xl text-[#ab3b43] mb-4"></i>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">Send us a detailed message</p>
              <button className="text-[#ab3b43] hover:text-[#8f2f36] font-medium">
                Send Email →
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <i className="fas fa-phone text-3xl text-[#201a7c] mb-4"></i>
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-4">Speak directly with our team</p>
              <button className="text-[#201a7c] hover:text-[#1a1569] font-medium">
                Call Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
