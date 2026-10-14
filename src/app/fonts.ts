import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";

// Shared by the site and admin root layouts.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geist has no Devanagari glyphs, so Hindi text falls back to this face. Not
// preloaded: the browser fetches it only when a page contains Hindi text.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  preload: false,
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable}`;
