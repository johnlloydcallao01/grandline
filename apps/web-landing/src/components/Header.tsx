"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchProvider } from "@/contexts/SearchContext";
import { useSearch } from "@/hooks/useSearch";
import { MobileSearchOverlay } from "@/components/search/MobileSearchOverlay";

function HeaderInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const {
    setOverlayOpen,
    loadRecentKeywords
  } = useSearch();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/courses", label: "Courses" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

  const resourcesItems = [
    { href: "/blogs", label: "Blogs" },
    { href: "/knowledge-base", label: "Knowledge Base" },
    { href: "/instructor", label: "Become an Instructor" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={56} height={56} priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link text-gray-700 hover:text-[#201a7c] px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}


              {/* Resources Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsResourcesOpen(true)}
                onMouseLeave={() => setIsResourcesOpen(false)}
              >
                <button className="nav-link text-gray-700 hover:text-[#201a7c] px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1">
                  Resources
                  <i className={`fas fa-chevron-down text-xs transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {isResourcesOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {resourcesItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#201a7c] transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => { setOverlayOpen(true); loadRecentKeywords(); }}
              className="p-3 text-gray-600 hover:text-[#201a7c] hover:bg-gray-50 rounded-lg transition-colors"
            >
              <i className="fas fa-search text-lg"></i>
            </button>
            <Link
              href="https://app.grandlinemaritime.com/"
              className="bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white px-6 py-3 rounded-lg font-medium hover:from-[#1a1569] hover:to-[#8f2f36] transition-all duration-300 inline-flex items-center text-sm"
            >
              <i className="fas fa-user-circle mr-2"></i>
              My Account
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#201a7c] focus:outline-none focus:text-[#201a7c] p-2"
            >
              <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} text-lg`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#201a7c] hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Resources submenu in mobile */}
              <div className="pt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resources
                </div>
                {resourcesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 pl-6 text-base font-medium text-gray-600 hover:text-[#201a7c] hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-4 pb-2 border-t border-gray-200 mt-4 space-y-3">
                <button
                  onClick={() => { setOverlayOpen(true); loadRecentKeywords(); setIsMenuOpen(false); }}
                  className="w-full p-3 text-gray-600 hover:text-[#201a7c] hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-search text-lg mr-2"></i>
                  Search
                </button>
                <Link
                  href="https://app.grandlinemaritime.com/"
                  className="block w-full text-center bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white px-6 py-4 rounded-lg font-medium hover:from-[#1a1569] hover:to-[#8f2f36] transition-all duration-300 inline-flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-circle mr-2"></i>
                  My Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export function Header() {
  return (
    <SearchProvider>
      <HeaderInner />
      <MobileSearchOverlay />
    </SearchProvider>
  );
}
