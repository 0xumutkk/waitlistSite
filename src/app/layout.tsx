import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * ITC Garamond Std — Narrow family, the exact display face from the Figma design.
 * We map CSS weights to the Narrow cuts so `font-weight: 300/400/700` all stay
 * within the Narrow width: 300 → Light, 400 → Book, 700 → Bold.
 */
const itcGaramond = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "../../public/fonts/ITCGaramondStd-LtNarrow.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/ITCGaramondStd-LtNarrowIta.ttf", weight: "300", style: "italic" },
    { path: "../../public/fonts/ITCGaramondStd-BkNarrow.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/ITCGaramondStd-BkNarrowIta.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/ITCGaramondStd-BdNarrow.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/ITCGaramondStd-BdNarrowIta.ttf", weight: "700", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: "Perminal — Trade What Happens. Together.",
  description:
    "Perminal is the social prediction market. Trade politics, crypto, and world events. Follow top predictors, copy their trades, and earn when people follow you.",
  openGraph: {
    title: "Perminal — Trade What Happens. Together.",
    description:
      "The social prediction market. Trade politics, crypto, and world events — together.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${itcGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--page-bg)] text-[var(--ink)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
