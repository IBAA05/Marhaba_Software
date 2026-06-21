<div align="center">

<br />

```
  __  __            _           _           
 |  \/  | __ _ _ __| |__   __ _| |__   __ _ 
 | |\/| |/ _` | '__| '_ \ / _` | '_ \ / _` |
 | |  | | (_| | |  | | | | (_| | |_) | (_| |
 |_|  |_|\__,_|_|  |_| |_|\__,_|_.__/ \__,_|
                                             
        S  O  F  T  W  A  R  E
```

### **The luxury hotel management platform built for modern hospitality**

<br />

![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-async-D71F00?style=for-the-badge&logo=python&logoColor=white)

<br />

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Roles & Permissions](#-roles--permissions)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🌐 Overview

**Marhaba Software** is a full-featured, production-grade hotel management system designed for modern hospitality operations. Built with an elegant luxury aesthetic and engineered for reliability, it centralizes every aspect of hotel management — from real-time Gantt-style booking timelines and guest relationship management to housekeeping coordination, financial reporting, and concierge services — all within a single, unified platform.

Marhaba provides hotel staff and management with the clarity and tools they need to deliver an exceptional guest experience, while giving ownership real-time visibility into operational performance and revenue through intelligent dashboards and rich analytics.

> *مرحبا — Welcome. Built for hotels that take hospitality seriously.*

---

## ✨ Features

### 🔐 Authentication & Access Control
- Secure JWT-based login with access token + refresh token strategy
- Role-based access control: **Super Admin** and **Receptionist**
- Auto token refresh on expiry via Axios interceptors
- Session persistence with httpOnly cookie support
- Per-route and per-field permission enforcement

---

### 📊 Dashboard
- Live animated stat counters: new bookings today, check-ins, check-outs, monthly revenue
- Room availability breakdown: Occupied · Reserved · Available · Need Ready
- 6-month revenue area chart with period selector
- Last 7 days reservations bar chart (Booked vs Cancelled)
- Booking by platform donut chart (Direct, Booking.com, Airbnb, Expedia, Others)
- Recent bookings mini-table with status badges
- Overall guest rating card with sub-category progress bars
- Upcoming tasks widget
- Real-time recent activity feed

---

### 📅 Reservations — Gantt Timeline
- Full horizontal Gantt-style booking calendar (day-level precision)
- Year and month navigator with smooth scroll
- Collapsible room type groups (Single, Double, Suite, Family, Deluxe)
- Color-coded booking bars per status (8 distinct statuses)
- Per-day availability counter badges per room type (green / red / gray)
- Hover tooltip cards showing guest name, dates, booking ref, and status
- Click booking bar → slide-in detail drawer with full booking info and actions
- Click empty slot → pre-filled Add Booking modal
- Top bar with filters: Housekeeping · Facilities · Room Types · Booking Options
- Booking search by reference number or guest name
- Full legend bar (New · Confirmed · Due In · Checked In · Due Out · Checked Out · Booking Offer · Out of Order)

---

### 🛏️ Room Management
- Photo-rich room type cards with amenities, capacity, and price per night
- Room detail side panel with current guest info and upcoming reservations
- Add / edit rooms with amenities multi-select, photos, panorama flag, and status
- Real-time room status updates (Available / Occupied / Reserved / Out of Order / Need Ready / Cleaning)
- Availability query by date range and room type for booking conflict prevention

---

### 👤 Guest Profiles
- Full guest registry with search by name, email, phone, or booking ID
- Guest loyalty tier system: None · Bronze · Silver · Gold (auto-computed by stay count)
- Guest detail page with tabs: Personal Info · Booking History · Invoices
- Send email notification directly to guest from their profile
- Loyalty progress bar tracking path to next tier

---

### 💬 Messages
- Three-column inbox: conversation list · chat thread · guest mini-profile panel
- Staff and guest message bubbles with timestamps
- Unread badge counts and flagged conversation filter
- Inline guest profile panel with room info and invoice quick links
- Attachment support

---

### 🧹 Housekeeping
- Visual room status board (grid view): Clean · Dirty · In Progress · Inspected · Out of Order
- Task list view with priority badges and due times
- Assign cleaning or inspection tasks to staff
- Status stepper: Pending → In Progress → Completed → Inspected
- Filter by floor, room type, or task status
- Auto-trigger room status update after guest checkout

---

### 📦 Inventory
- Full supply catalog: Linens · Toiletries · Minibar · Cleaning · Maintenance
- Stock status indicators: Sufficient · Low Stock · Out of Stock
- Restock action with quantity update and last-restocked date
- Reorder level threshold alerts
- Export full inventory list as CSV

---

### 📅 Calendar
- Full monthly calendar view with per-day booking, check-in, and check-out counts
- Color-coded day indicators per booking status
- Click any day → drawer listing all arrivals and departures with full details
- Week / Month view toggle
- Quick Add Booking directly from any calendar day cell

---

### 💰 Financials *(Super Admin only)*
- Overview cards: Total Balance · Total Income · Total Expenses with trend indicators
- Monthly earnings grouped bar chart (Income vs Expense, full year)
- Expense breakdown donut chart by category with percentage labels
- Transactions table filterable by category, status, and date range
- Expense management: add, edit, and delete expense records
- Export transactions to CSV or PDF

---

### 🧾 Invoices
- Auto-generate invoice on guest checkout
- Manual invoice creation linked to any booking
- Invoice status tracking: Paid · Pending · Overdue
- Download invoice as formatted PDF
- Send invoice directly to guest by email
- Filter by status, date range, or guest name

---

### ⭐ Reviews
- Guest review collection with overall and sub-category ratings
- Rating summary card with progress bars (Cleanliness, Staff, Comfort, Location, Value)
- Staff reply to reviews with email notification to guest
- Filter by star rating, date, and review source (Direct · Google · TripAdvisor)

---

### 🛎️ Concierge
- Guest request management: Airport Transfer · Restaurant · Spa · Wake-up Call · Room Service · Laundry · Custom
- Priority system: Low · Medium · High · Urgent
- Assign requests to staff with scheduled date and time
- Status tracking: Pending → In Progress → Completed
- Notify guest automatically when request is fulfilled

---

### ⚙️ Settings *(Super Admin only)*
- Hotel profile: name, logo, address, phone, email, website
- Operational config: check-in/check-out times, currency, timezone, tax rate
- SMTP configuration for all system email notifications
- Staff management: add, deactivate, and manage system user accounts

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy (async) |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Authentication | JWT — access + refresh tokens, bcrypt |
| PDF Generation | ReportLab / WeasyPrint |
| Email | aiosmtplib (async SMTP) |
| API Docs | Swagger UI + ReDoc (auto-generated) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript 5 |
| Routing | React Router v6 |
| Global State | Zustand |
| Server State | TanStack Query v5 (React Query) |
| HTTP Client | Axios with interceptors |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Dates | date-fns |
| PDF Preview | jsPDF + html2canvas |

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                          FRONTEND                            │
│           React 18 + TypeScript + Tailwind CSS               │
│        (Vite Dev Server  →  Nginx in production)             │
└───────────────────────────┬──────────────────────────────────┘
                            │  HTTPS / REST API
                            │  Authorization: Bearer {token}
┌───────────────────────────▼──────────────────────────────────┐
│                          BACKEND                             │
│               FastAPI  (Uvicorn ASGI Server)                 │
│                                                              │
│   ┌───────────┐    ┌───────────┐    ┌──────────────┐        │
│   │  Routers  │ →  │ Services  │ →  │ Repositories │        │
│   └───────────┘    └───────────┘    └──────┬───────┘        │
│                                            │                 │
│                               ┌────────────▼────────────┐   │
│                               │  SQLAlchemy ORM (async)  │   │
│                               └────────────┬────────────┘   │
└────────────────────────────────────────────┼────────────────┘
                                             │
                            ┌────────────────▼────────────────┐
                            │         PostgreSQL 16            │
                            │   (Bookings · Guests · Rooms     │
                            │    Invoices · Financials · ...)  │
                            └─────────────────────────────────┘
```

---

## ✅ Prerequisites

Ensure the following are installed before proceeding:

- **Python** `3.11+`
- **Node.js** `18+` and **npm** `9+`
- **PostgreSQL** `15+` (running locally or via Docker)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/marhaba-software.git
cd marhaba-software
```

---

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# On macOS / Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values — see [Environment Variables](#-environment-variables) below.

#### Create the Database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE marhaba;"
```

#### Run Migrations

```bash
alembic upgrade head
```

#### Seed Initial Data

```bash
python seed.py
```

> This creates the default **Super Admin** account, sample room types, and a demo guest.  
> Credentials will be printed to the terminal on completion.

---

### 3. Frontend Setup

```bash
# Navigate to the frontend directory (from project root)
cd frontend

# Install all dependencies
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your running backend URL (default: `http://localhost:8000`).

---

## ▶️ Running the Application

### Backend — Development Server

```bash
cd backend

# Activate virtual environment
source venv/bin/activate       # macOS / Linux
# venv\Scripts\activate        # Windows

# Start with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **`http://localhost:8000`**

---

### Frontend — Development Server

```bash
cd frontend

npm run dev
```

Frontend runs at: **`http://localhost:5173`**

---

### Running Both Simultaneously (from project root)

If a root-level `package.json` is configured with `concurrently`:

```bash
npm run dev
```

---

### Production Build

```bash
# Backend — production server with Gunicorn
cd backend
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000

# Frontend — build static files
cd frontend
npm run build
# Serve the generated /dist folder via Nginx or any static host
```

---

## 📖 API Documentation

Marhaba Software exposes fully auto-generated, interactive API documentation via **Swagger UI** and **ReDoc**.

Once the backend is running, open your browser and navigate to:

| Interface | URL |
|---|---|
| **Swagger UI** — interactive testing | `http://localhost:8000/docs` |
| **ReDoc** — clean reference docs | `http://localhost:8000/redoc` |
| **OpenAPI JSON Schema** | `http://localhost:8000/openapi.json` |

> **Authenticating in Swagger UI**  
> Click the **Authorize 🔒** button at the top right of the Swagger page.  
> Enter your token in the format: `Bearer <your_access_token>`  
> All protected endpoints will then be fully testable directly in the browser.

---

## 🔐 Roles & Permissions

| Module | Super Admin | Receptionist |
|---|:---:|:---:|
| Dashboard — full stats incl. revenue | ✅ | ✅ Revenue hidden |
| Reservations — Gantt + full booking management | ✅ | ✅ |
| Rooms — view + status update | ✅ | ✅ |
| Rooms — add / edit / delete | ✅ | ❌ |
| Guest Profiles | ✅ | ✅ |
| Messages | ✅ | ✅ |
| Housekeeping — assign + manage tasks | ✅ | ✅ |
| Inventory | ✅ | ✅ |
| Calendar | ✅ | ✅ |
| Financials | ✅ | ❌ |
| Invoices — view + download | ✅ | ✅ |
| Invoices — create + mark paid | ✅ | ❌ |
| Reviews — view + reply | ✅ | ✅ |
| Reviews — delete | ✅ | ❌ |
| Concierge | ✅ | ✅ |
| Settings | ✅ | ❌ |
| Staff Management | ✅ | ❌ |

---

## 🔧 Environment Variables

### Backend — `backend/.env`

```env
# Application
APP_NAME=Marhaba Software
SECRET_KEY=your_super_secret_key_change_this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/marhaba

# SMTP — Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@marhaba.com

# CORS
FRONTEND_ORIGIN=http://localhost:5173

# Hotel Defaults
DEFAULT_CURRENCY=USD
DEFAULT_TIMEZONE=UTC
DEFAULT_TAX_RATE=0.10
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Marhaba Software
```

---

## 📁 Project Structure

```
marhaba-software/
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # App entry point, middleware, CORS
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic settings from .env
│   │   │   ├── security.py            # JWT encode/decode, bcrypt
│   │   │   ├── dependencies.py        # get_db(), get_current_user(), require_role()
│   │   │   └── exceptions.py          # Global HTTP exception handlers
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── guest.py
│   │   │   ├── booking.py
│   │   │   ├── housekeeping.py
│   │   │   ├── inventory.py
│   │   │   ├── message.py
│   │   │   ├── invoice.py
│   │   │   ├── expense.py
│   │   │   ├── review.py
│   │   │   ├── concierge.py
│   │   │   └── notification.py
│   │   ├── schemas/                   # Pydantic v2 request/response schemas
│   │   ├── routers/                   # FastAPI route handlers
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
│   │   │   ├── calendar.py
│   │   │   ├── dashboard.py
│   │   │   └── settings.py
│   │   ├── services/                  # Business logic layer
│   │   ├── repositories/              # Database query layer
│   │   └── utils/
│   │       ├── email.py               # Async SMTP email sender
│   │       └── pdf.py                 # Invoice & report PDF generation
│   ├── alembic/                       # Database migrations
│   │   └── versions/
│   ├── seed.py                        # Initial data seeder
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                       # Axios instance + per-module API functions
│   │   ├── components/                # Shared reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── ui/                    # Buttons, badges, drawers, modals, tables
│   │   │   └── charts/                # Recharts wrappers
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── reservations/          # Gantt timeline + booking management
│   │   │   ├── rooms/
│   │   │   ├── guests/
│   │   │   ├── messages/
│   │   │   ├── housekeeping/
│   │   │   ├── inventory/
│   │   │   ├── calendar/
│   │   │   ├── financials/
│   │   │   ├── invoices/
│   │   │   ├── reviews/
│   │   │   ├── concierge/
│   │   │   ├── settings/
│   │   │   └── profile/
│   │   ├── store/                     # Zustand stores (auth, theme, notifications)
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── types/                     # TypeScript interfaces and enums
│   │   └── utils/                     # Formatters, date helpers, constants
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)

```bash
git commit -m "feat: add concierge notification system"
```

4. Push to your branch

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request with a clear description of your changes

---

<div align="center">

<br />

Crafted with precision for the hospitality industry.

```
  ┌─────────────────────────────────┐
  │      مرحبا  ·  MARHABA          │
  │   Hospitality. Reimagined.      │
  └─────────────────────────────────┘
```

</div>
