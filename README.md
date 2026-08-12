MARFIN — Interactive Music Player Platform

A sleek, atmospheric, and highly interactive web music player built for a full catalog of tracks — not just a single song. Originally started as a one-track audio experience for "Ненавижу быть собой (I Hate Being Me)" by Три Дня Дождя (TDD), the project has since evolved into a multi-page, data-driven player that can host any number of artists, albums, singles and features.

This project is built to master the HTML5 Audio API, the Web Audio API (for real-time visualization), advanced DOM manipulation, and modern CSS architecture — without relying on heavy frameworks or third-party libraries.

⚡ The Concept: "Deceptive Minimalism"

Instead of a generic, boring media player, this project focuses on a deeply immersive, high-fidelity experience tailored to the raw, emotional grunge energy of the catalog. The UI acts as a transformer: it starts as a clean, glowing-neon-on-light landing page, and each player page morphs into a dark, glowing neon visual experience the moment the user hits "Play".

🚀 Key Features

- Multi-page flow**: `landing.html` → `catalog.html` → `player.html?id=N`, with a page loader (staged progress bar) softening every transition.
- Data-driven catalog**: all track metadata, lyrics, and bios live in `tracks.js` — the player, catalog page, and landing stats all read from this single source of truth.
- Dynamic player template**: `player.html` is not tied to any one song — it reads a track `id` from the URL and renders the cover, title, producers, lyrics (with timestamped highlighting), and bio for that track.
- Folder-style browsing**: the TRACKS search menu groups Albums by album and Singles/Feats by artist, drilling down into each group with a back button — instead of one long flat list.
- Track previews**: clicking a cover in the TRACKS menu plays a short preview with a circular progress ring (Spotify-style), correctly pausing/resuming the main player instead of overlapping audio.
- Audio API Event-Driven Theme Switcher**: the interface dynamically toggles between light and dark modes by listening to the native HTML5 `<audio>` `play`/`pause` states.
- Bass-reactive canvas visualizer**: built on the Web Audio API's `AnalyserNode`, reacting to bass, mid and treble frequency bands independently.
- Animated neon UI borders**: header, hero/player section, About block, and footer all get a "flowing then breathing" neon outline while a track is playing.
- Custom Audio Controls** (no default browser controls): play/pause toggle, real-time elapsed/remaining time, a scrubbing progress bar, and a stepped volume control.
- "Coming soon" locked state**: tracks without an uploaded audio file automatically render as locked/disabled everywhere (TRACKS menu, catalog) until filled in.
- Author tooling**: `add-track.html` (standalone track-data generator) and `extract-track.js` (console script to migrate legacy hardcoded pages into the JSON schema) — used to grow the catalog without hand-editing JSON by hand.

🛠 Tech Stack & Methodologies

- HTML5: Semantic layouts and native `<audio>` element API integration.
- CSS3: custom properties (variables), complex transitions/keyframe animations, `clip-path` for the cyberpunk UI shapes, SVG stroke animations for the neon borders.
- JavaScript (Vanilla): Audio event listeners (`play`, `pause`, `timeupdate`, `ended`), the Web Audio API (`AnalyserNode`) for the visualizer, `URLSearchParams` for dynamic routing, and DOM manipulation for rendering tracks/lyrics/catalog entries from data.

✅ Current Progress & Roadmap

- [x] Phase 1: Core Audio Engine — custom play, pause, seek, real-time progress tracking.
- [x] Phase 2: Architectural Refactoring — clean structural CSS.
- [x] Phase 3: State Sync — audio play state synced with the global UI theme transformer (`.bg-playing`).
- [x] Phase 4: SVG Flow Animations — neon vector contours around header/hero/about/footer using `stroke-dasharray`/`stroke-dashoffset`, with a continuous "breathing" pulse.
- [x] Phase 5: Multi-track architecture — `tracks.js` schema, dynamic `player.html`, `catalog.html`, `landing.html`.
- [x] Phase 6: Track previews with circular progress indicator.
- [x] Phase 7: Folder-style Albums/Singles/Feats browsing.
- [x] Phase 8: Page loader with staged progress.
- [ ] Phase 9: Populate the catalog — add remaining songs via `add-track.html`.
- [ ] Phase 10: Glassmorphism Blur — advanced backdrop-filtering for the header/footer during active playback.

📁 Project Structure

```
music-player/
├── landing.html        Entry page — animated logo, live catalog stats
├── landing.js
├── landing.css
├── catalog.html       Browse all tracks grouped by artist
├── catalog.css 
├── catalog.js
├── player.html           Dynamic player template (renders by ?id=)
├── player.js               Audio engine, visualizer, previews, routing, neon borders
├── player.css              Layout geometry & paint (light/dark themes)
├── tracks.js               Single source of truth: metadata, lyrics, bios
├── add-track.html         Author tool — generates track objects for tracks.js
├── extract-track.js        Author tool — migrates a legacy hardcoded page into JSON
└── README.md                Project documentation
```

Developed by MarfinCLX
