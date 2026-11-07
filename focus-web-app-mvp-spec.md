# Focus Web App --- MVP Product & Technical Specification

> **Status note (current implementation).** This file is the original product & technical vision. The app as built differs in several ways, most notably: it is a **single-page** app (`/` only — History and Settings are dialogs, not routes), setup is a **bottom sheet** with no environment picker, one fixed background video (`270507_small.mp4`) is used for every screen, **music playback is not wired** (only the volume setting touches `musicPlayer`), and persistence uses zustand `persist` keys (`focus-settings`, `focus-history`, `focus-active-session`) with a `rememberLastEnvironment`/`lastEnvironmentId` setting. For what actually exists today, see `docs/` (`docs/README.md` is the index). Sections describing `MusicSelector`/`BackgroundSelector`, the `/focus` `/history` `/settings` routes, and the `lastMusicId`/`lastBackgroundId` settings reflect the original plan, not the shipped code.

## 1. Overview

### Product name

Working name: **Focus**

### Product concept

Focus is a modern, immersive web app that helps users enter a focused
working/studying session, surround themselves with music and an ambient
visual background, and track how much time they actually spend focusing.

The MVP intentionally does **not** use AI, social features, complex
productivity planning, or user accounts.

The core product loop is:

> **Open → Set focus → Choose atmosphere → Start → Focus → Stop/Complete
> → Track**

### Product philosophy

> **One thing. Right now.**

The product should feel like a dedicated place for focus rather than
another task-management application.

------------------------------------------------------------------------

# 2. MVP Goals

The MVP has four primary goals:

1.  Let users start a focus session within a few seconds.
2.  Support two timer modes:
    -   Open Focus: count up until the user stops.
    -   Target Focus: count down from a user-defined duration.
3.  Make the focus experience immersive through background music and
    animated visual backgrounds.
4.  Record focus sessions and show basic focus statistics.

## Explicitly out of scope

The MVP will NOT include:

-   AI-generated schedules
-   AI productivity coaching
-   Task management
-   Complex project management
-   Social/community features
-   Leaderboards
-   User-to-user sharing
-   Spotify integration
-   YouTube integration
-   Google authentication
-   Cloud synchronization
-   Subscription/payment
-   Advanced analytics
-   Mobile native applications

The architecture should leave room for these features later, but they
should not influence MVP complexity.

------------------------------------------------------------------------

# 3. Target Users

Primary users:

-   Developers
-   Students
-   Designers
-   Writers
-   Freelancers
-   Knowledge workers
-   Anyone who works/studies for extended periods on a computer

Typical use case:

> "I need to study/work for a while. I want background music, a nice
> environment, and I want to know how long I actually focused."

------------------------------------------------------------------------

# 4. Core User Experience

The most important requirement is low friction.

A new user should be able to:

1.  Open the website.
2.  Select a timer mode.
3.  Optionally enter a task name.
4.  Choose music/background.
5.  Press Start.
6.  Enter the focus screen.

Target:

> **Landing → Start Focus in less than 10 seconds.**

The application should avoid unnecessary dialogs, registration,
onboarding, or configuration before the first session.

------------------------------------------------------------------------

# 5. Timer Modes

## 5.1 Open Focus

### Purpose

Measure actual focus time without imposing a deadline.

### Behavior

When the user presses Start:

``` text
00:00:00
00:00:01
00:00:02
...
```

The timer counts upward indefinitely.

The timer stops counting when:

-   User pauses.
-   User ends the session.
-   Browser/page becomes unavailable.

### Example

User starts at 09:00.

User pauses at 09:40.

User resumes at 09:45.

User ends at 10:30.

Actual focus time:

``` text
40 minutes + 45 minutes = 1 hour 25 minutes
```

The five-minute pause must not count toward focus time.

------------------------------------------------------------------------

## 5.2 Target Focus

### Purpose

Give the user a specific focus duration.

Example:

> "I want to focus for 50 minutes."

User selects:

``` text
25 min
50 min
90 min
Custom
```

Timer starts at:

``` text
50:00
```

and counts down:

``` text
49:59
49:58
...
00:01
00:00
```

When the timer reaches zero, the application must notify the user.

### Important behavior

The session should **not automatically terminate** at zero.

Instead, show:

``` text
TARGET REACHED

You've focused for 50 minutes.

[ Finish Session ]
[ Keep Focusing ]
```

If the user selects `Finish Session`, the session is completed.

If the user selects `Keep Focusing`, the application enters overtime
mode.

Example:

``` text
TARGET
50:00

OVERTIME
+08:32
```

The final actual duration becomes:

``` text
58 minutes 32 seconds
```

This allows users to continue when they are in a state of flow.

------------------------------------------------------------------------

# 6. Timer State Model

The timer should have explicit states.

``` text
IDLE
  ↓
RUNNING
  ↓
PAUSED
  ↓
RUNNING
  ↓
COMPLETED
```

Target sessions additionally support:

``` text
RUNNING
  ↓
TARGET_REACHED
  ↓
    ┌───────────────┐
    ↓               ↓
COMPLETED       OVERTIME
                    ↓
                COMPLETED
```

## States

### IDLE

No active session.

### RUNNING

Timer is actively counting.

### PAUSED

Timer is temporarily stopped.

### TARGET_REACHED

Target countdown has reached zero but the user has not yet ended the
session.

### OVERTIME

Target has been reached and the user chooses to continue.

### COMPLETED

The user explicitly ends the session.

### CANCELLED

The user abandons the session without saving it.

------------------------------------------------------------------------

# 7. Pause Behavior

Pause must preserve the session.

Example:

``` text
Start       10:00
Pause       10:25
Resume      10:30
Stop        11:00
```

Actual focus duration:

``` text
25 minutes + 30 minutes = 55 minutes
```

The five-minute pause is excluded.

The UI should clearly communicate the paused state.

Example:

``` text
PAUSED

42:18

[ Resume ]
[ End Session ]
```

------------------------------------------------------------------------

# 8. Stop / End Session

Pressing Stop should not immediately discard the session.

Show a confirmation state:

``` text
END FOCUS SESSION?

You've focused for

01:27:42

[ Keep Focusing ]
[ End Session ]
```

After confirmation:

``` text
SESSION COMPLETE

1h 27m

Nice work.

[ Done ]
```

The session is then stored in focus history.

------------------------------------------------------------------------

# 9. Task Name

The MVP should optionally allow users to specify what they are focusing
on.

Example:

``` text
What are you working on?

[ Learn PostgreSQL            ]
```

This field is optional.

It should not become a full task-management feature.

The value is simply attached to the focus session.

Example history:

``` text
1h 20m   Learn PostgreSQL
45m      Build landing page
32m      Read system design
```

If the user leaves it empty, the session can simply be labeled:

``` text
Focus Session
```

------------------------------------------------------------------------

# 10. Focus Home Screen

The home screen is the entry point.

It should be visually minimal.

Example structure:

``` text
┌─────────────────────────────────────┐
│ Focus                    History ⚙ │
│                                     │
│           What are you doing?       │
│                                     │
│      [ Learn PostgreSQL          ]  │
│                                     │
│       ┌─────────┐  ┌─────────┐      │
│       │  Open   │  │ Target  │      │
│       │  Focus  │  │  Focus  │      │
│       └─────────┘  └─────────┘      │
│                                     │
│       Duration                      │
│       [25] [50] [90] [Custom]       │
│                                     │
│       🎵 Rainy Ambient              │
│       🌧 Rainy Window               │
│                                     │
│          [ Start Focus ]             │
│                                     │
└─────────────────────────────────────┘
```

For Open Focus, duration selection should be hidden or disabled.

------------------------------------------------------------------------

# 11. Focus Setup

The user can configure three things:

## 11.1 Task

Optional text.

Example:

``` text
Learn PostgreSQL
```

## 11.2 Timer

Options:

``` text
Open Focus
25 min
50 min
90 min
Custom
```

For Target Focus, `Custom` opens a duration selector.

MVP should support:

-   Minutes
-   Optional seconds are not necessary for user input.

## 11.3 Environment

The environment consists of:

-   Music
-   Visual background

The last selected music/background can be remembered locally.

------------------------------------------------------------------------

# 12. Music

Music is a supporting feature, not the primary product.

The goal is to create a distraction-free alternative to opening YouTube.

## MVP music categories

Examples:

-   Lo-fi
-   Ambient
-   Piano
-   Electronic
-   Rain
-   Nature
-   Cafe

Each track should contain:

``` text
id
name
category
audio_url
thumbnail_url
duration
```

## Controls

During a session:

-   Play/Pause
-   Volume
-   Select another track

MVP does not need:

-   Music search
-   Playlists
-   User uploads
-   Spotify API
-   YouTube API
-   Social sharing

## Licensing

Only use audio assets that the project has permission to distribute.

The MVP should use properly licensed or self-produced audio.

------------------------------------------------------------------------

# 13. Animated Backgrounds

The focus screen should support an immersive visual background.

Possible environments:

-   Rainy Window
-   Night City
-   Forest
-   Ocean
-   Cozy Room
-   Coffee Shop
-   Cyberpunk
-   Minimal Gradient

## Asset types

MVP can support:

``` text
video
image
```

Video is preferred for animated environments.

Use MP4/WebM where practical.

Static images should be supported as a fallback.

## Background requirements

-   Full viewport
-   Seamless or unobtrusive loop
-   Low visual distraction
-   Text remains readable
-   Dark overlay/gradient available
-   Responsive on desktop and mobile
-   `object-fit: cover`

Example layering:

``` text
Background Video
       ↓
Dark / Gradient Overlay
       ↓
Focus UI
```

------------------------------------------------------------------------

# 14. Focus Screen

The Focus Screen is the most important screen in the application.

Once the session starts, the interface should become extremely minimal.

Example:

``` text
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         Learn PostgreSQL            │
│                                     │
│              42:18                  │
│                                     │
│         ─────────────               │
│                                     │
│         🎧 Rainy Ambient            │
│                                     │
│          [ Pause ]                  │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Design requirements

-   Full-screen background
-   Large timer
-   Optional task name
-   Minimal controls
-   Music indicator
-   Pause/Resume
-   End session
-   No distracting navigation
-   No advertisements
-   No content feed

The user should feel like they have entered a separate "focus room."

------------------------------------------------------------------------

# 15. Focus Screen Interaction

## Default

Show:

``` text
Task name
Timer
Music name
Pause
End
```

## Hover / tap behavior

Controls can fade slightly when not needed.

On desktop, moving the mouse toward the bottom can reveal controls.

On mobile, controls should remain accessible.

Avoid hiding critical controls completely.

------------------------------------------------------------------------

# 16. Completion Notification

When Target Focus reaches zero:

### In-app notification

``` text
🎉 Focus target reached

You've completed 50 minutes.
```

### Browser notification

If the user grants notification permission:

``` text
Focus complete

You've reached your 50-minute focus target.
```

Browser notification is optional for MVP but recommended.

If permission is denied, the app must still show the in-app completion
state.

------------------------------------------------------------------------

# 17. Focus History

History provides the measurement value of the product.

Users should be able to see their previous sessions.

Example:

``` text
Focus History

Today
────────────────────────

1h 20m   Learn PostgreSQL
45m      Build landing page
32m      Reading

Total
2h 37m
```

## Each session displays

-   Task name
-   Duration
-   Mode
-   Date
-   Optional music/background

Example:

``` text
Learn PostgreSQL
Target · 50m
Today · 10:30
```

------------------------------------------------------------------------

# 18. Statistics

MVP statistics should remain simple.

## Today

``` text
2h 37m
```

## Yesterday

``` text
1h 45m
```

## This Week

``` text
10h 24m
```

## Number of sessions

``` text
12 sessions
```

## Average session

``` text
52m
```

## Longest session

``` text
1h 47m
```

A simple bar chart can visualize focus time by day.

Example:

``` text
Mon  ████████  2h
Tue  █████     1h20
Wed  ███████   1h45
Thu  █████████ 2h15
Fri  ██████    1h30
```

No advanced analytics are required.

------------------------------------------------------------------------

# 19. Data Persistence

Because this is an MVP built only with Next.js, the first version should
avoid requiring a backend.

Recommended approach:

``` text
Browser
  ↓
localStorage
```

Store:

-   Focus sessions
-   Settings
-   Last selected music
-   Last selected background
-   User preferences

## Example local storage structure

``` json
{
  "sessions": [],
  "settings": {
    "defaultMode": "target",
    "defaultDuration": 50,
    "musicVolume": 0.6,
    "lastMusicId": "rain-01",
    "lastBackgroundId": "rainy-window"
  }
}
```

For larger data or better reliability, IndexedDB can be introduced
later.

For the MVP, localStorage is acceptable.

------------------------------------------------------------------------

# 20. Refresh / Browser Close Behavior

An active timer must not rely only on `setInterval`.

The source of truth should be timestamps.

For example:

``` text
startedAt
pausedAt
totalPausedDuration
targetDuration
```

The UI calculates elapsed time from timestamps.

This prevents timer drift when:

-   Browser tab becomes inactive
-   Laptop sleeps
-   User switches tabs
-   Browser throttles JavaScript timers

## Important rule

Never treat:

``` text
setInterval(() => seconds++, 1000)
```

as the authoritative timer.

Instead:

``` text
elapsed = currentTime - startedAt - pausedDuration
```

The UI can update every 250--1000ms, but the calculated time must come
from timestamps.

------------------------------------------------------------------------

# 21. Handling Browser Refresh

If the user refreshes during an active session:

The app should attempt to restore the active session from localStorage.

Example:

``` text
You have an active focus session.

Learn PostgreSQL
42:18 elapsed

[ Resume Session ]
[ End Session ]
```

For MVP, this behavior is recommended.

------------------------------------------------------------------------

# 22. Handling Browser Close

If the browser closes unexpectedly, the application should preserve
enough state to recover the session on the next visit.

On reopening:

``` text
Welcome back.

You have an unfinished focus session.

[ Resume ]
[ Discard ]
```

Exact recovery semantics can be simplified in the first implementation.

------------------------------------------------------------------------

# 23. Responsive Design

Primary target:

> Desktop / laptop

Secondary:

> Mobile browser

The desktop experience should receive the most design attention because
focus sessions are primarily intended for laptop/desktop users.

Mobile should still support:

-   Timer
-   Music
-   Background
-   Pause
-   End
-   History

------------------------------------------------------------------------

# 24. Visual Design Direction

## Keywords

-   Modern
-   Young
-   Calm
-   Immersive
-   Premium
-   Minimal
-   Slightly playful

## Recommended visual language

-   Dark-first
-   Large typography
-   Rounded corners
-   Subtle gradients
-   Soft shadows
-   Glassmorphism used sparingly
-   Smooth transitions
-   Full-screen media
-   High contrast timer

The application should not look like a traditional corporate
productivity SaaS.

Avoid:

-   Excessive tables
-   Dense dashboards
-   Too many cards
-   Excessive badges
-   Corporate blue-heavy UI
-   Complex navigation

------------------------------------------------------------------------

# 25. Color System

The exact palette can be refined during implementation.

Recommended direction:

``` text
Background:
Near-black / deep navy

Primary text:
White / near-white

Secondary text:
Muted gray

Accent:
One vibrant accent color

Glass:
White with very low opacity

Overlay:
Black with 30–60% opacity
```

The background media should provide most of the visual personality.

UI colors should remain restrained so the timer is always readable.

------------------------------------------------------------------------

# 26. Typography

Use a modern sans-serif font.

Potential choices:

-   Inter
-   Geist
-   Plus Jakarta Sans

For a Next.js MVP, **Geist** is a strong default.

Typography hierarchy:

``` text
Timer:
Very large / bold

Task:
Medium / semibold

Secondary information:
Small / muted

Buttons:
Medium / semibold
```

The timer should be the dominant visual element on the Focus Screen.

------------------------------------------------------------------------

# 27. Navigation

Keep navigation minimal.

``` text
Focus
├── Home
├── History
└── Settings
```

Logo/brand should return to Home.

During an active session, normal navigation should be minimized or
hidden.

------------------------------------------------------------------------

# 28. Settings

MVP settings:

## Appearance

-   Dark
-   Light
-   System

Default:

``` text
Dark
```

## Timer

-   Default timer mode
-   Default target duration

## Sound

-   Default volume
-   Remember last track

## Background

-   Remember last background

No account settings are needed because the MVP does not have
authentication.

------------------------------------------------------------------------

# 29. Suggested Next.js Architecture

Use:

-   Next.js
-   TypeScript
-   Tailwind CSS

No backend is required for the first MVP.

Recommended structure:

``` text
app/
├── page.tsx
├── focus/
│   └── page.tsx
├── history/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── layout.tsx
└── globals.css

components/
├── timer/
│   ├── FocusTimer.tsx
│   ├── TimerControls.tsx
│   └── TimerDisplay.tsx
├── focus/
│   ├── FocusSetup.tsx
│   ├── FocusScreen.tsx
│   └── SessionComplete.tsx
├── media/
│   ├── MusicPlayer.tsx
│   ├── MusicSelector.tsx
│   ├── BackgroundSelector.tsx
│   └── BackgroundRenderer.tsx
├── history/
│   ├── SessionList.tsx
│   ├── SessionItem.tsx
│   └── FocusStats.tsx
└── ui/

lib/
├── timer/
│   ├── timer.ts
│   └── timerTypes.ts
├── storage/
│   └── localStorage.ts
└── utils/

hooks/
├── useFocusTimer.ts
├── useLocalStorage.ts
└── useMediaPlayer.ts

data/
├── music.ts
└── backgrounds.ts

types/
└── focus.ts

public/
├── music/
└── backgrounds/
```

The exact structure can change during implementation, but
responsibilities should remain separated.

------------------------------------------------------------------------

# 30. Core TypeScript Types

Suggested initial types:

``` ts
type FocusMode = "open" | "target";

type SessionStatus =
  | "active"
  | "paused"
  | "target_reached"
  | "completed"
  | "cancelled";

interface FocusSession {
  id: string;
  taskName?: string;
  mode: FocusMode;
  targetDuration?: number;
  actualDuration: number;
  startedAt: string;
  endedAt?: string;
  status: SessionStatus;
  musicId?: string;
  backgroundId?: string;
  createdAt: string;
}

interface MusicTrack {
  id: string;
  name: string;
  category: string;
  audioUrl: string;
}

interface Background {
  id: string;
  name: string;
  type: "image" | "video";
  assetUrl: string;
  thumbnailUrl?: string;
}
```

Durations should be stored in **seconds**.

------------------------------------------------------------------------

# 31. Timer Engine Requirements

The timer engine should be independent from the UI.

Responsibilities:

-   Start
-   Pause
-   Resume
-   Stop
-   Calculate elapsed duration
-   Calculate remaining duration
-   Detect target reached
-   Enter overtime
-   Restore state

The timer engine should not know about React components.

This allows the timer to be tested independently.

------------------------------------------------------------------------

# 32. Timer Calculation

For Open Focus:

``` text
actualDuration =
  now
  - startedAt
  - totalPausedDuration
```

For Target Focus:

``` text
remaining =
  targetDuration
  - actualDuration
```

When:

``` text
remaining <= 0
```

transition to:

``` text
TARGET_REACHED
```

If the user continues:

``` text
overtime =
  actualDuration
  - targetDuration
```

------------------------------------------------------------------------

# 33. Audio Requirements

The music player should:

-   Continue while the user remains on the Focus Screen.
-   Pause/resume independently from the timer.
-   Remember volume.
-   Avoid autoplay restrictions by starting playback from a user
    interaction such as `Start Focus`.

Important:

Browsers may block audio autoplay.

Therefore:

> Music should start as a direct consequence of the user's Start Focus
> interaction.

------------------------------------------------------------------------

# 34. Performance Requirements

Because the Focus Screen can contain video backgrounds, performance is
important.

Requirements:

-   Lazy-load non-active backgrounds.
-   Do not load all videos simultaneously.
-   Use compressed video assets.
-   Prefer WebM/MP4 depending on browser support.
-   Use poster images.
-   Pause background video when appropriate.
-   Avoid unnecessary React re-renders every second.
-   Keep timer rendering isolated from the rest of the application.

The timer should update frequently without causing the entire page to
re-render.

------------------------------------------------------------------------

# 35. Accessibility

MVP should still support:

-   Keyboard navigation
-   Visible focus states
-   Accessible button labels
-   Sufficient text contrast
-   Reduced motion preference
-   Audio controls
-   Screen-reader-friendly controls

If the user has:

``` text
prefers-reduced-motion: reduce
```

the application should prefer a static background or disable animated
transitions.

------------------------------------------------------------------------

# 36. Error / Edge Cases

The application must handle:

### User presses Start twice

Do not create two sessions.

### User pauses twice

No additional effect.

### User resumes without an active session

Ignore or restore the correct state.

### Target reaches zero while tab is inactive

On returning to the tab, calculate the correct state from timestamps.

### Browser refresh

Attempt to restore active session.

### Browser closes

Persist enough state to recover/discard the active session.

### Audio fails

Focus timer must continue normally.

Show:

``` text
Music unavailable
```

without interrupting the focus session.

### Video fails

Fallback to poster/static background.

------------------------------------------------------------------------

# 37. MVP Pages

Only four pages are required.

## `/`

Home / Focus Setup

Purpose:

-   Choose task
-   Choose mode
-   Choose duration
-   Choose music
-   Choose background
-   Start

## `/focus`

Active Focus Screen

Purpose:

-   Timer
-   Background
-   Music
-   Pause
-   Resume
-   End
-   Target reached
-   Overtime

## `/history`

History & Statistics

Purpose:

-   Today
-   This week
-   Session list
-   Basic metrics

## `/settings`

Settings

Purpose:

-   Theme
-   Default timer
-   Default music
-   Default background
-   Volume

------------------------------------------------------------------------

# 38. MVP Acceptance Criteria

The MVP is considered functional when the following scenarios work.

## Scenario 1 --- Open Focus

1.  User opens `/`.
2.  Selects Open Focus.
3.  Enters optional task.
4.  Selects music.
5.  Selects background.
6.  Clicks Start.
7.  `/focus` opens.
8.  Timer counts upward.
9.  User pauses.
10. Timer stops.
11. User resumes.
12. Timer continues.
13. User ends session.
14. Session is saved.
15. History displays the session with correct actual duration.

## Scenario 2 --- Target Focus

1.  User opens `/`.
2.  Selects Target Focus.
3.  Selects 50 minutes.
4.  Clicks Start.
5.  Timer counts down.
6.  Timer reaches zero.
7.  Target reached UI appears.
8.  User selects Finish.
9.  Session is saved as 50 minutes.

## Scenario 3 --- Overtime

1.  User starts a 50-minute session.
2.  Timer reaches zero.
3.  User chooses Keep Focusing.
4.  Overtime starts.
5.  User focuses for another 10 minutes.
6.  User ends the session.
7.  History records approximately 60 minutes.

## Scenario 4 --- Pause

1.  User starts a session.
2.  Focuses for 20 minutes.
3.  Pauses for 10 minutes.
4.  Resumes.
5.  Focuses for 20 minutes.
6.  Ends.
7.  History records approximately 40 minutes, not 50.

## Scenario 5 --- Refresh

1.  User starts a session.
2.  Refreshes browser.
3.  Application detects active session.
4.  Application offers to resume.
5.  Timer continues from the correct timestamp.

------------------------------------------------------------------------

# 39. Development Phases

## Phase 1 --- Timer Core

Build:

-   Open timer
-   Target timer
-   Pause
-   Resume
-   Stop
-   Overtime
-   Timestamp-based calculation

Do not build visual polish yet.

## Phase 2 --- Focus Screen

Build:

-   Full-screen layout
-   Timer display
-   Task name
-   Controls
-   Completion state

## Phase 3 --- Music

Build:

-   Local audio assets
-   Music selector
-   Play/pause
-   Volume
-   Remember selection

## Phase 4 --- Backgrounds

Build:

-   Image background
-   Video background
-   Background selector
-   Overlay
-   Responsive behavior

## Phase 5 --- Persistence

Build:

-   localStorage
-   Session history
-   Active-session restoration
-   Settings persistence

## Phase 6 --- History

Build:

-   Today total
-   Weekly total
-   Average session
-   Longest session
-   Session list
-   Simple chart

## Phase 7 --- Polish

Build:

-   Animations
-   Keyboard shortcuts
-   Responsive layout
-   Accessibility
-   Loading states
-   Error states
-   Performance optimization

------------------------------------------------------------------------

# 40. Definition of Done

The MVP is ready for real-user testing when:

-   A user can start a session in under 10 seconds.
-   Both timer modes work correctly.
-   Pause time is excluded from actual focus duration.
-   Target completion works reliably.
-   Overtime works.
-   Music works without interfering with the timer.
-   Background media works without major performance issues.
-   Sessions persist after refresh.
-   History correctly reflects completed sessions.
-   The app works on modern desktop browsers.
-   The focus screen feels visually distinct from a normal dashboard.
-   No login is required.
-   No AI is required.
-   No backend is required.

------------------------------------------------------------------------

# 41. Future Product Direction

The MVP should eventually evolve from:

> **Timer + Music**

into:

> **Personal Focus Environment**

Possible future capabilities:

### Personalization

The app remembers:

> "When you code, you usually use Rainy Window + Ambient."

### Goals

``` text
Focus goal
10 hours / week

Progress
7h 20m / 10h
```

### Smart insights

``` text
You focus best between 9–11 AM.

Your average uninterrupted session:
64 minutes.

You've focused 18% more this week.
```

### AI

Only after sufficient user behavior exists:

> "Plan my afternoon."

AI can eventually use real focus history to make recommendations.

The AI should be an enhancement, not the reason the MVP exists.

------------------------------------------------------------------------

# 42. Product North Star

The product should ultimately own a specific mental association:

> **When I need to focus, I open Focus.**

Not:

> "I need music, so I open YouTube."

The strongest differentiator is therefore not the music library.

It is the **ritual + environment + focus history**.

The product should make starting focus feel as simple as:

``` text
Open Focus
     ↓
Press Start
     ↓
Disappear into the work
     ↓
Come back and see what you accomplished
```

------------------------------------------------------------------------

# 43. MVP Summary

### Must have

``` text
✓ Open Focus timer
✓ Target Focus timer
✓ Pause / Resume
✓ Target completion
✓ Overtime
✓ Optional task name
✓ Music selection
✓ Volume
✓ Animated/static backgrounds
✓ Full-screen Focus Mode
✓ Session persistence
✓ Focus history
✓ Basic statistics
✓ Responsive UI
```

### Not yet

``` text
✗ AI
✗ Login
✗ Backend
✗ Cloud sync
✗ Spotify
✗ YouTube
✗ Social
✗ Community
✗ Payments
✗ Advanced productivity planning
```

### Core promise

> **One thing. Right now.**

The MVP succeeds if it can make users prefer opening this website over
opening YouTube whenever they want to enter a focused work session.
