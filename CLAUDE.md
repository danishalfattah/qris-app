# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- **Dev server:** `npm run dev` (runs on http://localhost:3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (runs ESLint 9 flat config)
- **Start production:** `npm run start`

No test framework is configured.

## Architecture

QRIS Pay is an Indonesian mobile QRIS payment app built as a **Next.js 16** App Router project with **React 19**, **Tailwind CSS v4**, and **shadcn/ui v4**. The UI is Indonesian-language (Bahasa Indonesia) throughout.

### Key Stack Details
- **Next.js 16.2.2** — breaking changes from earlier versions; always read `node_modules/next/dist/docs/` before using Next.js APIs
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@theme inline` in globals.css, NOT the v3 `tailwind.config.js` approach
- **shadcn/ui v4** — UI primitives in `components/ui/` built on `@base-ui/react`, `class-variance-authority`, `clsx`, and `tailwind-merge`
- **QR scanning:** `html5-qrcode` library, dynamically imported to avoid SSR issues (see `components/QrScanner.tsx`)

### Layout & Routing
- All pages use the App Router (`app/` directory) — every page is a Client Component (`"use client"`)
- Root layout (`app/layout.tsx`) wraps everything in `AuthProvider` and a `div.mobile-shell` container
- `reactStrictMode` is disabled in `next.config.ts`

### Pages
| Route | Purpose |
|---|---|
| `/` | Home dashboard (balance, quick actions, recent transactions) |
| `/login` | Login page |
| `/scan` | QR code scanner |
| `/scan/result` | Payment confirmation after scan |
| `/balance` | Account balance details |
| `/history` | Transaction history |
| `/profile` | User profile |

### Core Patterns
- **Auth:** Context-based via `lib/auth.tsx` — `AuthProvider` + `useAuth()` hook. Session stored in localStorage. All authenticated pages wrap content in `AppShell` which redirects to `/login` if not authenticated.
- **Mock data:** All backend data is mocked in `lib/mock-data.ts`. Types are in `lib/types.ts`. No real API calls yet.
- **Path aliases:** `@/*` maps to project root (e.g., `@/components/...`, `@/lib/...`)

### Styling
- Custom color palette with `octo-` prefix (red, gray, green, gold, blue) defined as CSS custom properties in `globals.css`
- Mobile-first design with `.mobile-shell` constraining layout to phone dimensions
- Custom utility classes: `.octo-gradient`, `.pb-nav`, `.scan-line`, `.fade-in` animations
