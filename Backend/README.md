# Marhaba — Hotel Management System API

A production-ready REST API for hotel operations built with **FastAPI**, **PostgreSQL 16**, async **SQLAlchemy**, **Alembic**, and **Pydantic v2**. It ships JWT authentication (access + refresh), bcrypt password hashing, role-based access control, auto-generated Swagger UI / ReDoc, PDF invoices, CSV exports, and async SMTP email.

## Features

- **Clean layered architecture** — `routers/` → `services/` → `repositories/` → `models/`, with `schemas/` (Pydantic v2) for all I/O.
- **JWT auth** — 30-minute access tokens, 7-day refresh tokens, refresh-token blacklist on logout, bcrypt hashing.
- **RBAC** — `super_admin` and `receptionist` roles enforced at the router/dependency layer.
- **Standard response envelope** — `{ "success": bool, "data": any, "message": str, "pagination"?: {...} }`.
- **Soft deletes** on rooms, guests, and bookings.
- **Domain modules** — auth, rooms, guests, bookings, housekeeping, inventory, messages, financials, invoices, reviews, concierge, dashboard, calendar, settings, notifications.
- **PDF invoices** (ReportLab) and **CSV exports** for inventory and expenses.
- **Async SMTP email** (aiosmtplib) for booking confirmations, invoices, and guest notifications.

---

## Project Structure

```
Marhaba_Software/
├── start_marhaba.sh            # One-click backend launcher
├── start_frontend.sh           # One-click frontend launcher (uses nvm)
├── build_frontend.sh           # Frontend build script (uses nvm + tsc)
│
├── Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # App factory, CORS, router registration, OpenAPI
│   │   ├── database.py             # Async engine, session factory, declarative Base
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Settings from .env (pydantic-settings)
│   │   │   ├── dependencies.py     # get_db, get_current_user, require_role
│   │   │   ├── enums.py            # All domain enums
│   │   │   ├── exceptions.py       # Custom exceptions + handlers
│   │   │   ├── responses.py        # Envelope helpers (ok / paginate / fail)
│   │   │   └── security.py         # JWT encode/decode, bcrypt hashing
│   │   ├── models/
│   │   │   ├── __init__.py         # Re-exports all models
│   │   │   ├── base.py             # SoftDeleteMixin, TimestampMixin
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── guest.py
│   │   │   ├── booking.py
│   │   │   ├── housekeeping.py
│   │   │   ├── inventory.py
│   │   │   ├── message.py
│   │   │   ├── expense.py
│   │   │   ├── invoice.py
│   │   │   ├── review.py
│   │   │   ├── concierge.py
│   │   │   ├── notification.py
│   │   │   ├── settings.py
│   │   │   └── token_blacklist.py
│   │   ├── schemas/                # Pydantic v2 request/response schemas
│   │   │   ├── __init__.py
│   │   │   ├── common.py           # ORMModel base, pagination helpers
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── guest.py
│   │   │   ├── booking.py
│   │   │   ├── housekeeping.py
│   │   │   ├── inventory.py
│   │   │   ├── message.py
│   │   │   ├── expense.py
│   │   │   ├── invoice.py
│   │   │   ├── review.py
│   │   │   ├── concierge.py
│   │   │   ├── dashboard.py
│   │   │   ├── notification.py
│   │   │   └── settings.py
│   │   ├── routers/                # FastAPI routers (one per domain)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── rooms.py
│   │   │   ├── guests.py
│   │   │   ├── bookings.py
│   │   │   ├── housekeeping.py
│   │   │   ├── inventory.py
│   │   │   ├── messages.py
│   │   │   ├── financials.py
│   │   │   ├── invoices.py
│   │   │   ├── reviews.py
│   │   │   ├── concierge.py
│   │   │   ├── dashboard.py
│   │   │   ├── calendar.py
│   │   │   ├── notifications.py
│   │   │   └── settings.py
│   │   ├── services/               # Business logic (one per domain)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── room.py
│   │   │   ├── guest.py
│   │   │   ├── booking.py
│   │   │   ├── housekeeping.py
│   │   │   ├── inventory.py
│   │   │   ├── message.py
│   │   │   ├── expense.py
│   │   │   ├── invoice.py
│   │   │   ├── review.py
│   │   │   ├── concierge.py
│   │   │   ├── dashboard.py
│   │   │   ├── notification.py
│   │   │   └── settings.py
│   │   ├── repositories/           # DB queries (one per domain)
│   │   │   ├── __init__.py
│   │   │   ├── base.py             # Generic CRUD base repository
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── guest.py
│   │   │   ├── booking.py
│   │   │   ├── housekeeping.py
│   │   │   ├── inventory.py
│   │   │   ├── message.py
│   │   │   ├── expense.py
│   │   │   ├── invoice.py
│   │   │   ├── review.py
│   │   │   ├── concierge.py
│   │   │   ├── notification.py
│   │   │   ├── settings.py
│   │   │   └── token_blacklist.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── email.py            # Async SMTP sender
│   │       ├── pdf.py              # ReportLab PDF invoice generator
│   │       └── security_crypto.py  # Encryption helpers
│   ├── alembic/                    # Async migration environment
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── README
│   ├── alembic.ini
│   ├── seed.py                     # Default super_admin + sample rooms + sample guest
│   ├── requirements.txt
│   └── README.md                   # ← You are here
│
└── Frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx                # React root + QueryClient + Router
        ├── App.tsx                 # Route configuration + AuthProvider
        ├── index.css               # Global styles + Tailwind
        ├── vite-env.d.ts
        ├── api/
        │   └── endpoints.ts        # Typed API client (all backend endpoints)
        ├── components/
        │   ├── ErrorBoundary.tsx
        │   ├── layout/
        │   │   ├── AppLayout.tsx    # Sidebar + Topbar wrapper
        │   │   ├── Sidebar.tsx
        │   │   ├── Topbar.tsx
        │   │   ├── CommandPalette.tsx
        │   │   ├── RequireAuth.tsx
        │   │   ├── RequireRole.tsx
        │   │   └── navItems.ts     # Navigation menu configuration
        │   └── ui/                 # 16 reusable UI primitives
        │       ├── index.ts
        │       ├── Avatar.tsx
        │       ├── Badge.tsx
        │       ├── Button.tsx
        │       ├── Card.tsx
        │       ├── Drawer.tsx
        │       ├── EmptyState.tsx
        │       ├── Input.tsx
        │       ├── Modal.tsx
        │       ├── Pagination.tsx
        │       ├── Select.tsx
        │       ├── Skeleton.tsx
        │       ├── Spinner.tsx
        │       ├── StatCard.tsx
        │       ├── StatusBadge.tsx
        │       ├── Table.tsx
        │       └── Toggle.tsx
        ├── hooks/
        │   ├── queries.ts          # React Query hooks (all domains)
        │   └── useAuth.ts          # Login, logout, refresh mutations
        ├── lib/
        │   ├── axios.ts            # Axios instance + auth interceptors
        │   ├── queryClient.ts      # React Query client config
        │   ├── statusColors.ts     # Color palettes for badges/charts
        │   └── utils.ts            # cn(), formatCurrency, timeAgo, etc.
        ├── pages/                  # 18 page components
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── ReservationsPage.tsx
        │   ├── RoomsPage.tsx
        │   ├── GuestsPage.tsx
        │   ├── GuestProfilePage.tsx
        │   ├── MessagesPage.tsx
        │   ├── HousekeepingPage.tsx
        │   ├── InventoryPage.tsx
        │   ├── CalendarPage.tsx
        │   ├── FinancialsPage.tsx
        │   ├── InvoicesPage.tsx
        │   ├── ReviewsPage.tsx
        │   ├── ConciergePage.tsx
        │   ├── SettingsPage.tsx
        │   ├── ProfilePage.tsx
        │   ├── NotificationsPage.tsx
        │   └── NotFoundPage.tsx
        ├── stores/                 # Zustand stores
        │   ├── authStore.ts        # JWT tokens + user state
        │   ├── themeStore.ts       # Dark mode + sidebar collapse
        │   └── notificationStore.ts
        └── types/
            └── index.ts            # All TypeScript interfaces & enums
```

---

## Requirements

| Dependency    | Version      | Notes                          |
|---------------|-------------|--------------------------------|
| Python        | 3.10+       |                                |
| PostgreSQL    | 14+         | Must be running on port 5432   |
| Node.js       | 18.x        | **Use `nvm use 18`** — do NOT use system Node |
| npm           | 10.x        | Comes with Node 18             |

---

## Installation Guide

### 1. Install PostgreSQL (if not already installed)

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start the service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create the Database and User

```bash
sudo -u postgres psql -c "CREATE USER hotel WITH PASSWORD 'hotel' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE hotel OWNER hotel;"
```

### 3. Set Up the Backend

```bash
cd Backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed default data (super_admin account + sample rooms + sample guest)
python seed.py
```

> **⚠️ Important:** After seeding, the admin email is `admin@example.com`.
> If you see a Pydantic email validation error, update the admin email:
> ```bash
> sudo -u postgres psql -d hotel -c "UPDATE users SET email = 'admin@example.com' WHERE username = 'admin';"
> ```

### 4. Start the Backend

```bash
cd Backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the helper script from the project root:
```bash
bash start_marhaba.sh
```

The API will be available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### 5. Set Up the Frontend

```bash
# Install NVM if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh

# Install and use Node 18 (REQUIRED — system Node may cause build errors)
nvm install 18
nvm use 18

cd Frontend
npm install
npm run dev
```

Or use the helper script from the project root:
```bash
bash start_frontend.sh
```

The frontend will be available at: **http://localhost:5173**

### 6. Login

Use the default credentials created by the seed script:

| Field     | Value          |
|-----------|----------------|
| Username  | `admin`        |
| Password  | `Admin@12345`  |

---

## Authentication Flow

1. `POST /auth/login` with `{ "username", "password" }` → `{ access_token, refresh_token, user }`.
2. Send `Authorization: Bearer <access_token>` on protected routes.
3. `POST /auth/refresh` with the refresh token to get a new access token.
4. `POST /auth/logout` to blacklist the refresh token.

---

## RBAC Summary

| Area                        | super_admin | receptionist     |
|-----------------------------|-------------|------------------|
| Financials                  | full        | no access        |
| Invoices                    | full        | view only (GET)  |
| Rooms create/update/delete  | yes         | no (status only) |
| Reviews delete              | yes         | no               |
| Settings                    | yes         | no               |
| Dashboard revenue stats     | visible     | `null`           |
| Everything else             | yes         | yes              |

---

## Conventions

- Monetary values use `Decimal(10, 2)`; the display currency is configured in hotel settings.
- `booking_ref` format: `HT-B{year}-{5-digit-seq}` (e.g. `HT-B2024-00042`).
- `invoice_ref` format: `INV-{year}-{5-digit-seq}` (e.g. `INV-2024-00007`).
- Booking totals: `nights = check_out - check_in`, `total = nights * price_per_night`.
- Overlapping bookings on the same room are rejected.

---

## Troubleshooting

### "Network Error" on login
1. **PostgreSQL not running:** `sudo systemctl start postgresql`
2. **CORS mismatch:** The backend must allow the frontend origin. Check `FRONTEND_ORIGIN` in `app/core/config.py` includes `http://localhost:5173`.
3. **Email validation error:** Pydantic rejects `.local` domains. Update the admin email:
   ```bash
   sudo -u postgres psql -d hotel -c "UPDATE users SET email = 'admin@example.com' WHERE username = 'admin';"
   ```

### White/blank page on the frontend
1. **Check the browser console** (F12 → Console) for the exact error.
2. **Node version issue:** Always use `nvm use 18` before running `npm run dev`.
3. **Icon import error:** The app uses `ConciergeBell` from `lucide-react` (not `Concierge`).

### Backend crashes with `ConnectionRefusedError`
PostgreSQL is not running or the database doesn't exist:
```bash
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE hotel OWNER hotel;"
```

---

## Notes

- Email and PDF/crypto dependencies degrade gracefully if optional libraries or SMTP are unavailable, so the core API remains usable in development.
- The `start_marhaba.sh` script handles killing any existing process on port 8000, setting up the virtualenv, and starting the backend.
- The `start_frontend.sh` script automatically installs NVM, switches to Node 18, and runs `npm run dev`.
