"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function SupportPage() {
    const [selectedTopic, setSelectedTopic] = useState("");

    const helpOptions = [
        {
            icon: "fas fa-comments",
            title: "Live Chat",
            description: "Get instant help from our support team",
            available: "Available 24/7",
            action: "Start Chat",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: "fas fa-envelope",
            title: "Email Support",
            description: "Send us a detailed message",
            available: "Response within 24 hours",
            action: "Send Email",
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: "fas fa-phone",
            title: "Phone Support",
            description: "Speak directly with our team",
            available: "Mon-Fri, 9AM-6PM PST",
            action: "Call Now",
            color: "from-green-500 to-green-600"
        },
        {
            icon: "fas fa-book",
            title: "Knowledge Base",
            description: "Browse our help articles",
            available: "1000+ articles available",
            action: "Browse Articles",
            color: "from-orange-500 to-orange-600"
        }
    ];

    const commonIssues = [
        {
            question: "How do I reset my password?",
            answer: "Click on 'Forgot Password' on the login page and follow the email instructions."
        },
        {
            question: "How do I enroll in a course?",
            answer: "Browse courses, select your desired program, and click 'Enroll Now'. Complete the payment process to access the course."
        },
        {
            question: "What are the technical requirements?",
            answer: "You'll need a modern web browser, stable internet connection (minimum 5 Mbps), and device with microphone/camera for live sessions."
        },
        {
            question: "How do I access my certificates?",
            answer: "After completing a course, go to 'My Account' > 'Certificates' to download your certification documents."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept credit/debit cards, PayPal, bank transfers, and offer installment payment plans for eligible courses."
        }
    ];

    const supportTopics = [
        "Account & Login",
        "Course Enrollment",
        "Payment & Billing",
        "Technical Issues",
        "Certificates",
        "Other"
    ];

    return (
        <main className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="heading-primary text-4xl md:text-6xl mb-6">
                            <span className="text-[#F5F5F5]">Customer</span> <span className="text-[#ab3b43]">Support</span>
                        </h1>
                        <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
                            We're here to help you succeed. Get the assistance you need, whenever you need it.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Help Options */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                            How Can We Help You?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Choose your preferred way to get support
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {helpOptions.map((option, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 card-hover text-center"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                    <i className={`${option.icon} text-2xl text-white`}></i>
                                </div>
                                <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-3">
                                    {option.title}
                                </h3>
                                <p className="text-gray-600 mb-2 leading-relaxed">
                                    {option.description}
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    {option.available}
                                </p>
                                <button className="w-full btn-primary py-3">
                                    {option.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Common Issues */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                            Common Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Quick answers to frequently asked questions
                        </p>
                    </div>

                    <div className="space-y-4">
                        {commonIssues.map((issue, index) => (
                            <details
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
                            >
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                        {issue.question}
                                    </h3>
                                    <i className="fas fa-chevron-down text-gray-400 group-open:rotate-180 transition-transform"></i>
                                </summary>
                                <p className="mt-4 text-gray-600 leading-relaxed pl-0">
                                    {issue.answer}
                                </p>
                            </details>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            href="/faq"
                            className="text-[#201a7c] hover:text-[#1a1569] font-medium inline-flex items-center gap-2"
                        >
                            View All FAQs
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Support Ticket Form */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="text-center mb-8">
                            <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                                Submit a Support Ticket
                            </h2>
                            <p className="text-lg text-gray-600">
                                Can't find what you're looking for? Send us a detailed message and we'll get back to you soon.
                            </p>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-gray-400"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-gray-400"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                                    Support Topic *
                                </label>
                                <select
                                    id="topic"
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors"
                                >
                                    <option value="">Select a topic</option>
                                    {supportTopics.map((topic, index) => (
                                        <option key={index} value={topic}>
                                            {topic}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-gray-400"
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-gray-400"
                                    placeholder="Please provide as much detail as possible..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary py-4 text-lg"
                            >
                                <i className="fas fa-paper-plane mr-2"></i>
                                Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-20 bg-gradient-to-r from-[#201a7c] to-[#ab3b43]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="heading-primary text-3xl md:text-4xl text-white mb-4">
                            Other Ways to Reach Us
                        </h2>
                        <p className="text-xl text-blue-100">
                            We're available through multiple channels
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-phone text-2xl text-white"></i>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Phone</h3>
                            <a href="tel:+639922633118" className="text-blue-100 hover:text-white transition-colors">
                                +63992 263 3118
                            </a>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-envelope text-2xl text-white"></i>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                            <a href="mailto:info@grandliinemaritime.com" className="text-blue-100 hover:text-white transition-colors">
                                info@grandliinemaritime.com
                            </a>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-map-marker-alt text-2xl text-white"></i>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Office</h3>
                            <p className="text-blue-100">
                                Ermita, Manila<br />
                                Philippines
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
