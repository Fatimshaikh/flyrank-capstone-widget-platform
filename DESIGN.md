# Design Doc — Embeddable Widget & Lead-Capture Platform

## Problem
Businesses need a way to collect leads (signups, contact requests) from their own
websites without building custom backend infrastructure. This system lets a
business (tenant) create a widget, embed it via a single <script> tag on any
website, and safely receive submissions from visitors on the public internet —
validated, spam-filtered, geo-enriched, and viewable on a dashboard.

## Data Model

### users (widget owners / tenants)
- id (PK)
- email (unique)
- password_hash
- created_at

### widgets
- id (PK)
- tenant_id (FK -> users.id)
- type (enum: 'signup_form' | 'cta_popover')
- title
- description
- fields (JSONB — form field definitions)
- button_text
- display_options (JSONB)
- created_at
- updated_at

### submissions
- id (PK)
- widget_id (FK -> widgets.id)
- tenant_id (FK -> users.id)   -- denormalized for fast tenant-isolated queries
- data (JSONB — submitted form values)
- ip_address
- country
- city
- honeypot_triggered (boolean)
- created_at

## API Surface (three request paths)

### 1. Widget Owner (authenticated, JWT)
- POST   /auth/register
- POST   /auth/login
- POST   /widgets
- GET    /widgets
- GET    /widgets/:id
- PATCH  /widgets/:id
- DELETE /widgets/:id
- GET    /dashboard/submissions
- GET    /dashboard/stats

### 2. Customer Website (public, cached)
- GET /widgets/:id/config   -- widget config, short cache
- GET /widget.js            -- versioned bundle, long cache

### 3. Website Visitor (public, CORS-protected)
- POST /submissions         -- the hardened public endpoint

## Non-Goal
Real email delivery and widget visual customization are explicitly out of scope.
Email/webhook side effects are logged/mocked — what's graded is that their
failure never blocks a successful submission, not actual deliverability. The
widget itself renders as a minimal functional form; visual styling is a
frontend concern, not this capstone's focus.
