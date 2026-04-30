import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const garamond = localFont({
  src: "../../public/fonts/ITC Garamond Std Light Narrow.otf",
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "Perminal - Trade What Happens. Together.",
  description:
    "The social prediction market on Hyperliquid. Follow the best, copy in one tap, get paid on every call.",
  twitter: {
    card: "summary_large_image",
    site: "@useperminal",
    title: "Perminal - Trade What Happens. Together.",
    description:
      "The social prediction market on Hyperliquid. Follow the best, copy in one tap, get paid on every call.",
  },
  openGraph: {
    type: "website",
    title: "Perminal - Trade What Happens. Together.",
    description:
      "The social prediction market on Hyperliquid. Follow the best, copy in one tap, get paid on every call.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${garamond.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
