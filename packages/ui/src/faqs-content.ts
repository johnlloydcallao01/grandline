export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSupportOption {
  iconClassName: string;
  iconColorClassName: string;
  title: string;
  description: string;
  actionLabel: string;
  actionClassName: string;
  actionHoverClassName: string;
}

export const maritimeFAQItems: FAQItem[] = [
  {
    question: "What courses do you offer?",
    answer:
      "We offer basic and advanced maritime training programs, including STCW courses and refresher trainings.",
  },
  {
    question: "How do I enroll in a course?",
    answer:
      "You can enroll online through our website or visit our training center for assistance.",
  },
  {
    question: "Are your courses accredited?",
    answer: "Yes, all our programs are MARINA and IMO-compliant.",
  },
  {
    question: "Do you offer job placement after training?",
    answer:
      "We provide guidance and referrals through our partner agencies, but placement is not guaranteed.",
  },
  {
    question: "What should I bring on my first day of training?",
    answer:
      "Bring a valid ID, medical certificate, seaman's book (if available), and any required documents listed during enrollment.",
  },
];

export const maritimeFAQSupportHeading = "Still Have Questions?";

export const maritimeFAQSupportDescription =
  "Our support team is here to help you 24/7. Get in touch and we'll respond within 2 hours.";

export const maritimeFAQSupportOptions: FAQSupportOption[] = [
  {
    iconClassName: "fas fa-comments",
    iconColorClassName: "text-[#201a7c]",
    title: "Live Chat",
    description: "Get instant help from our support team",
    actionLabel: "Start Chat \u2192",
    actionClassName: "text-[#201a7c]",
    actionHoverClassName: "hover:text-[#1a1569]",
  },
  {
    iconClassName: "fas fa-envelope",
    iconColorClassName: "text-[#ab3b43]",
    title: "Email Support",
    description: "Send us a detailed message",
    actionLabel: "Send Email \u2192",
    actionClassName: "text-[#ab3b43]",
    actionHoverClassName: "hover:text-[#8f2f36]",
  },
  {
    iconClassName: "fas fa-phone",
    iconColorClassName: "text-[#201a7c]",
    title: "Phone Support",
    description: "Speak directly with our team",
    actionLabel: "Call Now \u2192",
    actionClassName: "text-[#201a7c]",
    actionHoverClassName: "hover:text-[#1a1569]",
  },
];
