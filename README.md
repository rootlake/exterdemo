# Harkness Tracker

A visual discussion map for Harkness-style classrooms at Phillips Exeter and beyond.

Track who speaks, trace the conversation flow around the oval table, and capture session notes — all in a polished, library-inspired interface.

## Live Demo

**https://rootlake.github.io/exterdemo/**

## Features

- **14-seat oval table** with warm oak styling
- **Editable participant names** and flexible teacher-seat marking
- **Click-to-track** speaking turns with numbered badges
- **Animated discussion paths** connecting speakers around the table
- **Session notes** panel for live observations
- **Export / import** sessions as JSON files

## Usage

1. **Setup** — Enter student names around the table. Right-click any seat to mark it as Teacher.
2. **Start Discussion** — Switch to discuss mode; names lock so clicks track speaking turns.
3. **Track** — Click a participant each time they speak. Numbered badges and connecting arcs show the conversation flow.
4. **Notes** — Jot observations in the sidebar as class unfolds.
5. **Export** — Save the session as JSON to archive or share. Use Import to restore a saved session.

## Local Development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build & Deploy

```bash
npm run build
```

The static site is output to `dist/`. GitHub Pages deployment is automated via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on pushes to `main`.

To enable Pages:
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to **GitHub Actions**

## Tech Stack

- Vite + TypeScript
- Vanilla DOM / SVG (no framework)
- GitHub Pages for hosting

## About

Built as a demo showcasing classroom discussion tooling for Exeter-style Harkness pedagogy — giving teachers a simple, visual way to observe participation patterns without adding friction to the classroom.
