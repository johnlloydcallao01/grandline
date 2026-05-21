import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthErrorBoundary } from "@/components/auth";
import { InstantLoadingController, LoadingScreenWrapper } from "@/components/loading";
import { getServerToken, getServerUser } from "@/app/actions/auth";
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

export const metadata: Metadata = {
  title: "Grandline Instructor Portal",
  description: "A simple instructor-facing Next.js workspace for Grandline.",
};

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
      <body className="min-h-full font-sans">
        <InstantLoadingController />
        <AuthErrorBoundary>
          <AuthProvider initialUser={initialUser} initialToken={initialToken}>
            <LoadingScreenWrapper>{children}</LoadingScreenWrapper>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
