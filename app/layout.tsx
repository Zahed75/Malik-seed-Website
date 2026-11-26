import type { Metadata, Viewport } from "next";
import { Inter_Tight, Inter, Anton, Stack_Sans_Notch } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { homepageApi, settingsApi } from "@/lib/api";
import LenisProvider from "@/components/LenisProvider";
import "lenis/dist/lenis.css";
import Script from "next/script";
import InitialLoader from "@/components/InitialLoader";
import { getSiteUrl } from "@/lib/site-url";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: ["400"],
});

const stackSansNotch = Stack_Sans_Notch({
  subsets: ["latin"],
  variable: "--font-stack-sans-notch",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#1b4d32",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await settingsApi.getSettings({ revalidate: 15, tags: ["settings"] });
  const title = settings.siteName || "Malik Seeds";
  const tagLine = settings.siteTagline;
  const siteUrl = getSiteUrl();

  // Cap the title length dynamically to stay in the 60-character sweet spot
  let fullTitle = tagLine ? `${title} - ${tagLine}` : title;
  if (fullTitle.length > 60) {
    const maxTagLineLength = 60 - title.length - 3; // -3 for " - "
    if (maxTagLineLength > 5) {
      fullTitle = `${title} - ${tagLine.slice(0, maxTagLineLength - 3)}...`;
    } else {
      fullTitle = title.slice(0, 60);
    }
  }

  let description = settings.siteDescription || "";
  const optimalMax = 160;
  if (description.length > optimalMax) {
    description = description.slice(0, optimalMax - 3) + "...";
  }

  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description: description,
    verification: settings.googleSearchConsoleVerification
      ? { google: settings.googleSearchConsoleVerification }
      : undefined,
    manifest: "/favicons/site.webmanifest",
    icons: {
      icon: [
        {
          url: settings.logoUrl || "/favicons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/favicons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/favicons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      shortcut: "/favicons/favicon.ico",
    },
    openGraph: {
      title: fullTitle,
      description: description,
      url: siteUrl,
      siteName: title,
      images: [
        {
          url: settings.logoUrl || `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const BRAND_ROUTES = [
    "/our-brands/vegetable-seeds",
    "/our-brands/potato-seeds",
    "/our-brands/maliks-farm",
    "/our-brands/origene",
    "/our-brands/maliks-flower",
    "/our-brands/innovation-development",
  ];

  let brands: { name: string; description: string; href: string }[] = [];
  try {
    const data = await homepageApi.getServices({ revalidate: 15, tags: ["services"] });
    if (data && data.length > 0) {
      brands = data.map((s, idx) => ({
        name: s.title,
        description: s.description,
        href: BRAND_ROUTES[idx] || "/our-brands",
      }));
    }
  } catch (err) {
    console.error("Failed to fetch navbar brands on server:", err);
  }

  let settings = null;
  try {
    settings = await settingsApi.getSettings({ revalidate: 15, tags: ["settings"] });
  } catch (err) {
    console.error("Failed to load settings in RootLayout:", err);
  }

  return (
    <html
      lang="en"
      className={`${interTight.variable} ${inter.variable} ${anton.variable} ${stackSansNotch.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="facebook-domain-verification"
          content="4g7imh68l85o71tnv5vpxxueg0mmwz"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('hasSeenPremiumLoader')){document.documentElement.classList.add('has-seen-loader');}}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {settings?.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
        <LenisProvider>
          <InitialLoader />
          <Navbar brands={brands} />
          <main className="relative flex-grow">{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
