let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        questions = await response.json();
        document.getElementById('total').textContent = questions.length;
        document.getElementById('total-questions').textContent = questions.length;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('quiz').style.display = 'block';
        showQuestion();
    } catch (error) {
        document.getElementById('loading').textContent = 'Error loading questions';
        console.error('Error:', error);
    }
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }

    answered = false;
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

    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

    // Show correct answer if wrong
    if (!isCorrect) {
        document.querySelectorAll('.answer-btn').forEach(b => {
            if (b.textContent === correct) {
                b.classList.add('correct');
            }
        });
    }

    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestion++;
    showQuestion();
}

function showResults() {
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('score').textContent = score;
}

// Load questions on page load
document.addEventListener('DOMContentLoaded', loadQuestions);
