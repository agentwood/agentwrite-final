import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import AgeGate from "./components/AgeGate";
import StructuredData from "./components/StructuredData";
import AuthWrapper from "./components/AuthWrapper";
import CookieConsent from "./components/CookieConsent";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  title: {
    template: "%s | Agentwood",
    default: "Agentwood - AI Character Chat",
  },
  description: "Chat with thousands of AI characters, create your own, and discover unique personalities. Free AI character chat platform similar to Character.ai. Talk to AI waifus, fantasy characters, and real-world personas.",
  keywords: [
    "AI characters",
    "character chat",
    "character.ai alternative",
    "AI waifu",
    "fantasy characters",
    "AI chatbot",
    "virtual characters",
    "AI companion",
    "chat with AI",
    "character creator",
    "AI roleplay",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agentwood.xyz",
    siteName: "Agentwood",
    title: "Agentwood - AI Character Chat",
    description: "Chat with thousands of AI characters, create your own, and discover unique personalities.",
    images: [
      {
        url: "https://agentwood.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agentwood",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agentwood - AI Character Chat",
    description: "Chat with thousands of AI characters, create your own, and discover unique personalities.",
    images: ["https://agentwood.xyz/og-image.png"],
    creator: "@agentwood",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body
        className="text-white selection:bg-purple-500 selection:text-white bg-[#0f0f0f] antialiased"
        suppressHydrationWarning
      >
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        <AgeGate>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </AgeGate>
        <CookieConsent />
      </body>
    </html>
  );
}
