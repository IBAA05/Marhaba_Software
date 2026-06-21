# 🏨 Aurelia — Luxury Hotel Management System (Frontend)

A production-ready, desktop-first admin dashboard for hotel operations, built with **React 18 + Vite + TypeScript**. It pairs with the FastAPI **Hotel Management System** backend (the `hotel-api` package).

---

## ✨ Features

- **Authentication** — JWT login with access + refresh tokens, auto-refresh on `401`, role-based access (`super_admin`, `receptionist`).
- **Dashboard** — 4 animated count-up stat cards, room availability, rating breakdown, revenue area chart, platform donut, reservations bar chart, tasks, recent bookings, and live activity feed.
- **Reservations** — Full horizontally-scrollable **Gantt timeline** with collapsible room-type groups, per-day availability counters, status-colored booking bars, booking detail drawer, and an add-booking modal with live price preview.
- **Rooms** — Room-type card grid, detail side panel, add/edit drawer with amenity multi-select and panorama toggle.
- **Guests** — Sortable, paginated table with loyalty tiers + full guest profile page (history, invoices, loyalty progress).
- **Messages** — 3-column inbox (conversation list / chat thread / guest mini-profile).
- **Housekeeping** — Board + list views with a task status stepper.
- **Inventory** — Stock tracking, restock modal, and CSV export.
- **Calendar** — Month/week grid with arrivals & departures day drawer.
- **Financials** `[super_admin]` — Balance/income/expense cards, earnings bar chart, expense donut, transactions table.
- **Invoices** — Filterable table + invoice detail modal with **client-side PDF download** (jsPDF + html2canvas).
- **Reviews** — Rating summary, review cards, inline replies.
- **Concierge** — Request tracking with add-request drawer.
- **Settings** `[super_admin]` — General / Operations / Notifications / Staff tabs.
- **Profile** — Edit details + change password.
- **Global** — Cmd+K command palette (searches guests, rooms, bookings), notification center, dark mode, 404 page, and a global error boundary.

---

## 🧱 Tech Stack

| Concern | Library |
| --- | --- |
| Framework | React 18 + Vite |
| Language | TypeScript 5 |
| Routing | React Router v6 (protected routes per role) |
| State | Zustand (auth / theme / notification stores) |
| Data fetching | TanStack Query v5 |
| HTTP | Axios (JWT attach + auto-refresh interceptors) |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Toasts | React Hot Toast |
| Dates | date-fns |
| PDF | jsPDF + html2canvas |
| Icons | Lucide React |

---

## 🚀 Getting Started

> **Note:** dependencies are **not** bundled. Install them with network access.

```bash
# 1. Install dependencies
npm install

# 2. Configure the API base URL
cp .env.example .env
# then edit .env:
#   VITE_API_BASE_URL=http://localhost:8000

# 3. Run the dev server
npm run dev

# 4. Build for production
npm run build && npm run preview
```

### Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

---

## 📂 Project Structure

```
src/
├── api/            # Axios endpoint definitions (one object per resource)
├── components/
│   ├── ui/         # Reusable primitives (Button, Card, Table, Modal, Drawer…)
│   ├── layout/     # Sidebar, Topbar, AppLayout, guards, command palette
│   └── ErrorBoundary.tsx
├── features/
│   └── reservations/  # Gantt-specific drawer + add-booking modal
├── hooks/          # useAuth + TanStack Query hooks (queries.ts)
├── lib/            # axios, queryClient, utils, statusColors
├── pages/          # One component per route
├── stores/         # Zustand stores
├── types/          # Shared TS types + enums mirroring the backend
├── App.tsx         # Route table
└── main.tsx        # Providers (Query, Router, Toaster, ErrorBoundary)
```

---

## 🎨 Design System

- **Primary Gold** `#F5C842` — the single accent color (buttons, active nav, chart series #1, badges).
- **Typography** — *Plus Jakarta Sans* (headings) + *Inter* (body & tabular numbers).
- White cards with subtle shadows, gold left-border stat cards, pill status badges, 400px right-slide drawers, blurred-backdrop modals, skeleton loaders, and 200ms transitions.
- **Dark mode** toggled via Zustand + `localStorage` (`dark` class strategy).
- Optimized for desktop (min width 1280px).

---

## 🔐 Roles

| Page | super_admin | receptionist |
| --- | :---: | :---: |
| Dashboard, Reservations, Rooms, Guests, Messages, Housekeeping, Inventory, Calendar, Invoices, Reviews, Concierge | ✅ | ✅ |
| Financials | ✅ | — |
| Settings | ✅ | — |

Unauthorized access redirects to `/dashboard` with a toast.

---

## 📜 Available Scripts

| Script | Action |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

Built to pair with the **Hotel Management System API** (FastAPI + PostgreSQL).
