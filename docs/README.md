# Focus — Docs

Implementation docs for the current state of the app. The original product vision lives in `../focus-web-app-mvp-spec.md`.

| Doc | What it covers |
| --- | --- |
| [features.md](features.md) | Everything the app does today, feature by feature |
| [logic.md](logic.md) | Timer engine, state machine, stores, persistence, audio, stats |
| [architecture.md](architecture.md) | File structure, component tree, data flow |

## Spec vs shipped

The spec describes the target product; these are the deliberate gaps in the current code:

- **Single page.** `/`, `/focus`, `/history`, `/settings` collapsed into `/`; History and Settings are dialogs.
- **Setup is a bottom sheet** opened by a bottom-center "Start focus" pill CTA, not an inline form. There is **no environment picker** — the remembered pair (or `quiet`) is applied silently.
- **One fixed background video** (`270507_small.mp4`) for every screen. Per-environment video backgrounds are data-only.
- **Music playback is not wired.** The `musicPlayer` singleton exists and the volume slider updates it, but no track is ever selected or played.
- **Zen Mode** (fade the chrome) is an addition not in the spec.

For the agent-oriented quick reference (commands, conventions, gotchas) see `../AGENTS.md`.
