import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://niche-seo-analyzer.vercel.app"),
  title: "Niche SEO Analyzer Pro",
  description: "AI-Powered SEO & Authority Audit - Unlock deep insights and dominate your niche.",
  openGraph: {
    title: "Niche SEO Analyzer Pro",
    description: "AI-Powered SEO & Authority Audit",
    url: "https://niche-seo-analyzer.vercel.app", // Placeholder, will be overridden by dynamic metadata
    siteName: "Niche SEO Analyzer Pro",
    images: [
      {
        url: "/og-image.png", // Make sure this exists or user adds it
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niche SEO Analyzer Pro",
    description: "AI-Powered SEO & Authority Audit",
    images: ["/og-image.png"],
  },
  // Pinterest Domain Verification placeholder
  // other: {
  //   "p:domain_verify": "YOUR_PINTEREST_CODE_HERE",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
