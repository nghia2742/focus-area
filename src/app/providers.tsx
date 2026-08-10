"use client";

import { useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useSettingsStore } from "@/store/settingsStore";

function ThemeSync() {
  const { setTheme } = useTheme();
  const hydrated = useSettingsStore((s) => s.hydrated);
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    if (hydrated) setTheme(theme);
  }, [hydrated, theme, setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeSync />
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
