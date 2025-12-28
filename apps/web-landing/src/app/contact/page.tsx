"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // Build API URL
      const apiBase = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://cms.grandlinemaritime.com/api';
      const apiUrl = `${apiBase.replace(/\/$/, '')}/contact`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Thank you for contacting us!');
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Visit Our Office",
      content: "667 Kalaw Ave, Ermita, Manila, Philippines, 1000"
    },
    {
      icon: "fas fa-phone",
      title: "Call Us",
      content: "+63976 636 4761"
    },
    {
      icon: "fas fa-envelope",
      title: "Email Us",
      content: "info@grandlinemaritime.com"
    },
    {
      icon: "fas fa-clock",
      title: "Business Hours",
      content: (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
          <div className="flex justify-between"><span>Monday</span><span>7:30 AM – 5:30 PM</span></div>
          <div className="flex justify-between"><span>Tuesday</span><span>7:30 AM – 5:30 PM</span></div>
          <div className="flex justify-between"><span>Wednesday</span><span>7:30 AM – 5:30 PM</span></div>
          <div className="flex justify-between"><span>Thursday</span><span>7:30 AM – 5:30 PM</span></div>
          <div className="flex justify-between"><span>Friday</span><span>7:30 AM – 5:30 PM</span></div>
          <div className="flex justify-between"><span>Saturday</span><span>8 AM – 5 PM</span></div>
        </div>
      )
    }
  ];

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">Get in</span> <span className="text-[#ab3b43]">Touch</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
              Have questions about our platform? Want to discuss enterprise solutions?
              We're here to help you succeed in your learning journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>


                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}></i>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-[#201a7c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${info.icon} text-[#201a7c]`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <div className="text-gray-600 mb-2">{info.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
