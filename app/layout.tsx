import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Axion Gadgets | Phones & Laptops in Nigeria",
    template: "%s | Axion Gadgets",
  },
  description:
    "Buy original iPhones, Samsung phones, MacBooks and laptops in Nigeria. 7-day warranty and delivery nationwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}