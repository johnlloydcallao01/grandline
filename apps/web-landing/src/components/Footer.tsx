"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/courses", label: "Courses" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" }
  ];


  const resources = [
    { href: "https://app.grandlinemaritime.com/signin", label: "Start Now" },
    { href: "/become-an-instructor", label: "Become an Instructor" },
    { href: "/blogs", label: "Blogs" },
    { href: "/knowledge-base", label: "Knowledge Base" },
    { href: "/support", label: "Support" }
  ];

  const socials = [
    { href: "https://www.facebook.com/grandlinemaritimetraininganddevelopmementcenterinc", label: "Facebook", icon: "fab fa-facebook-f" },
    { href: "https://www.tiktok.com/@grandlinemaritime?_t=ZS-90YiLGVOWjy&_r=1&fbclid=IwY2xjawO2GT9leHRuA2FlbQIxMABicmlkETFIczJ6cmtHaDVjc2xqdHhqc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHtkxr9QDXeYvOMxmh79N3lbUDUTWunIfhHLJfM0u1DuPZOdu4SoS2Mv3p9s5_aem_rMSM5uDs1X7wN1I2ffY0SQ", label: "TikTok", icon: "fab fa-tiktok" }
  ];

  const legal = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms and Conditions" },
    { href: "/cookie-policy", label: "Cookie Policy" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <Image src="/logo.png" alt="Logo" width={56} height={56} priority />
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Grandline Maritime Training and Development Center Inc. sets sail toward your maritime career with expert-led courses to help you become a true maritime professional.
            </p>
          </div>

          {/* Navigation columns - 2 columns on tablet, part of 5-column grid on desktop */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-3">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 heading-secondary">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-6 heading-secondary">Resources</h3>
              <ul className="space-y-3">
                {resources.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-lg font-semibold mb-6 heading-secondary">Socials</h3>
              <ul className="space-y-3">
                {socials.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-flex items-center gap-2"
                    >
                      <i className={item.icon}></i>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>



        {/* Contact info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-3">
              <i className="fas fa-map-marker-alt text-[#ab3b43] mt-1"></i>
              <div>
                <h4 className="font-semibold mb-1">Address</h4>
                <p className="text-gray-300 text-sm">
                  UNIT 307-310 3rd Floor TM KALAW CENTER BLDG<br />
                  667 TM KALAW ST. BARANGAY 667 ZONE 72<br />
                  Ermita, Philippines, 1000
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <i className="fas fa-phone text-[#ab3b43] mt-1"></i>
              <div>
                <h4 className="font-semibold mb-1">Phone</h4>
                <a href="tel:+639922633118" className="text-gray-300 hover:text-white transition-colors text-sm">
                  +63992 263 3118
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <i className="fas fa-envelope text-[#ab3b43] mt-1"></i>
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <a href="mailto:info@grandliinemaritime.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                  info@grandliinemaritime.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © {currentYear} Grandline Maritime Training and Development Center Inc.
            </p>
            <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
              {legal.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-[#201a7c] hover:bg-[#1a1569] rounded-full flex items-center justify-center text-white shadow-lg transition-colors group"
          aria-label="Back to top"
        >
          <i className="fas fa-chevron-up group-hover:scale-110 transition-transform"></i>
        </button>
      </div>
    </footer>
  );
}
