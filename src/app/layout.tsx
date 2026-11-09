import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { appearanceScript } from "@/lib/appearance/prehydrate";
import { DEFAULT_APPEARANCE } from "@/lib/appearance/presets";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Focus — one thing, right now",
  description:
    "A calm, immersive space for deep work. Focus timer, ambient music, and focus history.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#171410" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-style={DEFAULT_APPEARANCE.style}
      data-base-color={DEFAULT_APPEARANCE.baseColor}
      data-theme-color={DEFAULT_APPEARANCE.theme}
      data-chart-color={DEFAULT_APPEARANCE.chartColor}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden">
        {/* Applies persisted appearance tokens before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
        <Providers>{children}</Providers>
        <Analytics />
        <div
          aria-hidden
          className="noise pointer-events-none fixed inset-0 z-[60] opacity-[0.035]"
        />
      </body>
    </html>
  );
}
