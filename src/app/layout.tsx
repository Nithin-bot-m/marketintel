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
    process.env.NEXT_PUBLIC_SITE_URL || "https://nfx3.marketintel.io"
  ),
  title: "NFX³ — Decode The Market | Global Forex & Bullion Intelligence",
  description:
    "NFX³: Institutional, real-time coverage of global foreign exchange and bullion markets — live XAU/USD 1m candlestick telemetry, ForexFactory economic calendar, CFTC COT speculative flows, central bank rate radars, and macro intelligence.",
  keywords: [
    "NFX³",
    "Decode The Market",
    "Forex",
    "XAUUSD",
    "Gold Spot",
    "ForexFactory Calendar",
    "DXY Dollar Index",
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "CFTC COT positioning",
    "Central Bank rates",
  ],
  authors: [{ name: "NFX³" }],
  openGraph: {
    title: "NFX³ — Decode The Market | Global Forex & Bullion Intelligence",
    description:
      "Institutional real-time global Forex & Bullion market intelligence — live XAU/USD 1-minute streaming telemetry, ForexFactory economic calendar, and CFTC COT flows.",
    url: "/",
    siteName: "NFX³",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NFX³ — Decode The Market | Global Forex & Bullion Intelligence",
        type: "image/jpeg",
      },
      {
        url: "/nfx-logo.png",
        width: 800,
        height: 800,
        alt: "NFX³ — Decode The Market",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NFX³ — Decode The Market | Global Forex & Bullion Intelligence",
    description: "Institutional real-time global Forex & Bullion market intelligence 24/5.",
    images: ["/og-image.jpg"],
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
    <html lang="en" className="dark overflow-x-hidden max-w-full" suppressHydrationWarning>
      <head>
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
