# 🏗️ ARCHITECTURE.md — Kiến Trúc AIgenlabs Platform

## Tổng Quan

```
┌─────────────────────────────────────────────────────┐
│                    AIGENLABS PLATFORM                │
├────────────┬────────────────┬───────────────────────┤
│  Landing   │  Admin Dashboard│  Student Portal       │
│  (Public)  │  (/admin/*)     │  (/student/*)         │
│  page.js   │  Sidebar+Pages  │  Sidebar+Pages        │
├────────────┴────────────────┴───────────────────────┤
│                    MIDDLEWARE                         │
│            Route protection (role-based)              │
├─────────────────────────────────────────────────────┤
│                    AUTH LAYER                         │
│       Supabase Auth (Email/Password + Google)        │
├─────────────────────────────────────────────────────┤
│                    DATA LAYER                         │
│  Supabase Client (Browser) │ Supabase Client (Server)│
├─────────────────────────────────────────────────────┤
│                    DATABASE                           │
│  Supabase (PostgreSQL + RLS + Triggers)              │
│  Tables: profiles, levels, subjects, enrollments,    │
│          progress, payments                          │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Lý do |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, routing, Server Components |
| Language | JavaScript (ES2022) | Đơn giản, vibe coding friendly |
| Styling | Vanilla CSS + CSS Modules | Full control, no dependencies |
| Font | Inter (Google Fonts) | Vietnamese support, modern |
| Database | Supabase (PostgreSQL) | Free tier, Auth, RLS, realtime |
| Auth | Supabase Auth | Built-in, session management |
| Deploy | Vercel | Free, Next.js integrated |

## Component Architecture

```
src/
├── app/
│   ├── globals.css          ← Design tokens (single source of truth)
│   ├── layout.js            ← Root layout (font, metadata)
│   ├── page.js              ← Landing (Server Component)
│   │
│   ├── (auth)/              ← Route group (no URL segment)
│   │   ├── layout.js        ← Centered card layout
│   │   ├── login/page.js    ← Client Component (form)
│   │   └── register/page.js ← Client Component (form)
│   │
│   ├── admin/               ← Protected route group
│   │   ├── layout.js        ← Sidebar layout (Server→Client hybrid)
│   │   ├── page.js          ← Dashboard (Server Component + data)
│   │   └── .../page.js      ← CRUD pages
│   │
│   └── student/             ← Protected route group
│       ├── layout.js        ← Sidebar layout
│       ├── page.js          ← Dashboard
│       └── .../page.js      ← Learning pages
│
├── components/
│   ├── ui/                  ← Shared (Navbar, Button, Modal, Toast)
│   ├── admin/               ← Admin-only (Sidebar, DataTable, StatsCard)
│   └── student/             ← Student-only (ProgressRing, CourseCard)
│
├── lib/
│   ├── supabase.js          ← Browser client (singleton)
│   ├── supabase-server.js   ← Server client (per-request)
│   ├── auth.js              ← Auth helpers
│   └── utils.js             ← Formatting, validation
│
└── middleware.js             ← Route protection (before render)
```

## Data Flow

```
Server Component              Client Component
     │                              │
     ├── supabase-server.js         ├── supabase.js
     │   (cookies → session)        │   (localStorage → session)
     │                              │
     ├── SELECT (read)              ├── INSERT/UPDATE (write)
     │                              │
     └── Pass data as props ───────→└── Render + interact
```

## Design System Hierarchy

```
globals.css (tokens)
    │
    ├── page.module.css (landing-specific)
    ├── auth.module.css (auth-specific)
    ├── admin.module.css (admin-specific)
    ├── student.module.css (student-specific)
    │
    └── Component.module.css (per-component)
```
