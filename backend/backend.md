# backend.md — CAT Hackathon Backend Plan

## Folder structure
```
backend/
├── routes/
├── services/
├── utils/
├── config/
├── app.py
├── requirements.txt
└── OPEN_QUESTIONS.md   ← running list of anything needing [YOUR NAME]'s decision
```
No ORM, no auth scaffolding, no Docker, no CI/CD, no unit tests pre-built. Those are
guesses about tomorrow's problem — add them live only if the problem statement forces it.

## Decision sheet — CORE (check this first, this is what you'll actually use)
| Requirement | Decision |
|---|---|
| Database | SQLite — zero setup, file-based, fine for a 17-hour demo |
| Auth | Skip entirely unless the problem statement explicitly requires login |
| API structure | Flask, one blueprint per feature in `routes/` |
| Data format | JSON in/out, no GraphQL |

## Decision sheet — EXTENDED (reference only, don't pre-build any of this)
Only open one of these rows if the revealed problem actually needs it:
| Requirement | Decision |
|---|---|
| File upload | Flask's built-in file handling |
| Images | Pillow |
| Charts | Chart.js (frontend-side, not backend) |
| PDF export | ReportLab |
| Excel | OpenPyXL |
| CSV | Pandas |
| QR codes | `qrcode` package |
| Email | smtplib |
| OCR | EasyOCR |
| AI/LLM calls | OpenAI or Gemini API, whichever key you have handy |

Don't `pip install` any of these tonight. Install on demand once you know you need it —
installing unused packages just adds noise to `requirements.txt` and slows environment setup.

## Coding rules
- snake_case for backend files and variables
- One responsibility per function, keep under ~50 lines where practical
- No nested callbacks — use early returns
- One route file per feature (`routes/fleet.py`, not one giant `routes/api.py`)
- Every endpoint returns a consistent shape: `{ "data": ..., "error": null }`

## Backend contract → frontend
Update this table as you build. Your friend reads this, not your source code.
| Method | Endpoint | Returns | Status |
|---|---|---|---|
| | | | not started |
