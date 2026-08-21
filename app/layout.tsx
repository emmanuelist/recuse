import type { Metadata } from "next";
import { Spectral, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const doc = Spectral({
  variable: "--font-doc-src",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const ui = IBM_Plex_Sans({
  variable: "--font-ui-src",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const data = IBM_Plex_Mono({
  variable: "--font-data-src",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recuse",
  description:
    "An agent may draft and prove. It may never authorize.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${doc.variable} ${ui.variable} ${data.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
