# Features

Everything described here is implemented and lives on the single `/` route. History and Settings are dialogs, not pages.

## 1. Idle screen (`SetupLayer`, `SiteHeader`)

The app always sits on a full-bleed room artwork; the setup chrome floats over it.

- **Artwork** — `MainBackground` loops `public/backgrounds/270507_small.mp4` (muted, `object-cover`) behind a fixed warm `scrim` and a subtle `noise` layer. On `prefers-reduced-motion` the video is paused (the current frame remains visible). A second fixed `noise` overlay in `layout.tsx` adds grain above the whole UI, including dialogs.
- **Focus CTA** — primary pill labelled *Start focus* with a play icon, fixed bottom-center (`aria-label="Start a focus session"`; `size="xl"` for a 44px tap target). Opens the setup sheet; focus returns to the CTA when the sheet closes. The click also asks for notification permission, because a browser only shows that prompt from a user gesture (the `F` hotkey and the Start button ask too). A `Kbd` shortcut legend sits above it from `sm` up.
- **Zen Mode** — a ghost icon toggle (eye / eye-off, with a hover tooltip) in the header's top-right button group. Fades the header and CTA to `0.25` opacity. Faded chrome stays interactive so Zen can be turned off again, and a hidden `aria-live` region announces the new state. Turns on automatically when a session starts and off when it ends. Ephemeral — not persisted.
- **Header** — transparent, floating: logo on the left; on the right a `ButtonGroup` of icon buttons (History, Settings, Zen Mode), each labelled by a hover tooltip that shows its `Kbd` key. History and Settings open dialogs.
- **Keyboard shortcuts** — `F` opens the setup sheet (idle screen only), `S` opens Settings, `H` opens History, `Z` toggles Zen Mode. They keep working with a session running and in Zen Mode, and `S` / `H` / `Z` also fire while a dialog is open — so `S` and `H` remain usable behind the non-dismissable *Welcome back.* restore dialog, and each swaps to its own dialog instead of stacking one. `F` stays blocked by an open overlay so it can never open the sheet over a dialog. Single keys are ignored when a modifier is held, when focus is in an input/textarea/contenteditable, and on key repeat.

## 2. Setup sheet (`FocusSetupSheet`)

A shadcn `Sheet` (`side="bottom"`) opened by the Focus CTA.

- **Task (optional)** — free-text input, attached to the session. Empty → `Focus Session`.
- **Mode** — toggle: *Open Focus* (counts up) or *Target Focus* (counts down).
- **Duration** (Target only) — presets `25 / 50 / 90` or **Custom** (1–600 minutes, numeric input). Invalid custom values show an inline `FieldError` and block Start; `Enter` in the custom field starts the session. The sheet mounts fresh on each open, prefilled from saved settings (mode, duration, finish message); the task field starts empty and is auto-focused.
- **Finish message** (Target only) — optional custom body for the finish notification, capped at 100 characters (live counter). Prefilled from `settings.completionMessage`; a small bell button beside it previews the notification, asks for permission on first use, and reports the result with a toast (sent / blocked / unsupported / not granted).
- **No environment picker.** Start silently applies the remembered environment (`settings.lastEnvironmentId`), falling back to the first one (`quiet`). The resulting `musicId` / `backgroundId` pair is recorded on the session.
- **Start Focus** — creates the session, saves `completionMessage` (Target only) and `lastEnvironmentId`, asks for notification permission while it is still `default` and primes the completion chime — both inside the click gesture, since a browser only grants them from a user gesture — then turns Zen Mode on and closes the sheet. It does **not** start audio playback.
- **Finish alerts** (`AlertStatus`) — status icons after the sheet title, shown only while notifications are not granted or the browser refused audio (nothing when both are ready). Each icon carries the fix in a hover tooltip, formatted as a title plus numbered steps — e.g. *Notifications are blocked* → "Open the lock icon in the address bar." / "Allow notifications for this site, then start again." — and clicking it retries (the bell re-asks, the speaker re-tests and plays the chime when it works). The prompt itself is fired as early as possible: on the click that opens the sheet (CTA or `F`), then on Start.
- The form mounts with persisted settings as initial state (`useState` lazy initializers) and is gated on settings hydration (`Skeleton` while waiting).

## 3. Focus timer (`FocusTimer`)

Rendered inline on `/` while a session is active — the room artwork stays behind it, and the header remains. There is no navigation and no music/volume UI.

- Optional task name above the timer (single line, truncated); `TimerDisplay` is the dominant element.
- **Timer display** — Target counts down `MM:SS` (`H:MM:SS` past an hour, with a thin circular progress ring); Open counts up `HH:MM:SS`. Overtime shows the frozen target above a running `+MM:SS` readout. All values are timestamp-derived.
- **Pause / Resume** and **End Session** controls (both hidden at `target_reached`, where the Target reached dialog replaces them). A `Kbd`-styled `Space to pause or resume` hint is shown from `sm` up.
- **Keyboard shortcut** — `Space` / `K` toggles pause/resume, ignored while the end-confirm or restore dialog is open and while typing in an input, textarea or contenteditable.
- **End confirm dialog** — shows elapsed time with *Keep Focusing* / *End Session*.
- **Target reached dialog** — at countdown zero: *Finish Session* / *Keep Focusing*. Escape counts as *Keep Focusing*; outside interaction is blocked.
- **Session complete dialog** — shown by `HomeView` after ending, with the recorded total duration; target sessions that ran into overtime also show a `target + overtime` breakdown. *Done* (Escape or outside click also dismisses). Ending a session also turns Zen Mode off.
- **End-of-session sound** — Target sessions chime when they reach zero; ending a session on purpose is always silent. Pomodoro plays a break sound on each phase change and a separate end sound when it finishes naturally; manually ending a Pomodoro session is silent. Open sessions are silent. Best-effort; the chime element is primed during Start (a browser only allows audio after a gesture), it plays at the Sound tab's default volume, and a blocked autoplay is ignored.
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
- **Sound → Playback** — *Default volume* slider: applied live to `musicPlayer`, and used by every notification chime (read at play time, so a preview right after moving the slider plays at the new level).
- **Sound → Notification sounds** — a single list of sounds (built-ins plus any previously uploaded custom ones). Each row has a preview button and three assignment chips: *Target* (`settings.completionSoundId`), *Break* and *End* (Pomodoro config). A sound can serve more than one moment; assigning a chip replaces the previous sound for that moment. Custom sound uploads are temporarily hidden, but stored custom sounds still appear and play.
- **General → Application** — *Reset all settings* expands an inline confirmation (*Reset everything* / *Cancel*) that restores timer defaults, notification sounds (including deleting custom uploads), all appearance dimensions including color mode, and the audio volume. History and the active session are untouched.

## 8. Notifications

When a Target session reaches zero, a browser `Notification` ("Focus complete") is fired if permission is granted — once per session id, best-effort, never blocking the in-app target-reached dialog. Its body is the session's custom finish message, or `You've reached your N-minute focus target.` when none was set. Permission is requested from every click in the start flow — opening the setup sheet (the CTA or the `F` hotkey), then Start Focus — and from the bell button beside the setup field, each only while it is still `default`, because a browser only grants it from a user gesture. The bell button shows a preview notification with the same body and toasts the result (sent / blocked / unsupported / not granted). While the permission is not granted, the setup sheet's title is followed by a bell-with-a-slash icon whose tooltip lists the fix as steps and whose click re-asks; Start itself stays silent.

## 9. Persistence

All local, via zustand `persist` → `localStorage`:

- `focus-active-session` — the in-progress session (restores after refresh/close). Only `session` is persisted; the transient `startedLocally` flag is deliberately not.
- `focus-settings` — the `settings` object only: `defaultMode` (`"target"`), `defaultDuration` (`50`), `musicVolume` (`0.6`), `completionSoundId` (`"bell"`), optional `lastEnvironmentId`, and `completionMessage` (empty by default). Missing keys are backfilled from `DEFAULT_SETTINGS` on rehydrate. `zenMode` is **not** persisted.
- `focus-sounds` — uploaded custom notification sounds (`{ id: "custom:<uuid>", name, dataUrl }`). The upload UI is temporarily hidden; existing entries still appear in the sound list. Capped at 1 MB per file to limit localStorage quota risk.
- `focus-appearance` — `style`, `baseColor`, `theme`, `chartColor` (defaults: nova, stone, orange, orange). Color mode is owned by `next-themes` and stored under its own `theme` key. A blocking script in `layout.tsx` mirrors the persisted appearance onto `<html data-*>` before first paint, so tokens never flash.
- `focus-history` — completed session records (newest first).
- Legacy keys from `src/lib/storage/localStorage.ts` (`focus:settings`, `focus:sessions`, …) are not read or written by the stores; only `DEFAULT_SETTINGS` is imported from there.

## 10. Responsive & accessibility

- Desktop-first, but every surface works on mobile. The timer scales with `clamp()` and hides its Space hint below `sm`. The setup sheet is a bottom sheet capped at `86dvh` with a scrollable body; Settings switches from a sidebar to an icon-only horizontal tab bar, its option grids go 2 → 3/4 columns, and the History dialog (max `85dvh`) stacks into one scrolling column below `lg`.
- Keyboard-navigable with visible focus rings; `aria` labels on icon buttons and icon-only tabs (via `sr-only` text); dialogs have titles; the Zen Mode state is announced in an `aria-live` region; `prefers-reduced-motion` pauses the background video and removes Zen/scrollbar transitions; tabular numerals prevent timer jitter.
- **Custom scrollbars** — thin accent-colored pills (`--primary` tinted with `color-mix`), applied globally in `globals.css`: `::-webkit-scrollbar` for Blink/WebKit, with `scrollbar-width`/`scrollbar-color` gated behind `@supports not selector(::-webkit-scrollbar)` so Firefox gets the standard path without Chromium ignoring the WebKit one.
