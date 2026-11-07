<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Focus — Agent Guide

A single-page focus timer web app: choose a task + atmosphere, start a session, disappear into an immersive timer screen, then come back and review your focus history. **One thing. Right now.**

The original product spec lives in `focus-web-app-mvp-spec.md`. Detailed docs on what is currently implemented live in `docs/` (start with `docs/README.md`).

## Ponytail mode — on for every code edit (non-negotiable)

Load the `ponytail` skill (`.agents/skills/ponytail/SKILL.md`) before **every** change to source, config, scripts, tests or docs: the smallest complete solution, no speculative features, and a short "what I skipped / risk" note at the end. Default level `full`; `lite`/`ultra` only when the user asks.

Ponytail sets scope and size — it never overrides the UI rules, timer/hydration rules, persistence rules or the verification workflow below. Off only when the user explicitly says "stop ponytail" or "normal mode".

## UI rules — shadcn first, tokens only (non-negotiable)

The design system is `components.json` (style `radix-nova`, baseColor `neutral`, icon library `lucide`) plus the tokens in `src/app/globals.css`. Do not build a parallel style layer: no bespoke buttons, inputs, cards, dialogs, chips, empty states or spinners.

**1. Look before you write.** Installed primitives live in `src/components/ui/`: `badge`, `button`, `button-group`, `card`, `chart`, `dialog`, `empty`, `field`, `input`, `label`, `separator`, `sheet`, `skeleton`, `slider`, `sonner`, `switch`, `toggle-group`, `toggle`, `tooltip`. Read the actual file before using it — this style is `radix-nova` (radix-ui + `asChild`), and the API differs from older shadcn docs (`FieldGroup`/`Field`/`FieldLabel`, `ToggleGroup`, `CardAction`, `Button size="icon-sm"`, icons via `data-icon`).

**2. Compose, don't reinvent.**

- Actions → `Button` (`default|outline|secondary|ghost|destructive|link`, `xs|sm|default|lg|icon*`). There is no `isLoading` prop — use `disabled` + a spinner icon.
- Form layout → `FieldGroup` + `Field` + `FieldLabel`/`FieldDescription`/`FieldError`; validation state via `aria-invalid` on the control (styled by `input`/`button`/`switch`/`toggle`). This `radix-nova` build does not ship `data-invalid` Field selectors — verify `field.tsx` before assuming a state hook exists.
- 2–7 exclusive options → `ToggleGroup`; never a loop of `Button`s with hand-managed active state.
- Containers → `Card` with full composition (`CardHeader`/`CardTitle`/`CardDescription`/`CardAction`/`CardContent`/`CardFooter`), not one `CardContent` blob.
- Loading → `Skeleton`; empty state → `Empty` + its parts; divider → `Separator` (not `<hr>` or `border-t`); chip/label → `Badge`; overlay → `Dialog` (always with `DialogTitle`, `sr-only` if invisible); toast → `toast()` from `sonner`.
- Missing primitive (`tabs`, `select`, `alert`, `progress`, `scroll-area`, `dropdown-menu`, …)? Add it from the registry — never hand-roll a `div` version.

**3. Color is semantic tokens only.** Use `bg-background|card|popover|primary|secondary|muted|accent|destructive` and their `*-foreground` pairs, `border-border`/`border-input`, `ring-ring`, `chart-1..5`, `sidebar-*`, with `/opacity` modifiers where needed.

- Forbidden in feature code: raw palette (`bg-white`, `text-black`, `bg-zinc-900`, `text-emerald-600`, `border-slate-700`), arbitrary values (`bg-[#…]`, `text-[oklch(…)]`), and manual `dark:` color overrides.
- Need a new color? Add `--token` to `:root` **and** `.dark`, then expose `--color-token` in the `@theme inline` block. Never inline the value at the call site.
- The only raw-color zone is the immersive artwork layer, and it is already packaged as utilities in `globals.css`: `artwork-surface`, `scrim`, `ember-glow`, `noise`, `font-tabular`, plus the fixed `artwork-*` tokens (`text-artwork-ink`, `text-artwork-ink-muted`, `border-artwork-line`, `bg-artwork-veil`). Use them by name; don't copy their raw `white/10` / `bg-black/35` values into new components. Chrome over the artwork uses `artwork-*` tokens so it does not flip with the light/dark theme.
- Known debt: `src/components/ui/*` primitives are vendored baseline shared by every screen — edit only as a last resort (see rule 5). The bespoke pieces are gone: the setup form is a shadcn `Sheet`, the Focus CTA is a shadcn `Button`, dialog chrome uses default `Dialog` tokens, and history charts use the shadcn `chart` primitives.

**4. `className` is for layout, not restyling.** Spacing via `flex gap-*` (never `space-x-*`/`space-y-*`), equal dimensions via `size-*`, clipping via `truncate`, conditional classes via `cn()`.

- Don't re-specify what the component already owns (height, padding, radius, font size, icon size). Reach for a `variant`/`size` prop first; if nothing fits, add a variant to the component's `cva`, not an override at the call site.
- Icons are `lucide-react` components; inside `Button` pass `data-icon="inline-start|inline-end"` and no `size-4`/`w-4 h-4`.
- No manual `z-*` on overlays — `Dialog`/`Tooltip` handle stacking.
- Custom CSS belongs in `globals.css` as an `@utility` (Tailwind v4), never a `<style>` block or CSS module.

**5. Editing `src/components/ui/*` is a last resort.** Those files are vendored baseline shared by every screen. Prefer wrapping/composing inside a feature component. If you must edit, keep it generic and minimal (new variant, a11y fix) and mention it in the commit message, because `npx shadcn@latest add <x> --diff` surfaces drift later. Never run `--overwrite` on a primitive without explicit approval.

**6. Query the shadcn MCP instead of guessing.** The `shadcn` MCP server is connected via the project-scoped `opencode.json` (keep it); its tools are `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`. Workflow for any new UI:

1. Check `src/components/ui/` (or `get_project_registries` + `list_items_in_registries`).
2. `search_items_in_registries` to see whether the registry already ships what you need.
3. `view_items_in_registries(["@shadcn/button"])` / `get_item_examples_from_registries("button demo")` for the canonical API and composition.
4. `npx shadcn@latest add <item>` — then **read the added files**, fix composition, imports and icon library (community registries often use wrong aliases).
5. `get_audit_checklist` before calling the task done.

CLI equivalents if MCP is down: `npx shadcn@latest search @shadcn -q "<x>"`, `view`, `docs`, `add`. Only `@shadcn` is configured — ask before pulling in another registry (and never guess one on the user's behalf).

**7. Review gate.** Grep the diff for `space-x-`/`space-y-`, raw palette classes, `w-N h-N` pairs, `dark:bg-`/`dark:text-`, `<hr`, `animate-pulse`, and hex/`oklch()` literals outside `globals.css`. Then screenshot light + dark and a mobile width with Playwright.

## Commands

```bash
npm run dev      # dev server (Turbopack), http://localhost:3000
npm run lint     # eslint (config via eslint-config-next)
npm run build    # production build (also regenerates .next/types)
npm run start    # serve the production build
npx tsc --noEmit # typecheck (needs .next/types to exist — run dev/build once first)
```

## Stack

- Next.js 16.4.x (App Router), React 19, TypeScript 5, Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` in `src/app/globals.css`).
- State: zustand 5 with `persist` (localStorage) — one store per domain.
- Styling: **shadcn/ui** — style `radix-nova`, primitives vendored in `src/components/ui/` (built on `radix-ui`), design tokens in `src/app/globals.css`, `lucide-react` icons, `sonner` toasts, `next-themes` for theming. Follow [UI rules](#ui-rules--shadcn-first-tokens-only-non-negotiable) for every UI change.
- MCP servers: `playwright` (`browser_*` — browser verification) and `shadcn` (`shadcn_*` — registry search, component docs/examples, add commands). Use the shadcn tools instead of guessing component APIs.

## Architecture in one screen

```
src/app/layout.tsx        html/body shell + Providers (next-themes, ThemeSync, Toaster)
src/app/page.tsx          the ONLY route: <HomeView/>  (no /focus /history /settings routes)
src/components/home/HomeView.tsx   <MainBackground/> + ZenFade(<SiteHeader/>) + (session ? <FocusTimer/> : <SetupLayer/>) + SessionComplete dialog
src/components/home/SetupLayer.tsx   idle chrome: FocusCta → FocusSetupSheet (setup form), IdleCenterContent, ZenFade
src/components/focus/FocusTimer.tsx  immersive timer screen (timer, controls, dialogs)
src/components/focus/FocusSetupSheet.tsx  the setup sheet (task, mode, duration, start; no environment picker)
src/components/timer/TimerDisplay.tsx  the ticking render (useNow + useFocusTimer)
src/components/layout/SiteHeader.tsx   header: icon ButtonGroup (History, Settings, Zen Mode) → dialogs
src/components/history/*   HistoryDialog: FocusStats, WeekChart, SessionList, SessionItem
src/components/settings/SettingsDialog.tsx
src/components/media/*     MainBackground (full-bleed artwork layer)
src/store/                 focusStore (active session), settingsStore, historyStore
src/lib/timer/timer.ts     pure timestamp-based timer engine (no React/DOM)
src/lib/audio/musicPlayer.ts   module-singleton audio controller
src/data/environments.ts   environment pairs (music + background always travel together)
```

History and Settings are **dialogs**, not routes. The focus session renders on `/` when active; `SetupLayer` is shown otherwise.

## Conventions & rules

- **Timer is timestamp-derived, never a counter.** All elapsed values come from `ActiveSession` timestamps (`startedAt`, `pausedAt`, `totalPausedDuration`, `overtimeSince`) computed by the pure engine in `src/lib/timer/timer.ts`. Never introduce `setInterval(() => seconds++, 1000)`.
- **Keep the ticking render isolated.** `useNow(500)` + `useFocusTimer` are consumed only by `TimerDisplay`, `FocusTimer` and `TargetReached`, so the rest of the app never re-renders every tick.
- **Gate on hydration.** Every zustand store exposes a `hydrated` flag set in `onRehydrateStorage`. Components that render persisted state must gate on it (show `Skeleton`) to avoid SSR/client mismatches. Do not "fix" this with effect-sync — use lazy initial state from the store after the hydration gate.
- **Music playback is currently unwired.** `musicPlayer` is a module-level singleton (outside React) and only the Settings volume slider calls it — no track is selected or played. If you reconnect it, start playback inside the Start Focus click gesture (browser autoplay rules).
- **Environments are pairs in data only.** Music and background are coupled via `src/data/environments.ts`; setup applies the remembered pair (or `quiet`) and records both ids on the session. There is no picker yet; keep any future picker paired rather than reintroducing separate music/background pickers.
- **Full-bleed layout gotcha.** `height: 100%` does NOT resolve against a parent whose height comes from `flex-grow` (it falls back to auto — this caused a real "video only fills part of the screen" bug). Use `flex-1` on the flex item and `absolute inset-0` for full-bleed layers (`MainBackground` and the focus content layer both use `absolute inset-0`).
- **Persistence.** zustand persist keys: `focus-active-session`, `focus-settings`, `focus-history`. The legacy `src/lib/storage/localStorage.ts` helpers (`getSettings`/`saveSessions`/etc.) are mostly unused — only `DEFAULT_SETTINGS` is imported from it. Do not dual-write.
- **Settings migration.** `lastMusicId`/`lastBackgroundId`/`rememberLastMusic`/`rememberLastBackground` were replaced by `rememberLastEnvironment` + `lastEnvironmentId`. Old persisted values are ignored automatically — do not add back the old keys.
- **Don't kill the MCP node processes** — they back the `playwright_browser_*` and `shadcn_*` tools. For one-off browser verification use `playwright-core` installed with `--no-save`, then remove it.

## Verification workflow

1. `npm run lint` and `npx tsc --noEmit` after any change (typecheck requires `.next/types`; run `npm run build` or `npm run dev` once first).
2. `npm run build` to confirm the single-route app compiles (`/` + `/_not-found`).
3. Browser smoke test via Playwright: setup → start → timer ticks → pause/resume → end → session shows in History; check the video background fills the full content area and the console is free of errors.
4. If the change touched UI: run the **review gate** (UI rules, step 7) — grep for banned classes, then screenshot light + dark + mobile width — and `get_audit_checklist` for any newly added shadcn component.

## Known environment quirks

- Dev-console "hydration mismatch" diffs are caused by the Grammarly browser extension adding body attributes — not an app bug.
- Deleting `.next` removes Next-generated global types (e.g. `LayoutProps`); they regenerate on the next `next build`/`next dev`. Until then `npx tsc --noEmit` fails with false errors.
