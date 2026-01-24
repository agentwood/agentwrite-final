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
import { SessionProvider } from "@/lib/analytics/SessionProvider";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://agentwood.xyz"),
  title: {
    template: "%s | Agentwood",
    default: "Agentwood - AI Character Chat Platform with Long-Term Memory",
  },
  description: "Chat with evolving AI characters that remember you. Create, train, and share autonomous AI agents for storytelling, roleplay, and companionship. Free alternative to Character.ai and Talkie.",
  keywords: [
    "AI characters",
    "character chat",
    "long-term memory AI",
    "AI agent platform",
    "agent swarm",
    "interactive storytelling",
    "AI roleplay",
    "virtual companions",
    "custom AI characters",
    "waifu chat",
    "character.ai alternative",
    "talkie.ai alternative",
  ],
  alternates: {
    canonical: './',
  },
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
        className="text-white selection:bg-purple-500 selection:text-white bg-[#0f0f0f] antialiased"
        suppressHydrationWarning
      >
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        <AgeGate>
          <AuthWrapper>
            <SessionProvider>
              {children}
            </SessionProvider>
          </AuthWrapper>
        </AgeGate>
        <CookieConsent />
      </body>
    </html>
  );
}
