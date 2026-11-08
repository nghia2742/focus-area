# Features

Everything described here is implemented and lives on the single `/` route. History and Settings are dialogs, not pages.

## 1. Idle screen (`SetupLayer`, `SiteHeader`)

The app always sits on a full-bleed room artwork; the setup chrome floats over it.

- **Artwork** — `MainBackground` loops `public/backgrounds/270507_small.mp4` (muted, `object-cover`) behind a fixed warm `scrim` and a subtle `noise` layer. On `prefers-reduced-motion` the video is paused (the current frame remains visible). A second fixed `noise` overlay in `layout.tsx` adds grain above the whole UI, including dialogs.
- **Focus CTA** — primary pill labelled *Start focus* with a play icon, fixed bottom-center (`aria-label="Start a focus session"`; `size="xl"` for a 44px tap target). Opens the setup sheet; focus returns to the CTA when the sheet closes. A `Kbd` shortcut legend sits above it from `sm` up.
- **Zen Mode** — a ghost icon toggle (eye / eye-off, with a hover tooltip) in the header's top-right button group. Fades the header and CTA to `0.25` opacity. Faded chrome stays interactive so Zen can be turned off again, and a hidden `aria-live` region announces the new state. Ephemeral — not persisted.
- **Header** — transparent, floating: logo on the left; on the right a `ButtonGroup` of icon buttons (History, Settings, Zen Mode), each labelled by a hover tooltip that shows its `Kbd` key. History and Settings open dialogs.
- **Keyboard shortcuts** — `F` opens the setup sheet (idle screen only), `S` opens Settings, `H` opens History, `Z` toggles Zen Mode. Single keys are ignored when a modifier is held, when focus is in an input/textarea/contenteditable, on key repeat, and while any dialog or sheet is open.

## 2. Setup sheet (`FocusSetupSheet`)

A shadcn `Sheet` (`side="bottom"`) opened by the Focus CTA.

- **Task (optional)** — free-text input, attached to the session. Empty → `Focus Session`.
- **Mode** — toggle: *Open Focus* (counts up) or *Target Focus* (counts down).
- **Duration** (Target only) — presets `25 / 50 / 90` or **Custom** (1–600 minutes, numeric input). Invalid custom values show an inline `FieldError` and block Start; `Enter` in the custom field starts the session. The sheet mounts fresh on each open, prefilled from saved settings (mode, duration, finish message); the task field starts empty and is auto-focused.
- **Finish message** (Target only) — optional custom body for the finish notification, capped at 100 characters (live counter). Prefilled from `settings.completionMessage`; a small bell button beside it previews the notification, asks for permission on first use, and reports the result with a toast (sent / blocked / unsupported / not granted).
- **No environment picker.** Start silently applies `settings.lastEnvironmentId` when *Remember last environment* is on, otherwise the first environment (`quiet`). The resulting `musicId` / `backgroundId` pair is recorded on the session.
- **Start Focus** — creates the session, saves `completionMessage` (Target only) and `lastEnvironmentId` (when remembering), requests notification permission (in both modes), and closes the sheet. It does **not** start audio playback.
- The form mounts with persisted settings as initial state (`useState` lazy initializers) and is gated on settings hydration (`Skeleton` while waiting).

## 3. Focus timer (`FocusTimer`)

Rendered inline on `/` while a session is active — the room artwork stays behind it, and the header remains. There is no navigation and no music/volume UI.

- Optional task name above the timer (single line, truncated); `TimerDisplay` is the dominant element.
- **Timer display** — Target counts down `MM:SS` (`H:MM:SS` past an hour, with a thin circular progress ring); Open counts up `HH:MM:SS`. Overtime shows the frozen target above a running `+MM:SS` readout. All values are timestamp-derived.
- **Pause / Resume** and **End Session** controls (both hidden at `target_reached`, where the Target reached dialog replaces them). A `Kbd`-styled `Space to pause or resume` hint is shown from `sm` up.
- **Keyboard shortcut** — `Space` / `K` toggles pause/resume, ignored while the end-confirm or restore dialog is open and while typing in an input, textarea or contenteditable.
- **End confirm dialog** — shows elapsed time with *Keep Focusing* / *End Session*.
- **Target reached dialog** — at countdown zero: *Finish Session* / *Keep Focusing*. Escape counts as *Keep Focusing*; outside interaction is blocked.
- **Session complete dialog** — shown by `HomeView` after ending, with the recorded total duration; target sessions that ran into overtime also show a `target + overtime` breakdown. *Done* (Escape or outside click also dismisses).
- **Restore dialog** — when a persisted session exists that was not started in this page view (e.g. after refresh/close): *Resume Session* / *End Session*. Title is *Paused session* when the restored session is paused, otherwise *Welcome back.* The timer keeps counting while the dialog is open if the restored session was running.

## 4. Timer behavior

- Paused time is **excluded** from actual focus duration (timestamp-derived; see `docs/logic.md`).
- At zero, the session does **not** auto-end — the derived status becomes `target_reached`.
- **Keep Focusing** enters **overtime**; elapsed time keeps counting and the final record includes it.
- Session ends explicitly via End → confirm, Finish after target reached, or End Session from the restore dialog.
- Double start, double pause and double resume are no-ops in the engine/store.

## 5. Environments & media data

`src/data/environments.ts` defines three pairs:

| Environment | Music | Background |
| --- | --- | --- |
| `quiet` | none | none |
| `late-night-study` | Late Night Study | Cat Studying |
| `violin-velvet-study` | Violin Velvet Study | Capybara Violin |

`src/data/music.ts` and `src/data/backgrounds.ts` hold the tracks/backgrounds referenced by id. `getEnvironment` / `getMusicTrack` / `getBackground` resolve ids, and `getEnvironmentVisual` (in `backgrounds.ts`) can derive a thumbnail-or-gradient card visual.

**Current wiring is data-only:** no environment picker or per-environment renderer exists yet. `MainBackground` always shows the same room video, and `musicPlayer` is never given a track — only the Settings volume slider calls it. Sessions still record the ids, so history remains ready for a future picker.

## 6. History (`HistoryDialog`)

Opened from the header. While the history store hydrates, the dialog shows a skeleton. Empty state → "No sessions yet" with a *Start focusing* button that closes the dialog. Otherwise:

- **Stats card** — a large Today total, Yesterday as its subtitle, then This week, Sessions (count), Average, Longest (all seconds-derived compact durations).
- **Last 7 days chart** — shadcn `ChartContainer` stacked bar chart (Recharts) of focus seconds per day, split by mode (Open / Target / Pomodoro) with a legend, the week's total as subtitle, and a duration-formatted tooltip that breaks the day down by mode.
- **Session list** — newest first, with a `N total` counter, grouped by day (`Today` / `Yesterday` / weekday-date). Each row shows task name, mode badge (`Target · 50m` / `Open`), date + time, and compact duration. On `lg` screens stats/chart and the list sit in two independently scrolling columns; below that the dialog scrolls as one column.

## 7. Settings (`SettingsDialog`)

Opened from the header. Sections switch in a `ToggleGroup` tab list: at `sm` and up a vertical sidebar with icon + label, below `sm` a horizontal icon-only bar (labels stay available to screen readers).

- **Appearance** — five independent dimensions, applied immediately through `data-*` attributes on `<html>` (`globals.css` owns the tokens): Color mode (Dark / Light / System via `next-themes`), Style (8 shape/radius presets), Base color (7 neutral surface palettes), Theme (18 accent palettes for primary/ring/sidebar), Chart color (18 palettes for `chart-1..5`). Style/base/theme/chart options render token-based previews; *Reset appearance* restores the defaults.
- **General → Timer** — default mode (Open / Target). *Default target duration* appears only when the default mode is Target; it uses the shared `DurationField` (`components/shared/`) — presets `25 / 50 / 90` or an inline **Custom** input (same width as the Custom button, placeholder `1-600 minutes`, numeric, auto-focused). Empty or invalid values on blur show the label/input error state with `Enter a duration between 1 and 600 minutes.`; valid integers save on blur and typing clears the error.
- **General → Sound** — default volume slider (applied live to `musicPlayer`), and *Remember last environment* switch.
- **General → Application** — *Reset all settings* expands an inline confirmation (*Reset everything* / *Cancel*) that restores timer and sound defaults, all appearance dimensions including color mode, and the audio volume. History and the active session are untouched.

## 8. Notifications

When a Target session reaches zero, a browser `Notification` ("Focus complete") is fired if permission is granted — once per session id, best-effort, never blocking the in-app target-reached dialog. Its body is the session's custom finish message, or `You've reached your N-minute focus target.` when none was set. Permission is also requested from the Start Focus gesture in both modes. The bell button beside the setup field requests permission (when still `default`), shows a preview notification with the same body, and toasts the result (sent / blocked / unsupported / not granted).

## 9. Persistence

All local, via zustand `persist` → `localStorage`:

- `focus-active-session` — the in-progress session (restores after refresh/close). Only `session` is persisted; the transient `startedLocally` flag is deliberately not.
- `focus-settings` — the `settings` object only: `defaultMode` (`"target"`), `defaultDuration` (`50`), `musicVolume` (`0.6`), `rememberLastEnvironment` (`true`), optional `lastEnvironmentId`, and `completionMessage` (empty by default). `zenMode` is **not** persisted.
- `focus-appearance` — `style`, `baseColor`, `theme`, `chartColor` (defaults: nova, stone, orange, orange). Color mode is owned by `next-themes` and stored under its own `theme` key. A blocking script in `layout.tsx` mirrors the persisted appearance onto `<html data-*>` before first paint, so tokens never flash.
- `focus-history` — completed session records (newest first).
- Legacy keys from `src/lib/storage/localStorage.ts` (`focus:settings`, `focus:sessions`, …) are not read or written by the stores; only `DEFAULT_SETTINGS` is imported from there.

## 10. Responsive & accessibility

- Desktop-first, but every surface works on mobile. The timer scales with `clamp()` and hides its Space hint below `sm`. The setup sheet is a bottom sheet capped at `86dvh` with a scrollable body; Settings switches from a sidebar to an icon-only horizontal tab bar, its option grids go 2 → 3/4 columns, and the History dialog (max `85dvh`) stacks into one scrolling column below `lg`.
- Keyboard-navigable with visible focus rings; `aria` labels on icon buttons and icon-only tabs (via `sr-only` text); dialogs have titles; the Zen Mode state is announced in an `aria-live` region; `prefers-reduced-motion` pauses the background video and removes Zen/scrollbar transitions; tabular numerals prevent timer jitter.
- **Custom scrollbars** — thin accent-colored pills (`--primary` tinted with `color-mix`), applied globally in `globals.css`: `::-webkit-scrollbar` for Blink/WebKit, with `scrollbar-width`/`scrollbar-color` gated behind `@supports not selector(::-webkit-scrollbar)` so Firefox gets the standard path without Chromium ignoring the WebKit one.
