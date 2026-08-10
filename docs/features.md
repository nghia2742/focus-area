# Features

Everything described here is implemented and lives in the single `/` route. History and Settings are dialogs, not pages.

## 1. Setup form (`FocusSetup`)

Shown on `/` whenever no session is active.

- **Task (optional)** — free-text input, attached to the session. Empty → default label `Focus Session`.
- **Mode** — toggle: *Open Focus* (counts up) or *Target Focus* (counts down from a target).
- **Duration** (Target only) — presets `25 / 50 / 90` or **Custom** (1–600 minutes, numeric input). Validation rejects out-of-range values with an inline error; custom mode can't be started invalid.
- **Environment** — compact toggle pills of the available atmospheres (see [Environments](#5-environments)). Picking one sets both music and background. Hint text: *"Music and background always come as a pair."*
- **Start Focus** — creates the session, remembers the last environment if enabled, kicks off audio inside the click gesture, and best-effort requests notification permission.

The form mounts with persisted settings as initial state (`useState` lazy initializers) — it is rendered only after the settings store is hydrated (Skeleton while waiting).

## 2. Focus screen (`FocusScreen`)

The immersive timer screen shown while a session is active.

- Full-bleed background video with a dark gradient overlay; timer is the dominant element, vertically centered.
- Optional task name above the timer.
- **Timer display** — Target mode counts down (e.g. `50:00` → `00:00`); Open mode counts up in `HH:MM:SS`. Overtime shows the frozen target plus a running `+MM:SS` chip.
- **Music player pill** — play/pause, volume slider (desktop), "Change environment" button. Errors degrade to a `Music unavailable` pill with a retry button, without touching the timer.
- **Pause / Resume / End** controls.
- **Keyboard shortcuts** — `Space` / `K` toggle pause/resume (ignored while a dialog is open or when typing in an input).
- **End confirm dialog** — shows elapsed time with *Keep Focusing* / *End Session*.
- **Target reached overlay** — at countdown zero: *Finish Session* / *Keep Focusing*.
- **Session complete overlay** — shown after ending, via `HomeView`, with *Done*.
- **Restore dialog** — when a persisted session exists that wasn't started in this page view (e.g. after a refresh), offers *Resume* or *End*.

## 3. Timer behavior

- Paused time is **excluded** from actual focus duration (timestamp-derived; see `docs/logic.md`).
- At zero, the session does **not** auto-end — it enters the `target_reached` state.
- **Keep Focusing** enters **overtime**; actual duration keeps counting and the final record includes it.
- Session ends explicitly via End → confirm, or Finish after target reached.

## 4. Environments

| Environment | Music | Background |
| --- | --- | --- |
| `quiet` | none | none (default bg) |
| `late-night-study` | Late Night Study (Ambient) — `public/music/late-night-study.mp3` | Cat Studying — `public/backgrounds/cat-studying.mp4` |

Selection always applies the pair. During a session, "Change environment" swaps music + background live and records the new ids on the session.

## 5. History (`HistoryDialog`)

Opened from the header. Empty state → CTA. Otherwise:

- **Stats grid** — Today, Yesterday, This week, Sessions (count), Average, Longest (all in seconds-derived compact durations).
- **Last 7 days chart** — bar chart of focus seconds per day, with tooltips (min 4% height so empty days still render).
- **Session list** — grouped by day (`Today` / `Yesterday` / weekday-date), each row shows task name, mode badge (`Target · 50m` / `Open`), date + time, and compact duration.

## 6. Settings (`SettingsDialog`)

Opened from the header.

- **Appearance** — Dark / Light / System (wired to `next-themes` via `ThemeSync`).
- **Timer** — default mode (Open/Target) and default target duration (presets or custom 1–600, saved on blur).
- **Sound** — default volume slider (applied live to `musicPlayer`), and *Remember last environment* switch.

## 7. Notifications

When a Target session reaches zero, a browser `Notification` ("Focus complete") is fired if permission is granted — best-effort, never blocking the in-app target-reached UI.

## 8. Persistence

All local, via zustand `persist` → `localStorage`:

- `focus-active-session` — the in-progress session (restores after refresh/close).
- `focus-settings` — theme, defaults, volume, remember-environment.
- `focus-history` — completed session records.

## 9. Responsive & accessibility

- Desktop-first; the session UI works on mobile (controls wrap, volume slider hidden on small screens).
- Keyboard-navigable with visible focus rings; `aria` labels on icon buttons; `prefers-reduced-motion` swaps video backgrounds for their static poster; tabular numerals prevent timer jitter.
