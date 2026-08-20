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

### Issue 2: nodemon didn't auto-restart on .env changes
- **What happened:** Editing .env via `sed -i` did not reliably trigger nodemon's file watcher, so FORCE_EMAIL_FAILURE toggles weren't picked up automatically, causing a test to run against stale code.
- **Cause:** nodemon's default watch behavior can miss rapid/scripted edits to .env on Windows, unlike normal source file saves.
- **Fix:** Manually typed `rs` + Enter in the nodemon terminal to force an explicit restart after changing .env, rather than relying on auto-detection.

### Issue 3: CORS preflight (OPTIONS) request 404'd despite CORS middleware being present
- **What happened:** Browser blocked POST to /submissions with "No Access-Control-Allow-Origin header", even though cors() was applied to the POST route.
- **Cause:** cors middleware was attached with `router.post('/', publicCors, ...)`, which only matches POST requests. The browser's automatic OPTIONS preflight request never matched any route, so it 404'd before CORS headers could be added.
- **Fix:** Changed to `router.use(publicCors)` at the router level, so CORS headers are applied to every HTTP method on that route, including the OPTIONS preflight.

### Issue 4: node --test could not find test/ directory
- **What happened:** `node --test test/` threw MODULE_NOT_FOUND, treating the folder as a module to require rather than a directory to scan.
- **Cause:** Inconsistent glob/path handling for directory arguments with Node's built-in test runner on this environment.
- **Fix:** Changed the test script to an explicit glob pattern: `node --test test/*.test.js`, which reliably picks up all test files.
