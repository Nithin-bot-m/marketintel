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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://nfx3.com"
  ),
  title: "NFX3 (NFX³) — Decode The Market | Real-Time Forex & Gold Bullion Intelligence",
  description:
    "Official NFX3 (NFX³) Platform — Institutional real-time intelligence for global forex and gold bullion markets. Live XAU/USD 1-minute ambient candlestick telemetry, ForexFactory economic calendar, CFTC COT speculative flows, and central bank macro tracking.",
  keywords: [
    "NFX3",
    "NFX³",
    "NFX 3",
    "nfx3.com",
    "NFX3 Forex",
    "NFX3 Market",
    "NFX3 Gold",
    "NFX3 Bullion",
    "NFX3 Trading",
    "NFX3 Intelligence",
    "NFX3 Decode The Market",
    "Decode The Market",
    "XAUUSD",
    "Gold Spot",
    "ForexFactory Calendar",
    "CFTC COT positioning",
    "Central Bank rates",
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "DXY Dollar Index",
  ],
  authors: [{ name: "NFX3", url: "https://nfx3.com" }],
  creator: "NFX3",
  publisher: "NFX3",
  applicationName: "NFX3",
  alternates: {
    canonical: "https://nfx3.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "NFX3 (NFX³) — Decode The Market | Real-Time Forex & Gold Bullion Intelligence",
    description:
      "Official NFX3 (NFX³) Platform — Institutional real-time global forex and bullion market intelligence 24/5. Live XAU/USD 1m telemetry, ForexFactory economic calendar, and CFTC COT flows.",
    url: "https://nfx3.com",
    siteName: "NFX3",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NFX3 (NFX³) — Decode The Market | Global Forex & Bullion Intelligence",
        type: "image/jpeg",
      },
      {
        url: "/nfx-logo.png",
        width: 800,
        height: 800,
        alt: "NFX3 (NFX³) Brand Mark",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NFX3 (NFX³) — Decode The Market | Real-Time Forex & Gold Bullion Intelligence",
    description:
      "Official NFX3 (NFX³) Platform — Institutional real-time global forex & bullion market intelligence 24/5.",
    images: ["/og-image.jpg"],
    creator: "@nfx3market",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://nfx3.com/#organization",
      "name": "NFX3",
      "alternateName": ["NFX³", "NFX 3", "NFX3 Market Intel", "NFX3 Decode The Market"],
      "url": "https://nfx3.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nfx3.com/nfx-logo.png",
        "caption": "NFX3 Official Logo"
      },
      "description": "NFX3 is an institutional-grade, real-time market intelligence platform covering global foreign exchange (Forex) and gold bullion (XAU/USD) markets."
    },
    {
      "@type": "WebSite",
      "@id": "https://nfx3.com/#website",
      "url": "https://nfx3.com",
      "name": "NFX3",
      "alternateName": ["NFX3 (NFX³)", "NFX3 — Decode The Market"],
      "publisher": {
        "@id": "https://nfx3.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://nfx3.com/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": ["WebApplication", "FinancialService"],
      "@id": "https://nfx3.com/#platform",
      "name": "NFX3 Real-Time Forex & Bullion Intelligence",
      "url": "https://nfx3.com",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "featureList": [
        "Live 1-Minute XAU/USD Ambient Candlestick Telemetry",
        "Real-Time Interbank Spot Bullion Quotes & Spreads",
        "ForexFactory High-Impact Economic Calendar",
        "CFTC Commitments of Traders (COT) Speculative Flows",
        "Central Bank Interest Rate Radar & Macro Briefs",
        "24/5 Streaming Foreign Exchange Ticker Tape"
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://nfx3.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is NFX3 (NFX³) and who is it designed for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "NFX3 (also styled as NFX³ or NFX 3) is an institutional-grade, real-time market intelligence platform built for global foreign exchange (Forex) and gold bullion (XAU/USD) traders, analysts, and institutional macro researchers. NFX3 aggregates verified tier-1 macroeconomic data—including central bank policies (Federal Reserve, ECB, BoE, BoJ), ForexFactory high-impact calendar releases, CFTC Commitments of Traders (COT) institutional positioning, and live interbank quotes—delivered in a streamlined, zero-noise terminal experience."
          }
        },
        {
          "@type": "Question",
          "name": "How does NFX3 provide live XAU/USD gold bullion telemetry?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "NFX3 connects directly to institutional interbank feeds via OANDA to provide sub-second spot gold (XAU/USD) price quotes. The hero terminal features a live 1-minute ambient candlestick chart, volume histogram, session percentage movements, and mathematically locked BID/ASK quotes with a tight $0.60 USD interbank spread, updating seamlessly during all global trading sessions 24 hours a day, 5 days a week."
          }
        },
        {
          "@type": "Question",
          "name": "How does NFX3 integrate the ForexFactory economic calendar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "NFX3 continuously ingests economic calendar events directly from ForexFactory. Releases are dynamically categorized into High Impact (Red Folder), Medium Impact, and Low Impact tiers, complete with previous values, market consensus forecasts, actual reported numbers, and real-time countdown clocks synced to UTC/GMT session hours."
          }
        },
        {
          "@type": "Question",
          "name": "What are CFTC COT positioning flows on NFX3?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "NFX3 decodes the weekly Commitments of Traders (COT) reports published by the US Commodity Futures Trading Commission (CFTC). We track speculative non-commercial net positioning versus commercial hedgers across Gold (XAU) and all G10 currency futures (EUR, GBP, JPY, CAD, CHF, AUD, NZD) alongside IMF COFER global central bank reserve distributions to highlight institutional smart money biases."
          }
        },
        {
          "@type": "Question",
          "name": "Does NFX3 provide trading signals, buy/sell calls, or financial advice?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Strictly NO. NFX3 is 100% educational and informational. We generate 0 buy/sell calls, zero signal alerts, and zero financial advice. Our platform is dedicated to transparency, institutional macroeconomic research, and objective market data analysis, empowering traders to make their own informed decisions."
          }
        },
        {
          "@type": "Question",
          "name": "Is NFX3 free to use and what are the market hours?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, NFX3 is open and free to access for all global market participants. The platform operates 24/5, aligning with international financial centers: Sydney, Tokyo, London, and New York sessions, with automatic market status indicators showing open, pre-open, overlap, or weekend periods."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden max-w-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('marketintel_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch(e){}
            `,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-body overflow-x-hidden max-w-full w-full`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
