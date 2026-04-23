# Proposal: Homepage + Chapter Selector + Google Sheets Statistics

## Google Sheet structure (confirmed)

```
attempt | chapter_1 | chapter_2 | chapter_3
1       |           |           |
2       |           |           |
...
```

Public CSV URL (read, no auth):
`https://docs.google.com/spreadsheets/d/15OHnobrv3jOEWp1DWaEq3VzFk4ChrvXuLnqDugaX4Vw/export?format=csv`

---

## Reading vs Writing — what's possible on Vercel

| Operation | Method | Auth needed | Works |
|-----------|--------|------------|-------|
| Read sheet | Fetch public CSV URL | None | ✅ Free |
| Write sheet | Google Apps Script web app (proxy) | None (client-side) | ✅ Free |

**Reading** the sheet from the app is trivial — the public CSV URL works directly.

**Writing** scores back to the sheet requires a free **Google Apps Script** deployed as a Web App. The script acts as a middleman: the quiz app POSTs a score to the Apps Script URL, the script appends a row to the sheet. No API keys, no OAuth, completely free.

---

## Architecture

```
[Student finishes quiz]
       │
       ▼
app POSTs { attempt, chapter, score }
       │
       ▼
Google Apps Script Web App
       │
       ▼
Appends row to Google Sheet
       │
       ▼
Homepage fetches public CSV → renders Chart.js line graph
```

---

## Homepage layout

```
┌──────────────────────────────────────┐
│      ⭐  Quiz Time!  ⭐              │
│   Your scores over time              │
│  [Line graph — Chapter 1/2/3 lines]  │
├──────────────────────────────────────┤
│  Choose a chapter:                   │
│  [ Chapter 1 ▼ ]    [ Start → ]      │
└──────────────────────────────────────┘
```

---

## Data files (questions)

```
data/
  chapter1.json   ← add questions here later
  chapter2.json   ← add questions here later
  chapter3.json   ← add questions here later
```

`mixed` = app.py auto-merges all chapter files at request time (no extra file needed).

`/api/questions?chapter=1|2|3|mixed` — returns 30 random questions from the chosen chapter.

If a chapter file doesn't exist yet, the API returns a friendly error and the Start button is disabled for that chapter.

---

## What needs to be set up (one-time, by you)

1. **Create a Google Apps Script** in the same Google account as the sheet:
   - Go to https://script.google.com → New Project
   - Paste the provided script (we will generate it)
   - Deploy as Web App → Execute as: Me → Anyone can access
   - Copy the Web App URL into the quiz app's config

2. **Add APPS_SCRIPT_URL to Vercel** environment variables (or `.env` locally)

That's it — no paid services, no API keys to manage.

---

## Implementation steps

1. `app.py`
   - Add `GET /` → serve `home.html`
   - Add `GET /quiz` → serve `index.html` (receives `?chapter=` param)
   - Add `GET /api/questions?chapter=` → load correct JSON, sample 30
   - Add `GET /api/stats` → fetch Google Sheet CSV and return JSON to frontend

2. `templates/home.html` — homepage (chart + chapter picker)
3. `templates/index.html` — quiz page (minor: read chapter from URL)
4. `static/home.js` — fetch stats, render Chart.js, chapter select → navigate
5. `static/script.js` — after results, POST score to Apps Script URL
6. `apps_script.js` — the Google Apps Script code (provided for you to paste)
