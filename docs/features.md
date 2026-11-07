# Features

Everything described here is implemented and lives on the single `/` route. History and Settings are dialogs, not pages.

## 1. Idle screen (`SetupLayer`, `IdleCenterContent`, `FocusRail`, `SiteHeader`)

The app always sits on a full-bleed room artwork; the setup chrome floats over it.

- **Artwork** — `MainBackground` loops `public/backgrounds/270507_small.mp4` (muted, `object-cover`) behind a fixed warm `scrim` and a subtle `noise` layer. On `prefers-reduced-motion` the video is paused (the first frame remains visible).
- **Focus CTA** — round primary button fixed bottom-center (`aria-label="Start a focus session"`). Opens the setup sheet; focus returns to the CTA when the sheet closes.
- **Greeting** — above the CTA: the last task name saved from setup, otherwise a time-of-day greeting (`Good morning` / `Good afternoon` / `Good evening`).
- **Zen Mode** — a single toggle pinned to the right edge. Fades the header, rail, CTA and greeting to `0.25` opacity (the greeting keeps a `0.55` base when Zen is off). Faded chrome stays interactive so Zen can be turned off again. Ephemeral — not persisted.
- **Header** — transparent, floating: logo on the left; History and Settings buttons on the right, each opening a dialog.

## 2. Setup sheet (`FocusSetupSheet`)

A shadcn `Sheet` (`side="bottom"`) opened by the Focus CTA.

- **Task (optional)** — free-text input, attached to the session. Empty → `Focus Session`. A non-empty value is saved as `lastTaskName` and shown on the idle screen next time.
- **Mode** — toggle: *Open Focus* (counts up) or *Target Focus* (counts down).
- **Duration** (Target only) — presets `25 / 50 / 90` or **Custom** (1–600 minutes, numeric input). Invalid custom values show an inline `FieldError` and block Start.
- **No environment picker.** Start silently applies `settings.lastEnvironmentId` when *Remember last environment* is on, otherwise the first environment (`quiet`). The resulting `musicId` / `backgroundId` pair is recorded on the session.
- **Start Focus** — creates the session, saves `lastTaskName` (when non-empty) and `lastEnvironmentId` (when remembering), requests notification permission, and closes the sheet. It does **not** start audio playback.
- The form mounts with persisted settings as initial state (`useState` lazy initializers) and is gated on settings hydration (`Skeleton` while waiting).

## 3. Focus timer (`FocusTimer`)

Rendered inline on `/` while a session is active — the room artwork stays behind it, and the header/rail remain. There is no navigation and no music/volume UI.

- Optional task name above the timer; `TimerDisplay` is the dominant element.
- **Timer display** — Target counts down `MM:SS` (with a thin circular progress ring); Open counts up `HH:MM:SS`. Overtime shows the frozen target plus a running `+MM:SS` chip. All values are timestamp-derived.
- **Pause / Resume** and **End Session** controls.
- **Keyboard shortcut** — `Space` / `K` toggles pause/resume, ignored while a dialog is open or while typing in an input.
- **End confirm dialog** — shows elapsed time with *Keep Focusing* / *End Session*.
- **Target reached dialog** — at countdown zero: *Finish Session* / *Keep Focusing*. Escape counts as *Keep Focusing*; outside interaction is blocked.
- **Session complete dialog** — shown by `HomeView` after ending, with *Done*.
- **Restore dialog** — when a persisted session exists that was not started in this page view (e.g. after refresh/close): *Resume Session* / *End Session*. Title is *Paused session* when the restored session is paused, otherwise *Welcome back.*

## 4. Timer behavior

- Paused time is **excluded** from actual focus duration (timestamp-derived; see `docs/logic.md`).
- At zero, the session does **not** auto-end — the derived status becomes `target_reached`.
- **Keep Focusing** enters **overtime**; elapsed time keeps counting and the final record includes it.
- Session ends explicitly via End → confirm, or Finish after target reached.
- Double start, double pause and double resume are no-ops in the engine/store.

## 5. Environments & media data

`src/data/environments.ts` defines three pairs:

| Environment | Music | Background |
| --- | --- | --- |
| `quiet` | none | none |
| `late-night-study` | Late Night Study | Cat Studying |
| `violin-velvet-study` | Violin Velvet Study | Capybara Violin |

`src/data/music.ts` and `src/data/backgrounds.ts` hold the tracks/backgrounds referenced by id. `getEnvironment` / `getMusicTrack` / `getBackground` resolve ids, and `getEnvironmentVisual` can derive a thumbnail-or-gradient card visual.

**Current wiring is data-only:** no environment picker or per-environment renderer exists yet. `MainBackground` always shows the same room video, and `musicPlayer` is never given a track — only the Settings volume slider calls it. Sessions still record the ids, so history remains ready for a future picker.

## 6. History (`HistoryDialog`)

Opened from the header. Empty state → CTA. Otherwise:

- **Stats card** — Today, Yesterday, This week, Sessions (count), Average, Longest (all seconds-derived compact durations).
- **Last 7 days chart** — shadcn `ChartContainer` bar chart (Recharts) of focus seconds per day, with a duration-formatted tooltip.
- **Session list** — grouped by day (`Today` / `Yesterday` / weekday-date), each row shows task name, mode badge (`Target · 50m` / `Open`), date + time, and compact duration.

## 7. Settings (`SettingsDialog`)

Opened from the header.

- **Appearance** — Dark / Light / System, applied immediately via `next-themes` (`ThemeSync`).
- **Timer** — default mode (Open/Target) and default target duration (presets or custom 1–600; custom saves on blur).
- **Sound** — default volume slider (applied live to `musicPlayer`), and *Remember last environment* switch.

## 8. Notifications

When a Target session reaches zero, a browser `Notification` ("Focus complete") is fired if permission is granted — once per session, best-effort, never blocking the in-app target-reached dialog.

## 9. Persistence

All local, via zustand `persist` → `localStorage`:

- `focus-active-session` — the in-progress session (restores after refresh/close). Only `session` is persisted; `startedLocally` is deliberately not.
- `focus-settings` — theme, defaults, volume, remember-environment, last environment, last task name. Zen Mode is **not** persisted.
- `focus-history` — completed session records.

## 10. Responsive & accessibility

- Desktop-first; the session UI works on mobile (controls wrap, timer scales with `clamp()`).
- Keyboard-navigable with visible focus rings; `aria` labels on icon buttons; dialogs have titles; `prefers-reduced-motion` pauses the background video and removes motion/zen transitions; tabular numerals prevent timer jitter.
