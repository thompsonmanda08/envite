import type { Metadata } from "next";

import { Fraunces, Manrope } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Providers from "./providers";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const brand = localFont({
  src: [
    {
      path: "fonts/tender-veronica/TenderVeronica.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "fonts/tender-veronica/TenderVeronicaBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tender-veronica-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${brand.variable}`}
      lang="en"
    >
      <head>
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_HOST ?? ""}
        />
        <link
          rel="preconnect"
          href="https://ik.imagekit.io"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <meta content="e-nvite" name="apple-mobile-web-app-title" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="theme-color"
          content="#fafafa"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0e0e0e"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className="min-h-screen overflow-x-clip antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: "e-nvite — Elegant Digital Invitations",
    template: "%s | e-nvite",
  },
  description:
    "Design beautiful invitations, manage guest lists, and track RSVPs—all in one seamless platform. Perfect for weddings, corporate events, and special occasions.",
  keywords: [
    "digital invitations",
    "e-invites",
    "event planning",
    "wedding invitations",
    "corporate events",
    "online RSVP",
    "guest management",
    "elegant invitations",
  ],
  authors: [{ name: "e-nvite", url: "https://e-nvite.com" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://e-nvite.com",
  ),
  alternates: {
    canonical: "/",
    languages: { "en-US": "/en-US" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "e-nvite",
    title: "e-nvite — Digital Invitations Made Beautiful",
    description:
      "Create, send, and track stunning digital invitations for any occasion",
    images: [
      {
        url: "/web-app-manifest-192x192.png",
        width: 192,
        height: 192,
        alt: "e-nvite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "e-nvite — Digital Invitations Made Beautiful",
    description:
      "Create, send, and track stunning digital invitations for any occasion",
    images: ["/web-app-manifest-192x192.png"],
    creator: "@envite_official",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "event planning",
};
