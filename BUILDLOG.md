# Build Log

Honest log of AI-assisted work, decisions made, and issues faced while building this capstone.

## Setup & Environment

- Verified toolchain: node v22.16.0, npm 10.9.2, docker 29.6.1, docker compose v5.3.0, git 2.49.0.windows.1 — all clean, no version conflicts.
- Chose Node.js + Express over Python + FastAPI (used throughout the rest of the internship track) deliberately — wanted to prove I could apply the same backend concepts (validation, CORS, rate limiting, layered architecture) in a different stack, since the widget/embed-script nature of this capstone is JS-native end to end.
- Chose PostgreSQL via Docker over SQLite for realistic production-style setup with docker-compose.
- Chose ES Modules (import/export) over CommonJS for the whole backend — modern standard.

## Architecture Decisions

- Layered folder structure: routes -> controllers -> services -> repositories -> middleware -> config.
  Reasoning: keeps business logic separate from DB queries, so swapping Postgres for another DB later only touches the repositories layer.
- Connection pooling (pg.Pool) used instead of opening a new DB connection per request — standard production practice.

## Issues Faced & Fixes

### Issue 1: Git LF/CRLF warning
- **What happened:** `warning: in the working copy of 'X', LF will be replaced by CRLF the next time Git touches it` appeared on every `git add`.
- **Cause:** Windows Git Bash default line-ending handling differs from Linux-style LF endings used by most tools.
- **Fix:** Ran `git config core.autocrlf true` (Windows-recommended setting). Cosmetic warning only, no data loss risk.

## AI Usage Notes

- Used Claude to plan file structure, generate boilerplate (db.js, server.js, docker-compose.yml, .gitignore) and explain concepts (connection pooling, CORS, layered architecture) while learning Node.js/Express for the first time.
- All commands were run and verified manually before proceeding to the next step; every AI-suggested config was checked against actual terminal output (docker ps, psql version check, curl health check) rather than trusted blindly.
