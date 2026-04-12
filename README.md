# Quiz Web App

A simple quiz web app built with Flask. Questions are loaded from JSON files and served to a vanilla JS frontend.

## Setup

Requires Python 3.14. Uses `uv` for dependency management.

```bash
uv sync
```

Or with pip:

```bash
pip install -r requirements.txt
```

## Run locally

```bash
python app.py
```

Visit `http://localhost:5000`

## Adding questions

Create a `.json` file in the `data/` folder. Each file should contain an array of question objects:

```json
[
  {
    "question": "What is the capital of France?",
    "true": "Paris",
    "wrong": ["Lyon", "Marseille", "Toulouse"]
  }
]
```

All JSON files in `data/` are loaded automatically on startup.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## API

|Method|Endpoint|Description|
|------|--------|-----------|
|GET|`/`|Serves the quiz page|
|GET|`/api/questions`|Returns all questions with shuffled answers|
|POST|`/api/check`|Checks `{answer, correct}`, returns `{correct: bool}`|
