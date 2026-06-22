"Ненавижу быть собой (I Hate Being Me)" — Interactive Audio Experience

A sleek, atmospheric, and highly interactive single-track web audio player dedicated to the song "Ненавижу быть собой (I Hate Being Me)" by Три Дня Дождя (TDD). 

This project is built to master the HTML5 Audio API, advanced DOM manipulation, and modern CSS architecture without relying on heavy frameworks or third-party libraries.


⚡ The Concept: "Deceptive Minimalism"
Instead of building a generic, boring media player, this project focuses on a deeply immersive, high-fidelity user experience tailored to the raw, emotional grunge energy of the track. The UI acts as a transformer: it starts as a clean, light-themed minimalist page, but completely morphs into a dark, glowing neon visual experience the moment the user hits "Play".


🚀 Key Features

• Audio API Event-Driven Theme Switcher: The interface dynamically toggles between light and dark modes by listening directly to the native HTML5 `<audio>` element `play` and `pause` states.
•  BEM-Structured Architecture: Completely refactored HTML and CSS utilizing the BEM (Block, Element, Modifier) methodology for maximum maintainability and scalable code.
•  Strict Separation of Layout & Paint: CSS is strictly split into structural geometry (positioning, paddings, flexboxes) and thematic styling (colors, shadows, transitions) for clean state management via `.bg-playing`.
• Semantic Lyrics & Metadata Layout: Lyrics are organized into modular blocks with dedicated semantic headers (`.lyrics__part-title` for `[Припев]`, `[Куплет]`) and content rows (`.lyrics__line`).
• Custom Audio Controls (No Default Controls): Fully custom Play/Pause toggle logic, real-time dynamic time tracking (elapsed/remaining), and an interactive progress bar with scrubbing capabilities.


🛠️ Tech Stack & Methodologies

• HTML5: Semantic layouts and native `<audio>` element API integration.
• CSS3: BEM Methodology, CSS custom properties (variables), complex CSS transitions, and advanced text/box effects.
• JavaScript (Vanilla): Audio event listeners (`play`, `pause`, `timeupdate`), DOM manipulation, and dynamic time-formatting logic.


📈 Current Progress & Roadmap

- [x] Phase 1: Core Audio Engine — Custom play, pause, seek, and real-time progress tracking.
- [x] Phase 2: Architectural Refactoring — Transition from "div soup" to clean BEM structure and ~200 lines of optimized CSS.
- [x] Phase 3: State Sync — Successful integration of audio play states with the global UI theme transformer (`.bg-playing`).
- [ ] Phase 4 (In Progress): SVG Flow Animations — Implementation of custom neon vector contours around sections utilizing `stroke-dasharray` and `stroke-dashoffset` for real-time visual feedback.
- [ ] Phase 5: Glassmorphism Blur — Advanced backdrop-filtering for the header and footer components during active playback.


📂 Project Structure

music-player/
├── index.html   Semantic structure, audio element, lyrics and bio blocks
├── style.css    Layout geometry & paint variables (Light/Dark themes)
├── script.js    Audio engine, progress scrubbing, and event delegation
└── README.md    Project documentation & portfolio presentation

Developed by MarfinCLX
