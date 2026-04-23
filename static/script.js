let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;

const CHAPTER_LABELS = {
    chapter1: 'Chapter 1',
    chapter2: 'Chapter 2',
    chapter3: 'Chapter 3',
    mixed: '🎲 Mixed',
};

async function loadQuestions() {
    const badge = document.getElementById('chapter-badge');
    if (badge) badge.textContent = CHAPTER_LABELS[CHAPTER] || CHAPTER;

    try {
        const response = await fetch(`/api/questions?chapter=${CHAPTER}`);
        if (!response.ok) {
            const err = await response.json();
            document.getElementById('loading').innerHTML =
                `<p style="color:#e74c3c; font-weight:700;">⚠️ ${err.error}</p>
                 <a href="/" style="color:#406AAF; font-weight:800;">← Back to Home</a>`;
            return;
        }
        questions = await response.json();
        document.getElementById('total').textContent = questions.length;
        document.getElementById('total-questions').textContent = questions.length;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('quiz').style.display = 'block';
        showQuestion();
    } catch (error) {
        document.getElementById('loading').innerHTML =
            '<p>❌ Error loading questions. Please refresh.</p>';
        console.error('Error:', error);
    }
}

function updateProgressBar() {
    const pct = (currentQuestion / questions.length) * 100;
    document.getElementById('progress-bar').style.width = pct + '%';
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }
    answered = false;
    updateProgressBar();

    const q = questions[currentQuestion];
    document.getElementById('current').textContent = currentQuestion + 1;
    document.getElementById('question').textContent = q.question;

    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';

    q.answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(btn, answer, q.correct);
        answersContainer.appendChild(btn);
    });

    document.getElementById('next-btn').style.display = 'none';
}

function selectAnswer(btn, answer, correct) {
    if (answered) return;
    answered = true;

    const isCorrect = answer === correct;
    btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) score++;

    document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

    if (!isCorrect) {
        document.querySelectorAll('.answer-btn').forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
    }

    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestion++;
    showQuestion();
}

function showResults() {
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('score').textContent = score;

    const total = questions.length;
    const pct = score / total;

    let emoji, label;
    if (pct === 1)        { emoji = '🏆'; label = 'Perfect score! Outstanding!'; }
    else if (pct >= 0.8)  { emoji = '🎉'; label = 'Great job! Keep it up!'; }
    else if (pct >= 0.6)  { emoji = '😊'; label = 'Good effort! Keep practicing!'; }
    else if (pct >= 0.4)  { emoji = '💪'; label = 'Keep going, you can do better!'; }
    else                  { emoji = '📚'; label = "Don't give up! Try again!"; }

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('score-label').textContent = label;

    // Save score to Google Sheet via backend (skip mixed)
    if (CHAPTER !== 'mixed') {
        fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapter: CHAPTER, score, total }),
        }).catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', loadQuestions);
