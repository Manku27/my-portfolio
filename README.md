# Mayank Jhunjhunwala — Portfolio

> A playable 2D side-scrolling platformer that IS the portfolio. No nav bars, no links — the game world is the resume.

## What is this?

A Hollow Knight-inspired Canvas 2D platformer built in Next.js where visitors explore rooms to discover work history, projects, and timeline entries. The game IS the navigation.

- **Spawn room** — Central landing with name, signposts, and ambient atmosphere
- **Work world** (walk left) — Company buildings with detailed speech bubbles on approach
- **Timeline world** (walk right) — Life diary entries as environmental objects
- **Charm menu** (Tab) — Hollow Knight-style navigation overlay

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Canvas 2D — hand-rolled platformer physics, no game framework
- Trajan Pro + Perpetua typography
- Tailwind CSS v4 (UI only — game is pure canvas)
- Vercel (hosting)

## Controls

| Input | Action |
|---|---|
| ← → / A D | Move |
| Space / ↑ | Jump (double jump supported) |
| Tab | Open charm navigation |
| Enter | Advance dialogue pages |

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Live

[manku27.dev](https://manku27.dev)
