export interface TermsDefinitionItem {
  term: string;
  description: string;
}

export interface TermsSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const termsPageTitle = "Terms and Conditions";

export const termsPageDescription =
  "Review the terms that govern your use of Grandline Maritime Training and Development Center services.";

export const termsLastUpdated = "December 29, 2025";

export const termsIntro =
  "Please read these Terms and Conditions carefully before using Our Service.";

export const termsInterpretationTitle = "Interpretation and Definitions";

export const termsInterpretationParagraph =
  "The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.";

export const termsDefinitionsIntro =
  "For the purposes of these Terms and Conditions:";

export const termsDefinitions: TermsDefinitionItem[] = [
  {
    term: "Affiliate",
    description:
      "means an entity that controls, is controlled by or is under common control with a party, where \"control\" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.",
  },
  {
    term: "Account",
    description:
      "means an individual user account registered with Us that allows You to access certain features of the Service.",
  },
  {
    term: "User Content",
    description:
      "means any content such as text, images, graphics, audio or video that You create, upload, post, or otherwise make available through the Service.",
  },
  {
    term: "Country",
    description: "refers to: Philippines.",
  },
  {
    term: "Company",
    description:
      "referred to as either \"the Company\", \"We\", \"Us\" or \"Our\" in this Agreement, refers to Grandline Maritime Training and Development Center Inc., Pierre N Paul Bldg. 505 A. Flores cor. A. Mabini Street, Ermita Manila, Manila, Philippines.",
  },
  {
    term: "Device",
    description:
      "means any device that can access the Service such as a computer, a cellphone or a digital tablet.",
  },
  {
    term: "Service",
    description: "refers to the Website.",
  },
  {
    term: "Terms and Conditions",
    description:
      "also referred to as \"Terms\", mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.",
  },
  {
    term: "Third-party Social Media Service",
    description:
      "means any services or content, including data, information, products or services, provided by a third party that may be displayed, included or made available by the Service.",
  },
  {
    term: "Website",
    description:
      "refers to Grandline Maritime Training and Development Center Inc., accessible from https://grandlinemaritime.com/.",
  },
  {
    term: "You",
    description:
      "means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.",
  },
];

export const termsSections: TermsSection[] = [
  {
    title: "Acknowledgment",
    paragraphs: [
      "These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.",
      "Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.",
      "By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions, then You may not access the Service.",
      "You represent that You are over the age of 18. The Company does not permit those under 18 to use the Service.",
      "Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.",
    ],
  },
  {
    title: "License to Use the Service",
    paragraphs: [
      "Subject to Your compliance with these Terms and Conditions, the Company grants You a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for Your personal or internal business purposes.",
    ],
  },
  {
    title: "User Accounts",
    paragraphs: [
      "You may create an Account to access certain features of the Service. You agree to provide accurate, current and complete information during the registration process and to update such information to keep it accurate.",
      "You are responsible for safeguarding Your password and for any activities or actions under Your Account. You agree to notify the Company immediately of any unauthorized use of Your account or any other breach of security.",
    ],
  },
  {
    title: "Intellectual Property Rights",
    paragraphs: [
      "All content, artwork, logos, trademarks, trade dress, designs, graphics, software, and other materials appearing on or in connection with the Service (\"Company Content\") are the exclusive property of the Company or its licensors and are protected by copyright, trademark, patent, trade secret and other intellectual property laws.",
      "No portion of the Service or its Content may be copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way without the Company’s prior written permission. You agree not to modify, reverse engineer, decompile, disassemble or create derivative works based on the Service or Company Content.",
    ],
  },
  {
    title: "User-Generated Content",
    paragraphs: [
      "By creating, uploading or posting any User Content through the Service, You grant the Company a worldwide, non-exclusive, royalty-free, transferable, sublicensable right to use, reproduce, modify, publish, translate, distribute, perform and display such User Content in connection with the Service and the Company’s (and its successors’ and affiliates’) business.",
      "The Company reserves the right to monitor, edit, or remove any User Content at its sole discretion, for any reason or no reason, without notice.",
    ],
    bullets: [
      "You own or have the necessary licenses, rights, consents and permissions to use and authorize the Company to use all intellectual property rights in and to any User Content.",
      "User Content will not infringe any intellectual property, privacy, publicity or other rights of any third party or contain any unlawful, harmful or offensive material.",
    ],
  },
  {
    title: "Prohibited Uses",
    paragraphs: ["You agree not to:"],
    bullets: [
      "Use the Service for any illegal purpose or in violation of any local, national, or international law.",
      "Reverse engineer, decompile, or disassemble any part of the Service or attempt to do so.",
      "Probe, scan or test the vulnerability of the Service or any network connected to the Service.",
      "Upload or transmit any malware, viruses, worms, or other harmful code.",
      "Harvest or collect personal data about other users without their express consent.",
      "Impersonate any person or entity or falsely state or misrepresent Your affiliation with any person or entity.",
    ],
  },
  {
    title: "Links to Other Websites",
    paragraphs: [
      "Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.",
      "The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.",
      "Upon termination, Your right to use the Service will cease immediately.",
    ],
  },
  {
    title: "Payments and Fees",
    paragraphs: [
      "If You purchase any premium features, courses or certificates through the Service, You agree to pay all applicable fees and taxes. All payments are non-refundable except as required by law or as expressly stated in a written refund policy.",
      "The Company reserves the right to change its fees and payment policies at any time, but will provide at least 30 days’ notice for any material changes.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.",
      "To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever, including but not limited to damages for loss of profits, loss of data or other information, for business interruption, for personal injury, or loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms, even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.",
    ],
  },
  {
    title: "\"AS IS\" and \"AS AVAILABLE\" Disclaimer",
    paragraphs: [
      "The Service is provided to You \"AS IS\" and \"AS AVAILABLE\" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service.",
    ],
  },
  {
    title: "Governing Law",
    paragraphs: [
      "The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.",
    ],
  },
  {
    title: "Dispute Resolution & Arbitration",
    paragraphs: [
      "If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company. If the dispute cannot be resolved informally within 30 days, either party may submit the dispute to binding arbitration in Manila, Philippines under the rules of the Philippine Dispute Resolution Center, Inc.",
    ],
  },
];

export const termsContact = {
  email: "info@grandlinemaritime.com",
  contactPageUrl: "https://grandlinemaritime.com/contact-us/",
  phone: "+63 991 551 5296",
};
