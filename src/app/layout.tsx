import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MarketIntel — Indian Market Intelligence, Decoded Daily | ISD Intelligence Network",
  description:
    "MarketIntel by ISD Info Solutions: SEBI-aware, strictly informational coverage of Indian markets — daily market wraps, IPO tracking, quarterly results, FII/DII flows and macro explainers, built on T1 official sources (NSE, BSE, SEBI, RBI, PIB).",
  keywords: [
    "MarketIntel",
    "Indian stock market",
    "NSE",
    "BSE",
    "SEBI",
    "RBI",
    "IPO tracker",
    "FII DII data",
    "market wrap",
    "ISD Info Solutions",
  ],
  authors: [{ name: "ISD Info Solutions" }],
  openGraph: {
    title: "MarketIntel — Indian Market Intelligence, Decoded Daily",
    description:
      "T1-sourced market wraps, IPO intelligence, FII/DII flows and macro explainers. A property of ISD Info Solutions.",
    siteName: "MarketIntel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketIntel — Indian Market Intelligence",
    description: "Decoding Indian markets daily. A property of ISD Info Solutions.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-body`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
