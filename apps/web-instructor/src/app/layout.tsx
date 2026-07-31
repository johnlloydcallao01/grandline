import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthErrorBoundary } from "@/components/auth";
import { LoadingScreenWrapper } from "@/components/loading";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getServerToken, getServerUser } from "@/app/actions/auth";
import { getSiteSettingsFavicon } from "@/server/siteSettings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const defaultMetadata: Metadata = {
  title: "Grandline Instructor Portal",
  description: "A simple instructor-facing Next.js workspace for Grandline.",
};

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl } = await getSiteSettingsFavicon();
  const iconUrl = faviconUrl || "/grandline-logo.png";

  return {
    ...defaultMetadata,
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getServerUser();
  const initialToken = await getServerToken();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              var theme = localStorage.getItem('grandline-instructor-theme-preference') || 'system';
              var resolved = theme === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme;
              document.documentElement.classList.add(resolved);
              document.documentElement.setAttribute('data-theme', resolved);
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full font-sans">
        <AuthErrorBoundary>
          <AuthProvider initialUser={initialUser} initialToken={initialToken}>
            <ThemeProvider>
              <LoadingScreenWrapper>{children}</LoadingScreenWrapper>
            </ThemeProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
