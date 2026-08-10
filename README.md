# Focus — one thing, right now

A calm, immersive web app for deep work. Pick a task and an atmosphere, start a session, disappear into a full-screen timer with ambient music and a looping video background, then come back and review your focus history.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
npx tsc --noEmit # typecheck (requires .next/types; run dev/build once first)
```

## Features

- **Single-page app** — the focus screen renders on `/` while a session is active; History and Settings are dialogs.
- **Two timer modes** — Open Focus (counts up) and Target Focus (counts down from 25 / 50 / 90 / custom minutes).
- **Timestamp-derived timer** — pause time is excluded and the timer survives refresh, sleep, and background tabs.
- **Environments** — music and background always travel as a pair (e.g. *Late Night Study* = ambient track + cat-studying video).
- **Focus history & stats** — today/yesterday/week totals, average, longest, a 7-day chart, and a grouped session list.
- **Fully local** — settings, history, and active sessions persist in `localStorage`. No accounts, no backend.

## Documentation

- `docs/` — implemented features, core logic, and architecture (`docs/README.md` is the index).
- `focus-web-app-mvp-spec.md` — the original product & technical specification.
- `AGENTS.md` — project guide for AI agents (commands, conventions, gotchas).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · zustand (persist) · radix-ui · shadcn-style UI · lucide-react · sonner · next-themes.
