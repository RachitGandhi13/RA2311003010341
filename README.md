# AffordMed — Campus Notification System

A full-stack campus notification system that surfaces the most important unread notifications using an algorithmic priority ranking engine. Built in two stages: a Node.js CLI that implements the core algorithm, and a Next.js web dashboard that exposes it through a polished, production-quality UI.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Stage 1 — Priority Inbox Algorithm](#stage-1--priority-inbox-algorithm)
  - [Scoring Formula](#scoring-formula)
  - [Data Structure](#data-structure)
  - [Complexity](#complexity)
  - [Running Stage 1](#running-stage-1)
- [Stage 2 — Web Dashboard](#stage-2--web-dashboard)
  - [Pages](#pages)
  - [Components](#components)
  - [Running Stage 2](#running-stage-2)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)

---

## Overview

AffordMed receives a stream of campus notifications — placement opportunities, exam results, and events — and must surface the most important ones instantly. With hundreds or thousands of notifications in flight, naively re-sorting the full list on every update is prohibitively expensive.

The system solves this with a **bounded min-heap of size K** that maintains the top-K notifications in O(log K) per insertion and O(1) worst-item lookup, regardless of total notification volume. A composite priority score ensures `Placement > Result > Event` at all times, with recency as the tiebreaker within each type.

Stage 2 wraps this algorithm in a live-updating web dashboard with filtering, pagination, rank medals, read/unread tracking, and auto-refresh.

---

## Project Structure

```
RA2311003010341/
└── frontend/
    ├── stage1/                          # Node.js CLI — algorithm implementation
    │   ├── src/
    │   │   ├── index.ts                 # Entry point
    │   │   ├── api.ts                   # Axios API client
    │   │   ├── scorer.ts                # Composite score function
    │   │   ├── priorityQueue.ts         # Bounded MinHeap<K>
    │   │   ├── logger.ts                # Custom logging middleware
    │   │   └── types.ts                 # TypeScript interfaces
    │   ├── Notification_System_Design.md
    │   ├── package.json
    │   └── tsconfig.json
    │
    └── stage2/                          # Next.js web dashboard
        ├── app/
        │   ├── layout.tsx               # Root layout — sidebar + mobile nav
        │   ├── page.tsx                 # Redirect to /all-notifications
        │   ├── all-notifications/
        │   │   └── page.tsx             # Paginated notification feed
        │   └── priority-inbox/
        │       └── page.tsx             # AI-ranked top-K view
        ├── components/
        │   ├── Sidebar.tsx              # Desktop sidebar navigation
        │   ├── NavBar.tsx               # Mobile top bar + drawer
        │   ├── NotificationCard.tsx     # Notification card with priority styling
        │   ├── FilterBar.tsx            # Reusable type filter + dropdown
        │   └── ThemeRegistry.tsx        # MUI theme provider
        ├── lib/
        │   ├── api.ts                   # Axios client + fallback data
        │   ├── logger.ts                # Browser/server structured logger
        │   ├── priorityQueue.ts         # MinHeap reused from Stage 1
        │   ├── types.ts                 # Shared TypeScript interfaces
        │   └── theme.ts                 # MUI custom theme
        ├── package.json
        └── tsconfig.json
```

---

## Stage 1 — Priority Inbox Algorithm

### Scoring Formula

Every notification receives a composite integer score:

```
score = TYPE_WEIGHT × RECENCY_SCALE + epoch_seconds(Timestamp)

RECENCY_SCALE = 10,000,000,000  (10^10)

TYPE_WEIGHT:
  Placement  →  3
  Result     →  2
  Event      →  1
```

**Why this formula?**

- **Type always dominates recency.** The scale factor (≈ 317 years of epoch time) is large enough that a Placement will always outscore a Result or Event regardless of relative age. The strict `Placement > Result > Event` ordering is enforced algebraically, not by branching logic.
- **Recency is the natural tiebreaker within a type.** `epoch_seconds` is monotonically increasing — newer timestamps produce larger values — so within the same type tier, newer notifications rank higher automatically.
- **No floating-point ambiguity.** All values are integers; scores are exact and comparable with `===`.

### Data Structure

A **bounded min-heap of capacity K** maintains the top-K notifications at all times.

**Invariant:** the root always holds the *lowest-scoring* item in the current top-K set.

**Insertion algorithm (O(log K)):**

```
push(newItem):
  if heap.size < K:
    heap.insert(newItem)           // heap not full yet — always accept
  elif newItem.score > heap.root.score:
    heap.root = newItem
    heap.siftDown(root)            // displace the current worst item
  else:
    discard newItem                // not in top-K — O(1) rejection
```

**Why a min-heap rather than a max-heap?**

A min-heap exposes the worst item in the current top-K at O(1) via the root. Each new notification is compared against this worst item in constant time. A max-heap would require scanning all K items to locate the minimum — O(K) — which defeats the purpose of the structure.

### Complexity

| Operation | Time | Space |
|---|---|---|
| Initial batch of N notifications | O(N log K) | O(K) |
| Single streaming arrival | O(log K) | O(1) |
| Extract top-K sorted | O(K log K) | O(K) |

For K = 10, N = 10,000: at most 10 comparisons per notification vs. 10,000 for a full re-sort. The heap never grows beyond K items — memory is bounded regardless of notification volume.

### Running Stage 1

```bash
cd frontend/stage1
npm install

# Development (ts-node, no build step)
npm run dev

# Production
npm run build
npm start
```

The CLI fetches notifications from the live API, scores them, runs the heap, and prints a ranked table to stdout. If the API is unreachable it falls back to hardcoded evaluation data.

---

## Stage 2 — Web Dashboard

A Next.js App Router application that reuses the Stage 1 algorithm and exposes it through a live-updating dashboard.

### Pages

**`/all-notifications`**

- Full paginated list of campus notifications
- Configurable page size (5 / 10 / 20 per page)
- Type filter chips (All · Placement · Result · Event)
- Mark individual notifications read / unread
- Auto-refreshes every 30 seconds
- Card-shaped loading skeletons while fetching
- Empty state with contextual message

**`/priority-inbox`**

- Top-K notifications ranked by the MinHeap algorithm
- Configurable K (10 / 15 / 20)
- Same type filter chips
- Algorithm stats banner (score range, result count vs. total fetched, complexity label)
- Rank medals for positions 1–3 (🥇🥈🥉), numbered badge for the rest
- Priority score shown on each card

### Components

| Component | Description |
|---|---|
| `Sidebar` | Dark-themed persistent sidebar on desktop (≥ lg breakpoint). Logo, nav links with active state, auto-refresh note. |
| `NavBar` | Mobile-only top app bar (< lg). Hamburger opens a slide-out drawer with the same nav links. |
| `NotificationCard` | Notification card with rounded type icon, left accent border, type-coloured background tint, glow shadow for unread, pulsing dot indicator, and hover elevation animation. Priority is instantly visually distinguishable: Placement (emerald, 4px border), Result (amber, 3px), Event (blue, 3px). |
| `FilterBar` | Reusable pill chips for type filtering + a dropdown (per-page or top-N depending on context). Used identically on both pages. |

**Priority visual hierarchy at a glance:**

| Type | Border | Glow | Background |
|---|---|---|---|
| Placement | 4px `#059669` (emerald) | Strong green | Faint green tint |
| Result | 3px `#D97706` (amber) | Amber | Faint amber tint |
| Event | 3px `#2563EB` (blue) | Subtle blue | Faint blue tint |

### Running Stage 2

```bash
cd frontend/stage2
npm install

# Development server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start

# Lint
npm run lint
```

The app redirects `/` to `/all-notifications` by default.

---

## API Reference

Notifications are fetched from:

```
GET http://20.207.122.201/evaluation-service/notifications
```

**Query parameters (Stage 2):**

| Parameter | Type | Description |
|---|---|---|
| `limit` | number | Maximum notifications to return |
| `page` | number | Page number (1-indexed) |
| `notification_type` | string | Filter by `Placement`, `Result`, or `Event` |

**Fallback:** both stages include hardcoded evaluation data that is served automatically when the API is unreachable.

---

## Data Model

```typescript
interface Notification {
  ID:        string;           // UUID
  Type:      "Placement" | "Result" | "Event";
  Message:   string;
  Timestamp: string;           // ISO 8601 — e.g. "2026-04-22T17:51:30"
}

interface ScoredNotification {
  notification: Notification;
  score:        number;        // composite integer score
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.3+ |
| Runtime | Node.js |
| Frontend framework | Next.js 16 (App Router) |
| UI library | React 19 |
| Component library | Material UI (MUI) v9 |
| Styling | Emotion (CSS-in-JS, via MUI) |
| HTTP client | Axios |
| Stage 1 dev runner | ts-node |
| Linting | ESLint 9 |
