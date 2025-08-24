import React from "react";
import { Metadata } from "next";
import { ShortsClient } from "./ShortsClient";

export const metadata: Metadata = {
  title: "Shorts - Quick Business & Tech Videos | Calsiter",
  description: "Watch short-form videos about business growth, marketing strategies, technology insights, and professional development. Quick, actionable content for busy professionals.",
  keywords: "business shorts, marketing tips, tech insights, professional development, quick videos, business growth",
  openGraph: {
    title: "Shorts - Quick Business & Tech Videos | Calsiter",
    description: "Watch short-form videos about business growth, marketing strategies, technology insights, and professional development.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shorts - Quick Business & Tech Videos | Calsiter",
    description: "Watch short-form videos about business growth, marketing strategies, technology insights, and professional development.",
  },
};

export default function ShortsPage() {
  return <ShortsClient />;
}
