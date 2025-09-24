import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import { LoadingScreenWrapper, InstantLoadingController } from "@/components/loading";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthErrorBoundary } from "@/components/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grandline Maritime Admin Dashboard",
  description: "Admin dashboard for Grandline Maritime Training and Development Center Inc",
  keywords: "admin dashboard, maritime training, course management, student management",
  authors: [{ name: "Grandline Maritime Team" }],
  robots: "noindex, nofollow", // Prevent search engine indexing
  openGraph: {
    title: "Grandline Maritime Admin Dashboard",
    description: "Admin dashboard for maritime training management.",
    type: "website",
  },
};

// Proper React 19 layout props type
type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Instant Loading Screen - Shows immediately on page load */}
        <div id="instant-loading-screen" className="facebook-loading-screen">
          <div className="facebook-loading-overlay">
            <div className="facebook-loading-content">
              {/* Company Logo Animation */}
              <div className="facebook-logo-container">
                <div className="facebook-logo">
                  {/* @ts-ignore -- Next.js Image component type issue with React 19 */}
                  <Image
                    src="/calsiter-inc-logo.png"
                    alt="Grandline Maritime Logo"
                    width={48}
                    height={48}
                    className="facebook-logo-image"
                    priority
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                {/* Pulsing Ring Animation */}
                <div className="facebook-pulse-ring"></div>
                <div className="facebook-pulse-ring facebook-pulse-ring-delay"></div>
              </div>

              {/* Loading Text */}
              <div className="facebook-loading-text">
                <h2>Grandline Maritime Admin</h2>
                <p>Loading your dashboard...</p>
              </div>

              {/* Progress Bar */}
              <div className="facebook-progress-container">
                <div className="facebook-progress-bar">
                  <div className="facebook-progress-fill" style={{ width: '30%' }}></div>
                </div>
                <div className="facebook-progress-dots">
                  <div className="facebook-dot facebook-dot-1"></div>
                  <div className="facebook-dot facebook-dot-2"></div>
                  <div className="facebook-dot facebook-dot-3"></div>
                </div>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="facebook-bg-pattern">
              <div className="facebook-bg-circle facebook-bg-circle-1"></div>
              <div className="facebook-bg-circle facebook-bg-circle-2"></div>
              <div className="facebook-bg-circle facebook-bg-circle-3"></div>
            </div>
          </div>
        </div>

        {/* Client-side loading screen controller */}
        <InstantLoadingController />

        <AuthErrorBoundary>
          <AuthProvider>
            <LoadingScreenWrapper>
              {children}
            </LoadingScreenWrapper>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
