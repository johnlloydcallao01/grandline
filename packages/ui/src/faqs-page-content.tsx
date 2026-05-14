"use client";

import { useState } from "react";

import {
  maritimeFAQItems,
  maritimeFAQSupportDescription,
  maritimeFAQSupportHeading,
  maritimeFAQSupportOptions,
} from "./faqs-content";

interface FAQsPageContentProps {
  showSupportSection?: boolean;
  variant?: "landing" | "app";
}

export function FAQsPageContent({
  showSupportSection = true,
  variant = "landing",
}: FAQsPageContentProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const isAppVariant = variant === "app";

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <>
      {isAppVariant ? (
        <div className="w-full px-[10px] py-6 md:py-8">
          <div className="space-y-8">
            <section className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
              <div className="border-b border-[var(--card-border)] bg-gray-50/80 px-6 py-5 dark:bg-gray-800/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Common Questions
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Quick answers about courses, enrollment, accreditation, and
                  support.
                </p>
              </div>
              <div className="divide-y divide-[var(--card-border)]">
                {maritimeFAQItems.map((faq, index) => {
                  const isOpen = openFAQ === index;

                  return (
                    <div key={faq.question} className="bg-[var(--card-background)]">
                      <button
                        type="button"
                        onClick={() => toggleFAQ(index)}
                        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                      >
                        <span className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100 md:text-lg">
                          {faq.question}
                        </span>
                        <span
                          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isOpen
                              ? "border-[#201a7c] bg-[#201a7c]/10 text-[#201a7c] dark:border-[#7b75ef] dark:bg-[#7b75ef]/15 dark:text-[#7b75ef]"
                              : "border-[var(--card-border)] bg-gray-50 text-gray-400 dark:bg-gray-800/60 dark:text-gray-500"
                          }`}
                        >
                          <i
                            className={`fas fa-chevron-down text-xs transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5">
                          <div className="rounded-xl border border-[var(--card-border)] bg-gray-50/80 px-5 py-4 dark:bg-gray-800/40">
                            <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 md:text-[15px]">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {showSupportSection && (
              <section className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">
                    {maritimeFAQSupportHeading}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400 md:text-base">
                    {maritimeFAQSupportDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {maritimeFAQSupportOptions.map((option) => (
                    <div
                      key={option.title}
                      className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/30"
                    >
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <i
                          className={`${option.iconClassName} ${option.iconColorClassName} text-xl`}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {option.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                      <button
                        type="button"
                        className="mt-5 inline-flex items-center rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[#201a7c] transition-colors hover:bg-gray-50 dark:text-[#7b75ef] dark:hover:bg-gray-800"
                      >
                        {option.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : (
        <>
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-4">
                {maritimeFAQItems.map((faq, index) => {
                  const isOpen = openFAQ === index;

                  return (
                    <div
                      key={faq.question}
                      className={`border rounded-xl transition-all ${
                        isOpen
                          ? "border-[#201a7c] ring-1 ring-[#201a7c]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <span className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </span>
                        <i
                          className={`fas fa-chevron-down transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180 text-[#201a7c]"
                              : "text-gray-400"
                          }`}
                        />
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

          {showSupportSection && (
            <section className="py-20 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                  {maritimeFAQSupportHeading}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {maritimeFAQSupportDescription}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {maritimeFAQSupportOptions.map((option) => (
                    <div
                      key={option.title}
                      className="bg-white p-6 rounded-xl shadow-sm"
                    >
                      <i
                        className={`${option.iconClassName} ${option.iconColorClassName} text-3xl mb-4`}
                      />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {option.description}
                      </p>
                      <button
                        type="button"
                        className={`${option.actionClassName} ${option.actionHoverClassName} font-medium`}
                      >
                        {option.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
