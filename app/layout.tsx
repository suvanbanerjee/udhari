"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useAppStore } from "./store/useStore";
import BackButtonHandler from "./components/BackButtonHandler";
import FloatingBubble from "./components/FloatingBubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata needs to be in a separate file in client components
const metadata = {
  title: "Udhari - Fun Money Tracker",
  description: "Track money moves between friends, the fun way!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useAppStore();
  
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased theme-${theme} bg-background text-foreground relative pt-6`}
      >
        <main className="pb-20 relative">
          <BackButtonHandler />
          {children}
          <FloatingBubble />
        </main>
      </body>
    </html>
  );
}
