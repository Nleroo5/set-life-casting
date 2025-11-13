import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Set Life Casting | Atlanta Extras Casting Company",
  description:
    "Atlanta's premier extras casting company specializing in background talent for film, TV, commercials, and music videos across Georgia and the Southeast.",
  keywords: [
    "extras casting atlanta",
    "casting companies atlanta",
    "background casting atlanta",
    "atlanta casting companies extras",
    "film extras atlanta",
    "tv background actors",
  ],
  openGraph: {
    title: "Set Life Casting | Atlanta Extras Casting Company",
    description:
      "Atlanta's premier extras casting company specializing in background talent for film, TV, commercials, and music videos.",
    url: "https://www.setlifecasting.com",
    siteName: "Set Life Casting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Set Life Casting | Atlanta Extras Casting Company",
    description:
      "Atlanta's premier extras casting company specializing in background talent.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
