from flask import Flask, render_template, jsonify, request
import json
import os
import random

app = Flask(__name__, static_folder='static', template_folder='templates')

def load_questions():
    """Load all quiz questions from the data folder."""
    questions = []
    data_path = os.path.join(os.path.dirname(__file__), 'data')

    if not os.path.exists(data_path):
        return questions

    for filename in os.listdir(data_path):
        if filename.endswith('.json'):
            with open(os.path.join(data_path, filename), 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    questions.extend(data)
                else:
                    questions.append(data)

    return questions

@app.route('/')
def index():
    """Serve the main quiz page."""
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    """API endpoint to get all quiz questions with randomized answers."""
    questions = load_questions()

    # Pick 30 random questions
    sample = random.sample(questions, min(30, len(questions)))

    # Randomize answer order for each question
    processed = []
    for q in sample:
        answers = [q['true']] + q.get('wrong', [])
        random.shuffle(answers)
        processed.append({
            'question': q['question'],
            'answers': answers,
            'correct': q['true']
        })

    return jsonify(processed)

@app.route('/api/check', methods=['POST'])
def check_answer():
    """API endpoint to check if an answer is correct."""
    data = request.json
    correct = data.get('correct') == data.get('answer')
    return jsonify({'correct': correct})

if __name__ == '__main__':
    app.run(debug=True)
