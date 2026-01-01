import type { Metadata } from "next";
import "./globals.css";
import AgeGate from "./components/AgeGate";
import StructuredData from "./components/StructuredData";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = generateSEOMetadata({
  title: "Agentwood - Chat with AI Characters | Character.ai Alternative",
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
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <body
        className="text-white selection:bg-purple-500 selection:text-white bg-[#0f0f0f] antialiased"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        suppressHydrationWarning
      >
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        <AgeGate>
          {children}
        </AgeGate>
      </body>
    </html>
  );
}
