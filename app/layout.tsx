import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

/**
 * Geist Sans + Geist Mono. Measured against the register this product needs to
 * sit in: Linear runs Inter Variable at 64px/510/-0.022em, Vercel runs Geist at
 * 64px/400/-0.06em. Both are large, light and very tightly tracked. The earlier
 * Spectral serif read editorial rather than product-grade.
 *
 * The mono is a matched pair, not a costume - it carries document ids, envelope
 * numbers and timestamps, which are data.
 */
const sans = Geist({ subsets: ["latin"], variable: "--font-sans-src", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-src", display: "swap" });

export const metadata: Metadata = {
  title: "Recuse",
  description:
    "An agent may draft and prove. It may never authorize.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
