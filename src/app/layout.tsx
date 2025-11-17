import type { Metadata } from "next";
import { Fredoka, Outfit, Poppins, Baloo_2, Londrina_Solid, Lilita_One } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

const baloo2 = Baloo_2({
  variable: "--font-baloo2",
  subsets: ["latin"],
  display: "swap",
});

const londrinaSolid = Londrina_Solid({
  variable: "--font-londrina-solid",
  weight: ["400", "900"],
  subsets: ["latin"],
  display: "swap",
});

const lilitaOne = Lilita_One({
  variable: "--font-lilita-one",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const galindo = localFont({
  src: "../../font/Galindo-Regular.ttf",
  variable: "--font-galindo",
  display: "swap",
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
  authors: [{ name: "Drive Lead Media", url: "https://www.driveleadmedia.com" }],
  creator: "Drive Lead Media",
  publisher: "Set Life Casting LLC",
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
    creator: "@driveleadmedia",
  },
  other: {
    "designer": "Drive Lead Media",
    "developer": "Drive Lead Media",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Link to humans.txt */}
        <link rel="author" type="text/plain" href="/humans.txt" />

        {/* Structured Data for Drive Lead Media Attribution */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Set Life Casting",
              "url": "https://www.setlifecasting.com",
              "description": "Atlanta's premier extras casting company for film, TV, commercials, and music videos",
              "creator": {
                "@type": "Organization",
                "name": "Drive Lead Media",
                "url": "https://www.driveleadmedia.com",
                "description": "Digital Marketing & Web Design Agency"
              },
              "provider": {
                "@type": "Organization",
                "name": "Drive Lead Media",
                "url": "https://www.driveleadmedia.com"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Set Life Casting",
              "url": "https://www.setlifecasting.com",
              "logo": "https://firebasestorage.googleapis.com/v0/b/drive-lead-media-crm.firebasestorage.app/o/websiteQuotes%2Fquote_1760395151657_f05s8xyu2%2Flogo%2FScreen%20Shot%202024-01-27%20at%203.54.57%20PM-fotor-2024012904710.jpg?alt=media&token=be6f763a-80f6-47d1-ad5e-b2fd483b339d",
              "description": "Atlanta's premier extras casting company",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Atlanta",
                "addressRegion": "GA"
              },
              "founder": {
                "@type": "Organization",
                "name": "Drive Lead Media",
                "url": "https://www.driveleadmedia.com"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.setlifecasting.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Website Credits",
                  "item": "https://www.setlifecasting.com/credits",
                  "description": "Website designed by Drive Lead Media"
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${fredoka.variable} ${outfit.variable} ${poppins.variable} ${baloo2.variable} ${londrinaSolid.variable} ${lilitaOne.variable} ${galindo.variable} antialiased`}
      >
        {/* Website designed and developed by Drive Lead Media - https://www.driveleadmedia.com */}
        {/* Digital Marketing | Web Design | SEO Services | Atlanta, GA */}
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
