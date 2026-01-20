import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f0f",
};
import AgeGate from "./components/AgeGate";
import StructuredData from "./components/StructuredData";
import AuthWrapper from "./components/AuthWrapper";
import CookieConsent from "./components/CookieConsent";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data";

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
        url: "https://agentwood.xyz/TwitterCardValidator.png",
        width: 1200,
        height: 630,
        alt: "Agentwood - AI Character Chat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agentwood - AI Character Chat",
    description: "Chat with thousands of AI characters, create your own, and discover unique personalities.",
    images: ["https://agentwood.xyz/TwitterCardValidator.png"],
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
    <html lang="en">
      <body
        className="text-white selection:bg-purple-500 selection:text-white bg-[#0f0f0f] antialiased min-h-screen"
        suppressHydrationWarning
      >
        {/* Wrapper div to scale content while filling viewport */}
        <div
          style={{
            transform: 'scale(0.9)',
            transformOrigin: 'top left',
            width: '111.11%', // 100% / 0.9 = 111.11% to fill after scaling
            minHeight: '111.11vh'
          }}
        >
          <StructuredData data={organizationSchema} />
          <StructuredData data={websiteSchema} />
          <AgeGate>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </AgeGate>
          <CookieConsent />
        </div>
      </body>
    </html>
  );
}
