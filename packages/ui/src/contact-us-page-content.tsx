"use client";

import { useState } from "react";
import type React from "react";

import {
  contactBusinessHours,
  contactFieldLabels,
  contactFormTitle,
  contactInfoItems,
  contactInfoTitle,
  contactPlaceholders,
  contactSubmitLabels,
} from "./contact-us-content";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactUsPageContentProps {
  variant?: "landing" | "app";
}

interface ContactFieldChangeEvent {
  target: {
    name: string;
    value: string;
  };
}

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactUsPageContent({
  variant = "landing",
}: ContactUsPageContentProps) {
  const isAppVariant = variant === "app";
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event: ContactFieldChangeEvent) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "https://cms.grandlinemaritime.com/api";
      const apiUrl = `${apiBase.replace(/\/$/, "")}/contact`;

      const response = await globalThis.fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (data.success) {
        setSuccessMessage(
          data.message || contactSubmitLabels.successFallback,
        );
        setFormData(initialFormData);
      } else {
        setError(data.message || contactSubmitLabels.errorFallback);
      }
    } catch (submissionError) {
      console.error("Contact form error:", submissionError);
      setError(contactSubmitLabels.networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInfoContent = (type?: string, content?: string) => {
    if (type === "hours") {
      return (
        <div className="space-y-2 text-sm">
          {contactBusinessHours.map((item) => (
            <div key={item.day} className="flex justify-between gap-4">
              <span>{item.day}</span>
              <span>{item.hours}</span>
            </div>
          ))}
        </div>
      );
    }

    if (type === "phone" && content) {
      return (
        <a href={`tel:${content}`} className="transition-colors hover:text-[#201a7c]">
          {content}
        </a>
      );
    }

    if (type === "email" && content) {
      return (
        <a
          href={`mailto:${content}`}
          className="transition-colors hover:text-[#201a7c]"
        >
          {content}
        </a>
      );
    }

    return content;
  };

  if (isAppVariant) {
    return (
      <div className="w-full px-[10px] py-6 md:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
            <div className="border-b border-[var(--card-border)] bg-gray-50/80 px-6 py-5 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {contactFormTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Share your inquiry and our team will get back to you as soon as
                possible.
              </p>
            </div>

            <div className="p-6 md:p-8">
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    {successMessage}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {contactFieldLabels.name}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100 dark:placeholder:text-gray-400"
                      placeholder={contactPlaceholders.name}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {contactFieldLabels.email}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100 dark:placeholder:text-gray-400"
                      placeholder={contactPlaceholders.email}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {contactFieldLabels.subject}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100 dark:placeholder:text-gray-400"
                    placeholder={contactPlaceholders.subject}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {contactFieldLabels.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100 dark:placeholder:text-gray-400"
                    placeholder={contactPlaceholders.message}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#201a7c] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1a1569] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#7b75ef]"
                >
                  <i
                    className={`fas ${
                      isSubmitting ? "fa-spinner fa-spin" : "fa-paper-plane"
                    } mr-2`}
                  />
                  {isSubmitting
                    ? contactSubmitLabels.submitting
                    : contactSubmitLabels.idle}
                </button>
              </form>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">
                {contactInfoTitle}
              </h2>
              <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 md:text-base">
                Visit, call, or email us during business hours for assistance.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfoItems.map((info) => (
                <div
                  key={info.title}
                  className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/60">
                      <i className={`${info.icon} text-[#201a7c] dark:text-[#7b75ef]`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {info.title}
                      </h3>
                      <div className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {renderInfoContent(info.type, info.content)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
              {contactFormTitle}
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
                    {contactFieldLabels.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                    placeholder={contactPlaceholders.name}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {contactFieldLabels.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                    placeholder={contactPlaceholders.email}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {contactFieldLabels.subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                  placeholder={contactPlaceholders.subject}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {contactFieldLabels.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent transition-colors placeholder:text-[#777]"
                  placeholder={contactPlaceholders.message}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i
                  className={`fas ${
                    isSubmitting ? "fa-spinner fa-spin" : "fa-paper-plane"
                  } mr-2`}
                />
                {isSubmitting
                  ? contactSubmitLabels.submitting
                  : contactSubmitLabels.idle}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                {contactInfoTitle}
              </h2>
              <div className="space-y-6">
                {contactInfoItems.map((info) => (
                  <div
                    key={info.title}
                    className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#201a7c]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${info.icon} text-[#201a7c]`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                      <div className="text-gray-600 mb-2">
                        {renderInfoContent(info.type, info.content)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
