# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Flask quiz web app that loads questions from JSON files in `data/`, serves a vanilla JS SPA, and deploys to Vercel as a serverless application.

**Question format** (`data/*.json` — array of objects):
```json
{
  "question": "Who is President of US",
  "true": "Trump",
  "wrong": ["option1", "option2", "option3"]
}
```

## Development

### Setup
The project uses `uv` (see `pyproject.toml` + `uv.lock`) with Python 3.14 (`.python-version`). A `.venv` is already present.

```bash
# With uv (preferred)
uv sync

# Or with pip
pip install -r requirements.txt
```

### Run locally
```bash
python app.py
```
Visit `http://localhost:5000`

## API Endpoints

- `GET /` — Serves `templates/index.html`
- `GET /api/questions` — Returns all questions with shuffled `answers` array and `correct` field
- `POST /api/check` — Validates `{answer, correct}` payload; returns `{correct: bool}`

## Architecture Notes

- **Score tracking** is entirely client-side in `static/script.js` — no backend state.
- **Answer validation** in `script.js` compares locally against the `correct` field returned by `/api/questions`. The `correct` field is exposed to the frontend; the `/api/check` endpoint exists but is not used by the current frontend.
- **Answer randomization** happens in `app.py:get_questions()` before sending to the client.
- `main.py` is an unused placeholder — the app entry point is `app.py`.
- `vercel.json` targets Python 3.11 runtime despite `pyproject.toml` requiring Python 3.14 locally.

## Deployment

```bash
npm i -g vercel
vercel
```
