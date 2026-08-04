# CAT Hackathon Starter Kit

Two docs, one per person. Read your own, don't cross-reference the other unless
you're checking the API contract.

- **You (backend):** `backend/backend.md`
- **Your friend (frontend):** `frontend/frontend.md`

## What's already built
- 9 frontend components (`frontend/src/components/`) — Button, Card, Navbar,
  Loader, Modal, StatTile, Input, TextArea, Badge — pure CSS interactions, no
  animation libraries, all pulling from `frontend/src/styles/tokens.css`
- Backend folder skeleton (`backend/routes`, `services`, `utils`, `config`) — empty,
  ready to fill once the problem statement is known
- Trimmed backend decision sheet (core 4 decisions + extended reference table)

## What's deliberately NOT built
Table component, auth, ORM, Docker, CI/CD, `App.jsx`, `package.json`. All of these
are either cheap to build live once you know the problem, or a bad bet to guess at
the night before. See `backend/backend.md` and `frontend/frontend.md` for the
reasoning on each.

## Morning-of workflow (Aug 5, per the event agenda)
1. **10:25–10:45 — problem statement reveal.** Just listen.
2. **10:45–11:00 — Q&A.** Ask if scope is ambiguous, it's free information.
3. **11:00–11:30 — moving to labs.** Fill Section 0 in `frontend/frontend.md`
   (project name, pitch, core action, shell choice, pages) and jot your own
   equivalent notes for backend scope. This is the only planning window you get.
4. **11:30 — hacking starts.** Hand `frontend.md` to your friend. Go straight to
   backend. Use `backend.md`'s "Backend contract → frontend" table to communicate
   endpoints as you build them, instead of talking in person.

## One rule that keeps this from falling apart
Blockers go in the "Open questions" list at the bottom of `frontend.md` — not a
tap on the shoulder. Check it between backend tasks, don't context-switch live.
