"use client";

import { ThemeProvider } from "next-themes";
import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AppearanceProvider>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster richColors position="top-center" />
      </AppearanceProvider>
    </ThemeProvider>
  );
}
