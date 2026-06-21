# Hotel Management System API

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

## Project structure

```
app/
├── main.py                 # App factory, CORS, router registration, OpenAPI BearerAuth
├── database.py             # Async engine, session factory, declarative Base
├── core/
│   ├── config.py           # Settings from .env (pydantic-settings)
│   ├── enums.py            # All domain enums
│   ├── security.py         # JWT encode/decode, bcrypt hashing
│   ├── dependencies.py     # get_db, get_current_user, require_role
│   ├── exceptions.py       # Custom exceptions + handlers
│   └── responses.py        # Envelope helpers (ok / paginate / fail)
├── models/                 # SQLAlchemy ORM models (one file per domain)
├── schemas/                # Pydantic v2 request/response schemas
├── routers/                # FastAPI routers (one per domain)
├── services/               # Business logic (one per domain)
├── repositories/           # DB queries (one per domain)
└── utils/                  # email, pdf, csv, refs, crypto helpers
alembic/                    # Async migration environment
seed.py                     # Default super_admin + sample rooms + sample guest
requirements.txt
.env.example
```

## Requirements

- Python 3.11+
- PostgreSQL 16

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# edit .env: set DATABASE_URL, SECRET_KEY, SMTP_*, FRONTEND_ORIGIN, FIRST_SUPERADMIN_*

# 4. Run database migrations
alembic revision --autogenerate -m "init"
alembic upgrade head

# 5. Seed default data (super_admin, sample rooms, sample guest)
python seed.py

# 6. Start the API
uvicorn app.main:app --reload
```

## Documentation

- Swagger UI: `http://localhost:8000/docs` (click **Authorize** and paste your access token)
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Authentication flow

1. `POST /auth/login` with `{ "username", "password" }` → `{ access_token, refresh_token, user }`.
2. Send `Authorization: Bearer <access_token>` on protected routes.
3. `POST /auth/refresh` with the refresh token to get a new access token.
4. `POST /auth/logout` to blacklist the refresh token.

The default super admin credentials come from `.env` (`FIRST_SUPERADMIN_USERNAME` / `FIRST_SUPERADMIN_PASSWORD`).

## RBAC summary

| Area | super_admin | receptionist |
|------|-------------|--------------|
| Financials | full | no access |
| Invoices | full | view only (GET) |
| Rooms create/update/delete | yes | no (status update only) |
| Reviews delete | yes | no |
| Settings | yes | no |
| Dashboard stats revenue | visible | `null` |
| Everything else | yes | yes |

## Conventions

- Monetary values use `Decimal(10, 2)`; the display currency is configured in hotel settings.
- `booking_ref` format: `HT-B{year}-{5-digit-seq}` (e.g. `HT-B2024-00042`).
- `invoice_ref` format: `INV-{year}-{5-digit-seq}` (e.g. `INV-2024-00007`).
- Booking totals: `nights = check_out - check_in`, `total = nights * price_per_night`.
- Overlapping bookings on the same room are rejected.

## Notes

- Email and PDF/crypto dependencies degrade gracefully if optional libraries or SMTP are unavailable, so the core API remains usable in development.
