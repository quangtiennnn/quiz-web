from flask import Flask, render_template, jsonify, request
import json
import os
import random

app = Flask(__name__, static_folder='static', template_folder='templates')

BLOB_TOKEN = os.getenv('BLOB_READ_WRITE_TOKEN', '')
SCORES_PATH = 'quiz-scores.json'
EMPTY_SCORES = {'chapter1': [], 'chapter2': [], 'chapter3': []}


def _read_scores():
    if not BLOB_TOKEN:
        return dict(EMPTY_SCORES)
    try:
        import requests
        r = requests.get(
            'https://blob.vercel-storage.com',
            params={'prefix': SCORES_PATH, 'limit': 1},
            headers={'Authorization': f'Bearer {BLOB_TOKEN}'},
            timeout=5,
        )
        blobs = r.json().get('blobs', [])
        if not blobs:
            return dict(EMPTY_SCORES)
        return requests.get(blobs[0]['url'], timeout=5).json()
    except Exception:
        return dict(EMPTY_SCORES)


def _write_scores(scores):
    import requests
    requests.put(
        f'https://blob.vercel-storage.com/{SCORES_PATH}',
        params={'allowOverwrite': '1'},
        headers={
            'Authorization': f'Bearer {BLOB_TOKEN}',
            'x-content-type': 'application/json',
        },
        data=json.dumps(scores),
        timeout=5,
    )


def load_chapter(chapter):
    data_path = os.path.join(os.path.dirname(__file__), 'data')
    if chapter == 'mixed':
        questions = []
        for i in range(1, 4):
            path = os.path.join(data_path, f'chapter{i}.json')
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    questions.extend(json.load(f))
        return questions
    path = os.path.join(data_path, f'{chapter}.json')
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/quiz')
def quiz():
    chapter = request.args.get('chapter', 'mixed')
    return render_template('index.html', chapter=chapter)


@app.route('/api/questions')
def get_questions():
    chapter = request.args.get('chapter', 'mixed')
    questions = load_chapter(chapter)
    if not questions:
        return jsonify({'error': 'No questions available for this chapter yet.'}), 404
    sample = random.sample(questions, min(30, len(questions)))
    processed = []
    for q in sample:
        answers = [q['true']] + q.get('wrong', [])
        random.shuffle(answers)
        processed.append({
            'question': q['question'],
            'answers': answers,
            'correct': q['true'],
        })
    return jsonify(processed)


@app.route('/api/stats')
def get_stats():
    return jsonify(_read_scores())


@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    data = request.get_json()
    chapter = data.get('chapter')
    score = data.get('score')

    if chapter not in EMPTY_SCORES:
        return jsonify({'success': False, 'reason': 'mixed not tracked'})
    if not BLOB_TOKEN:
        return jsonify({'success': False, 'reason': 'blob not configured'})

    try:
        scores = _read_scores()
        scores[chapter].append(score)
        _write_scores(scores)
        attempt = len(scores[chapter])
        return jsonify({'success': True, 'attempt': attempt, 'score': score})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/api/chapter-status')
def chapter_status():
    data_path = os.path.join(os.path.dirname(__file__), 'data')
    status = {}
    total = 0
    for i in range(1, 4):
        path = os.path.join(data_path, f'chapter{i}.json')
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                count = len(json.load(f))
            status[f'chapter{i}'] = count
            total += count
        else:
            status[f'chapter{i}'] = 0
    status['mixed'] = total
    return jsonify(status)


if __name__ == '__main__':
    app.run(debug=True)
