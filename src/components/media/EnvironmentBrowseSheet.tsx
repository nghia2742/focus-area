"use client";

import { useMemo, useState } from "react";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";
import { ENVIRONMENTS } from "@/data/environments";
import { EnvironmentThumb } from "@/components/media/EnvironmentThumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EnvironmentBrowseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onChange: (id: string) => void;
}

/**
 * Bottom sheet for browsing and picking an environment. Selecting a card
 * closes the sheet immediately. Music and background always come as a pair,
 * so a card represents both at once.
 */
export function EnvironmentBrowseSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: EnvironmentBrowseSheetProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(
      ENVIRONMENTS.map((e) => e.category).filter(Boolean) as string[],
    );
    return [...set];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENVIRONMENTS.filter((env) => {
      if (category !== "all" && env.category !== category) return false;
      if (q && !env.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category]);

  const select = (id: string) => {
    onChange(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bottom-0 top-auto left-1/2 flex max-h-[80dvh] w-full flex-col -translate-x-1/2 translate-y-0 overflow-hidden rounded-t-3xl rounded-b-none bg-[rgba(18,14,12,0.92)] p-0 text-white ring-white/10 backdrop-blur-2xl sm:max-w-3xl data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-12 data-open:duration-300 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-12"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <XIcon />
        </Button>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-5 pt-3 pb-6">
          <div
            className="mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-full bg-white/20"
            aria-hidden
          />
          <DialogHeader className="mb-4 shrink-0 px-1">
            <DialogTitle className="text-white">Choose your environment</DialogTitle>
          </DialogHeader>

          <div className="relative mb-4 shrink-0">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              aria-label="Search environments"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search environments..."
              className="h-11 w-full rounded-full border border-white/12 bg-white/6 pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-accent-orange focus-visible:ring-3 focus-visible:ring-accent-orange/30"
            />
          </div>

          <div className="mb-4 flex shrink-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </Chip>
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto sm:grid-cols-3">
            {filtered.map((env) => {
              const selected = value === env.id;
              return (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => select(env.id)}
                  aria-pressed={selected}
                  aria-label={`${env.name} — ${env.description}`}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 text-left outline-none transition-transform duration-150 focus-visible:border-accent-orange",
                    selected
                      ? "border-accent-orange"
                      : "border-transparent hover:-translate-y-0.5",
                  )}
                >
                  <EnvironmentThumb env={env} className="aspect-[1/0.85] w-full" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-3 pt-10">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-white">
                        {env.name}
                      </span>
                      <span className="truncate text-xs text-white/68">
                        {env.description}
                      </span>
                    </span>
                    {selected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-orange text-accent-orange-foreground">
                        <CheckIcon className="size-3" />
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-white/60">
                No environments match &quot;{query}&quot;.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-orange/40",
        active
          ? "border-accent-orange bg-accent-orange/15 text-accent-orange"
          : "border-white/12 bg-white/6 text-white/68 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
