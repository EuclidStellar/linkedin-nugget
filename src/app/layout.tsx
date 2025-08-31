import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Thinking AI Post Generator",
  description: "Generate LinkedIn posts and see the AI's thinking process, powered by Gemini 2.5 Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
      </body>
    </html>
  );
}
