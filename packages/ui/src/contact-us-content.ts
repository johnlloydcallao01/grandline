export interface ContactBusinessHour {
  day: string;
  hours: string;
}

export interface ContactInfoItem {
  icon: string;
  title: string;
  content: string;
  type?: "text" | "phone" | "email" | "hours";
}

export const contactHeroTitle = {
  first: "Get in",
  second: "Touch",
};

export const contactHeroDescription =
  "Have questions about our platform? Want to discuss enterprise solutions? We're here to help you succeed in your learning journey.";

export const contactPageTitle = "Contact Us";

export const contactPageDescription =
  "Reach our team for training inquiries, enrollment help, and general support.";

export const contactFormTitle = "Send us a Message";

export const contactInfoTitle = "Contact Information";

export const contactSubmitLabels = {
  idle: "Send Message",
  submitting: "Sending...",
  successFallback: "Thank you for contacting us!",
  errorFallback: "Failed to send message. Please try again.",
  networkError: "Network error. Please check your connection and try again.",
};

export const contactFieldLabels = {
  name: "Full Name *",
  email: "Email Address *",
  subject: "Subject *",
  message: "Message *",
};

export const contactPlaceholders = {
  name: "Your full name",
  email: "your.email@example.com",
  subject: "Brief description of your inquiry",
  message: "Tell us more about your inquiry...",
};

export const contactBusinessHours: ContactBusinessHour[] = [
  { day: "Sunday", hours: "Closed" },
  { day: "Monday", hours: "7:30 AM - 5:30 PM" },
  { day: "Tuesday", hours: "7:30 AM - 5:30 PM" },
  { day: "Wednesday", hours: "7:30 AM - 5:30 PM" },
  { day: "Thursday", hours: "7:30 AM - 5:30 PM" },
  { day: "Friday", hours: "7:30 AM - 5:30 PM" },
  { day: "Saturday", hours: "8 AM - 5 PM" },
];

export const contactInfoItems: ContactInfoItem[] = [
  {
    icon: "fas fa-map-marker-alt",
    title: "Visit Our Office",
    content: "667 Kalaw Ave, Ermita, Manila, Philippines, 1000",
    type: "text",
  },
  {
    icon: "fas fa-phone",
    title: "Call Us",
    content: "+63976 636 4761",
    type: "phone",
  },
  {
    icon: "fas fa-envelope",
    title: "Email Us",
    content: "info@grandlinemaritime.com",
    type: "email",
  },
  {
    icon: "fas fa-clock",
    title: "Business Hours",
    content: "",
    type: "hours",
  },
];
