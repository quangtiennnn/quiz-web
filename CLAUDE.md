# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Python-based quiz website built with Flask that:
- Loads quiz questions from JSON files in the `data/` folder
- Serves a single-page application (SPA) frontend
- Randomizes answer order for each question
- Tracks user scores
- Deploys to Vercel as a serverless application

**Question Format:**
```json
{
  "question": "Who is President of US",
  "true": "Trump",
  "wrong": ["option1", "option2", "option3"]
}
```

## Project Structure

```
quiz-web/
├── app.py                 # Flask application with API routes
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment config
├── templates/
│   └── index.html        # Main HTML page
├── static/
│   ├── style.css         # Styling
│   └── script.js         # Frontend logic
└── data/
    └── *.json            # Quiz question files (add more here)
```

## Development

### Setup
```bash
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run locally
```bash
python app.py
```
Visit `http://localhost:5000`

### Add quiz questions
Create JSON files in the `data/` folder. Files should contain an array of question objects with the format shown above. The app automatically loads all JSON files in this directory.

## API Endpoints

- `GET /` - Serve the quiz page
- `GET /api/questions` - Get all questions with randomized answers (correct answer not exposed to frontend)
- `POST /api/check` - Check if an answer is correct (optional endpoint for validation)

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard if needed

The `vercel.json` config specifies Python 3.11 runtime and build dependencies.

## Architecture Notes

- **Backend**: Flask serves both the API and static frontend
- **Frontend**: Vanilla JavaScript SPA that loads questions via fetch API
- **Data**: Questions stored as JSON files for easy management and version control
- **Randomization**: Happens server-side in the `/api/questions` endpoint - this is more secure than client-side randomization

When adding new features or modifying API routes, ensure the frontend `script.js` is updated accordingly to consume the new endpoints.
