# Logic — how the core mechanics work

## 1. Timer engine (`src/lib/timer/timer.ts`)

Pure, dependency-free module. No React, no DOM, no `Date.now()` inside functions — callers pass `now`. All values derive from timestamps, so the timer never drifts across tab throttling, sleep, or refresh.

### Data model

`ActiveSession` (the source of truth):

```
id, taskName, mode ("open" | "target"), targetDuration?, status,
startedAt, pausedAt (null | epoch ms), totalPausedDuration (ms),
overtimeSince (null | epoch ms), musicId?, backgroundId?,
completionMessage?, createdAt
```

### State machine

```
          start(config)               resume()             enterOvertime()
IDLE ──────────────────► RUNNING ─────────────► PAUSED ──────────────► RUNNING
                          │  ▲                                          │
        getDerivedStatus  │  └────────────────────┘                     │
        (target elapsed)  ▼                                            ▼
                     TARGET_REACHED ── enterOvertime() ──► OVERTIME ──► complete
                          │
        complete() ───────┘  (both TARGET_REACHED and OVERTIME can complete)
```

Persisted records use `SessionStatus = "completed" | "cancelled"`; the live status enum is `"running" | "paused" | "target_reached" | "overtime"`.

### Key functions

| Function | Behavior |
| --- | --- |
| `createSession(config, now)` | Builds an `ActiveSession`, status `running`; empty task → `DEFAULT_TASK_NAME`. |
| `getElapsedMs(session, now)` | `now - startedAt - totalPausedDuration`, minus the current pause interval while paused. Floor at 0. |
| `getActualDurationSec` / `getRemainingSec` | Seconds from elapsed / remaining ms. Remaining uses `ceil` so a countdown shows the whole second. |
| `getDerivedStatus(session, now)` | While `running` + target + `elapsed >= target*1000` → `target_reached`. This is **derived**, not stored — the state flips even if the tab was closed over the target. A paused session stays paused until resumed. |
| `getOvertimeMs` / `getOvertimeSec` | `now - overtimeSince`, clamped at 0; 0 when not in overtime. |
| `pauseSession` | No-op unless `running`; sets `pausedAt`. |
| `resumeSession` | No-op unless `paused`; folds the pause interval into `totalPausedDuration`, clears `pausedAt`, re-checks `getDerivedStatus` (a target elapsed while away surfaces as `target_reached`). |
| `enterOvertime` | Target only; `status = "overtime"`, `overtimeSince ?? now` (kept stable if re-entered). |
| `completeSession` | Builds the `FocusSession` history record: `actualDuration`, `endedAt = now`, `status "completed"`, copies music/background ids. |
| `isRunning` | `getDerivedStatus(...) === "running"`. |

### Formats (`src/lib/timer/format.ts`)

- `formatTimer` — `MM:SS`, `H:MM:SS` once ≥ 1 h.
- `formatClock` — always `HH:MM:SS` (Open mode, dialogs).
- `formatOvertime` — `+MM:SS` / `+H:MM:SS`.
- `formatDurationCompact` / `formatDurationShort` — `1h 27m` / `45m` / `32s`.
- `formatDayGroup` / `formatTime` / `formatDayShort` — history grouping + labels.
- `startOfDay` / `startOfWeek` — calendar boundaries (week starts Monday).

## 2. Hooks

- `useFocusTimer()` — subscribes to the active session and `useNow(500)`, then derives `status`, `elapsedSec`, `remainingSec`, `overtimeSec`, `elapsedMs`. Consumers re-render every tick; **only `TimerDisplay`, `TargetReached` and `FocusTimer` use it**.
- `useNow(intervalMs)` — stateful epoch ms refreshed on an interval.
- `useReferenceNow()` — "now" captured once at mount; used by read-only History components so day/time grouping is stable and render bodies stay pure.
- `usePrefersReducedMotion()` — tracks the `prefers-reduced-motion` media query.

There is no `useMusicPlayer` hook; no component subscribes to audio state today.

## 3. Stores (`src/store/*`)

One zustand store per domain, each with `persist` + a `hydrated` flag set in `onRehydrateStorage`.

### `focusStore` — active session

Persist key `focus-active-session`; `partialize` persists **only `session`** (the transient `startedLocally` flag is not persisted, so a reloaded session is correctly treated as "restored").

- `start(config)` — guarded (no-op if a session already exists, preventing double-start).
- `pause` / `resume` / `enterOvertime` — delegate to the timer engine with `Date.now()`.
- `complete()` — builds the record via the engine, pushes it into `useHistoryStore`, clears the session, returns the record.
- `discard()` — clears without saving (no current UI calls it).
- `setEnvironment({musicId, backgroundId})` — swaps the pair on the live session (no current UI calls it).

### `settingsStore` — preferences + Zen Mode

Persist key `focus-settings`; `partialize` persists **only `settings`** — `zenMode` is ephemeral and always off on load. Defaults come from `DEFAULT_SETTINGS` in `src/lib/storage/localStorage.ts`.

```
defaultMode: "target", defaultDuration: 50,
musicVolume: 0.6, rememberLastEnvironment: true,
lastEnvironmentId?, completionMessage: ""
```

`update(partial)` shallow-merges settings; `setZenMode(bool)` drives `ZenFade` and the rail toggle.

### `appearanceStore` — visual presets

Persist key `focus-appearance`; stores `style`, `baseColor`, `theme`, `chartColor` only (defaults from `DEFAULT_APPEARANCE` in `src/lib/appearance/presets.ts`). Every field is validated on merge with `is*` guards, falling back per field. `resetAppearance()` restores the defaults. Color mode is **not** here — it lives in `next-themes` and is composed with this store in `AppearanceProvider`.

### `historyStore` — completed sessions

Persist key `focus-history`. `addSession` prepends; `clearSessions` wipes (no current UI calls it).

## 4. Persistence & migration

- zustand `createJSONStorage(() => localStorage)`. Keys: `focus-active-session`, `focus-settings`, `focus-appearance`, `focus-history`, plus `theme` owned by `next-themes`.
- **Migration:** `lastMusicId` / `lastBackgroundId` / `rememberLastMusic` / `rememberLastBackground` were replaced by `rememberLastEnvironment` + `lastEnvironmentId`. Old keys in persisted JSON are simply ignored by the store shape — no migration code runs. Appearance values are validated on merge (`isAppearanceStyle` / `isBaseColor` / `isPaletteColor`), so unknown ids fall back to defaults; `appearanceScript` in `layout.tsx` applies the persisted appearance before first paint.
- The helpers in `src/lib/storage/localStorage.ts` (`getSettings`, `saveSessions`, `getActiveSession`, …) use older keys (`focus:settings`, etc.) and are **not** used by the stores — only `DEFAULT_SETTINGS` is imported. Do not dual-write through them.

## 5. Audio (`src/lib/audio/musicPlayer.ts`)

Module-level singleton (`export const musicPlayer`) — one looped `HTMLAudioElement`, created lazily, owned outside React.

- API: `setTrack` / `play` / `pause` / `toggle` / `setVolume` / `retry` / `stop`, plus `isPlaying` / `error` / `trackId` getters and a `subscribe` listener set.
- **Not wired to the UI yet.** No component calls `setTrack` or `play`; the only caller is the Settings volume slider (`setVolume`). Sessions record `musicId`, but no audio starts on Start Focus or anywhere else. The autoplay-on-gesture contract in the original spec is therefore not currently exercised.
- `setTrack` failures (autoplay rejection / missing file) are swallowed and surfaced via `error` / `isPlaying`; audio can never touch the timer.

## 6. Background (`src/components/media/MainBackground.tsx`)

- Fixed full-bleed video: `/backgrounds/270507_small.mp4`, `autoPlay muted loop playsInline`, `object-cover`, inside `absolute inset-0 z-0`.
- Pauses when `prefers-reduced-motion` is on and resumes when it turns off.
- Overlays the `scrim` utility (warm gradient) and a `noise` film-grain layer.
- There is no per-environment `BackgroundRenderer`; `backgroundId` is recorded but not rendered.

## 7. Stats (`src/lib/stats.ts`)

- `computeStats(sessions, now)` — today / yesterday / week (Monday-start) totals, count, average, longest, all from `actualDuration`.
- `lastNDays(n, sessions, now)` — trailing `n` day buckets (oldest first) for the weekly chart.

## 8. Notifications (`src/lib/notifications.ts`)

- `requestNotificationPermission()` — best-effort, called from the Start Focus gesture.
- `previewCompletionNotification(minutes, message)` — asks for permission while it is still `default`, then shows the notification with a `-preview` tag; returns the resulting `NotificationPermission` (or `"unsupported"`). Called from the preview button's click gesture.
- `notifyTargetReached(minutes, message?)` — fires only when permission is `granted`; the body is the custom message or the default sentence; wrapped in try/catch and never blocking. `FocusTimer` dedupes it per session id.

## 9. Environments & data

`src/data/environments.ts` defines the pairs; `src/data/music.ts` and `src/data/backgrounds.ts` hold the current tracks/backgrounds, referenced by id. `getEnvironment` / `getMusicTrack` / `getBackground` resolve ids → objects (undefined-safe), and `getEnvironmentVisual` builds a thumbnail-or-gradient card visual.

The data is currently consumed only by `FocusSetupSheet` (to resolve the remembered pair) and `musicPlayer` (track lookup). No picker, background renderer, or card grid exists yet, so `getEnvironmentVisual` has no caller.
