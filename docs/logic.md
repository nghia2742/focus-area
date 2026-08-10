# Logic — how the core mechanics work

## 1. Timer engine (`src/lib/timer/timer.ts`)

Pure, dependency-free module. No React, no DOM, no `Date.now()` inside functions — callers pass `now`. All values derive from timestamps, so the timer never drifts across tab throttling, sleep, or refresh.

### Data model

`ActiveSession` (the source of truth):

```
id, taskName, mode ("open" | "target"), targetDuration?, status,
startedAt, pausedAt (null | epoch ms), totalPausedDuration (ms),
overtimeSince (null | epoch ms), musicId?, backgroundId?, createdAt
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
        complete() ──────┘  (both TARGET_REACHED and OVERTIME can complete)
```

Persisted records use `SessionStatus = "completed" | "cancelled"`; the live status enum is `"running" | "paused" | "target_reached" | "overtime"`.

### Key functions

| Function | Behavior |
| --- | --- |
| `createSession(config, now)` | Builds an `ActiveSession`, status `running`; empty task → `DEFAULT_TASK_NAME`. |
| `getElapsedMs(session, now)` | `now - startedAt - totalPausedDuration`, minus the current pause interval while paused. Floor at 0. |
| `getActualDurationSec` / `getRemainingSec` | Seconds from elapsed / remaining ms. Remaining uses `ceil` so a countdown shows the whole second. |
| `getDerivedStatus(session, now)` | While `running` + target + `elapsed >= target*1000` → `target_reached`. This is **derived**, not stored — the state flips even if the tab was closed over the target. |
| `getOvertimeSec` | `now - overtimeSince` (0 when not in overtime). |
| `pauseSession` | No-op unless `running`; sets `pausedAt`. |
| `resumeSession` | No-op unless `paused`; folds the pause interval into `totalPausedDuration`, clears `pausedAt`, re-checks `getDerivedStatus` (a target elapsed while away surfaces as `target_reached`). |
| `enterOvertime` | Target only; `status = "overtime"`, `overtimeSince ?? now` (kept stable if re-entered). |
| `completeSession` | Builds the `FocusSession` history record: `actualDuration`, `endedAt = now`, `status "completed"`, copies music/background ids. |
| `isRunning` | `getDerivedStatus(...) === "running"`. |

### Formats (`src/lib/timer/format.ts`)

- `formatTimer` — `MM:SS`, `H:MM:SS` once ≥ 1 h.
- `formatClock` — always `HH:MM:SS` (Open mode).
- `formatOvertime` — `+MM:SS` / `+H:MM:SS`.
- `formatDurationCompact` / `formatDurationShort` — `1h 27m` / `45m` / `32s`.
- `formatDayGroup` / `formatTime` / `formatDayShort` — history grouping + labels.
- `startOfDay` / `startOfWeek` — calendar boundaries (week starts Monday).

## 2. Hooks

- `useFocusTimer()` — subscribes to the active session and `useNow(500)`, then derives `status`, `elapsedSec`, `remainingSec`, `overtimeSec`, `elapsedMs`. Consumers re-render every tick; **only `TimerDisplay` uses it**.
- `useNow(intervalMs)` — stateful epoch ms refreshed on an interval.
- `useReferenceNow()` — "now" captured once at mount; used by read-only History components so day/time grouping is stable and render bodies stay pure.
- `useMusicPlayer()` — subscribes a component to the `musicPlayer` singleton (see below).
- `usePrefersReducedMotion()` — tracks the `prefers-reduced-motion` media query.

## 3. Stores (`src/store/*`)

One zustand store per domain, each with `persist` + a `hydrated` flag set in `onRehydrateStorage`.

### `focusStore` — active session

Persist key `focus-active-session`; `partialize` persists **only `session`** (the transient `startedLocally` flag is not persisted, so a reloaded session is correctly treated as "restored").

- `start(config)` — guarded (no-op if a session already exists, preventing double-start).
- `pause` / `resume` / `enterOvertime` — delegate to the timer engine with `Date.now()`.
- `complete()` — builds the record via the engine, pushes it into `useHistoryStore`, clears the session.
- `discard()` — clears without saving.
- `setEnvironment({musicId, backgroundId})` — swaps the pair on the live session.

### `settingsStore` — preferences

Persist key `focus-settings`; defaults from `DEFAULT_SETTINGS` in `src/lib/storage/localStorage.ts`.

```
theme: "dark", defaultMode: "target", defaultDuration: 50,
musicVolume: 0.6, rememberLastEnvironment: true, lastEnvironmentId?
```

### `historyStore` — completed sessions

Persist key `focus-history`. `addSession` prepends; `clearSessions` wipes.

## 4. Persistence & migration

- zustand `createJSONStorage(() => localStorage)`. Keys: `focus-active-session`, `focus-settings`, `focus-history`.
- **Migration:** `lastMusicId` / `lastBackgroundId` / `rememberLastMusic` / `rememberLastBackground` were replaced by `rememberLastEnvironment` + `lastEnvironmentId`. Old keys in persisted JSON are simply ignored by the store shape — no migration code runs.
- The helpers in `src/lib/storage/localStorage.ts` (`getSettings`, `saveSessions`, `getActiveSession`, …) use older keys (`focus:settings`, etc.) and are **not** used by the stores — only `DEFAULT_SETTINGS` is imported. Do not dual-write through them.

## 5. Audio (`src/lib/audio/musicPlayer.ts`)

Module-level singleton (`export const musicPlayer`) — one `HTMLAudioElement`, created lazily, looped, owned outside React so it survives component lifecycle and can be driven from the Start gesture.

- `setTrack(id)` — no-op if unchanged; `undefined` stops/clears. `play()` failures (autoplay rejection on cold restore) are swallowed and surfaced via `isPlaying = false`.
- `toggle` / `play` / `pause` / `setVolume` / `retry` / `stop`.
- `error` flag (from the `audio` element's `error` event) → `MusicPlayer` renders the `Music unavailable` pill with a retry button. Audio failure never touches the timer.
- React binds to it via `useMusicPlayer` (subscribe → `forceUpdate` reducer).

Autoplay contract: the audio is (re)started inside `FocusSetup.handleStart` — i.e. directly in the click gesture.

## 6. Backgrounds (`BackgroundRenderer`)

- Video `h-full w-full object-cover` + poster; falls back to the static `<img>` on `onError` or when `prefers-reduced-motion` is on.
- Dark gradient overlay (`from-black/40 via-black/25 to-black/60`) keeps the timer readable.
- `absolute inset-0` within the `relative flex-1` focus root — see the full-bleed layout note in `AGENTS.md`.

## 7. Stats (`src/lib/stats.ts`)

- `computeStats(sessions, now)` — today / yesterday / week (Monday-start) totals, count, average, longest, all from `actualDuration`.
- `lastNDays(n, sessions, now)` — trailing `n` day buckets (oldest first) for the weekly chart.

## 8. Notifications (`src/lib/notifications.ts`)

- `requestNotificationPermission()` — best-effort, called from the Start gesture.
- `notifyTargetReached(minutes)` — fires only when permission is `granted`; wrapped in try/catch and never blocking.

## 9. Environments & data

`src/data/environments.ts` defines the pairs; `src/data/music.ts` and `src/data/backgrounds.ts` hold the current single track and video, referenced by id. `getEnvironment` / `getMusicTrack` / `getBackground` resolve ids → objects (undefined-safe).
