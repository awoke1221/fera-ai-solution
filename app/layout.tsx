import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Unbounded } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--body-font" });
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--display-font",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--mono-font",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://feraisolutions.com"),
  title: {
    default: "Fera AI Solutions — Intelligent Software Engineering",
    template: "%s | Fera AI Solutions",
  },
  description:
    "Fera AI Solutions designs and delivers advanced software platforms, AI-powered products, AI agents, web applications, enterprise systems, ERP solutions, LMS platforms, and custom digital products.",
  keywords: [
    "AI solutions",
    "software development",
    "AI agents",
    "Next.js development",
    "ERP systems",
    "LMS platforms",
    "blockchain solutions",
    "custom software",
    "web applications",
    "digital transformation",
  ],
  authors: [{ name: "Fera AI Solutions" }],
  creator: "Fera AI Solutions",
  openGraph: {
    title: "Fera AI Solutions — Intelligent Software Engineering",
    description:
      "We design and ship cutting-edge software powered by AI for teams that need speed, clarity and production-ready execution.",
    url: "https://feraisolutions.com",
    siteName: "Fera AI Solutions",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fera AI Solutions — Intelligent Software Engineering",
    description:
      "AI-powered software studio building modern products for ambitious teams.",
  },
  alternates: {
    canonical: "https://feraisolutions.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${unbounded.variable} ${jetBrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
