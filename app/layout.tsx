import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://axiongadgets.vercel.app"
  ),

  title: {
    default: "Buy Original Phones & Laptops in Nigeria | Axion Gadgets",
    template: "%s | Axion Gadgets",
  },

  description:
    "Shop original iPhones, Samsung phones, MacBooks and laptops at Axion Gadgets. Enjoy tested devices, a 7-day warranty, secure payments and delivery across Nigeria. Pickup available in Ikeja, Lagos.",

  applicationName: "Axion Gadgets",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "Axion Gadgets",
    title: "Buy Original Phones & Laptops in Nigeria | Axion Gadgets",
    description:
      "Shop iPhones, Samsung phones, MacBooks and laptops. Tested devices, 7-day warranty and delivery across Nigeria.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Axion Gadgets | Original Phones & Laptops in Nigeria",
    description:
      "Shop original phones, laptops and gadgets with a 7-day warranty and delivery across Nigeria.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
