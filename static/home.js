let selectedChapter = null;

const CHAPTERS = [
    { key: 'chapter1', label: 'Chapter 1', icon: '📘' },
    { key: 'chapter2', label: 'Chapter 2', icon: '📗' },
    { key: 'chapter3', label: 'Chapter 3', icon: '📙' },
    { key: 'mixed',    label: 'Mixed',     icon: '🎲' },
];

const CHART_COLORS = {
    chapter1: { line: '#427AB5', bg: 'rgba(66,122,181,0.12)' },
    chapter2: { line: '#e8a020', bg: 'rgba(232,160,32,0.12)' },
    chapter3: { line: '#34c468', bg: 'rgba(52,196,104,0.12)' },
};

async function init() {
    const [status] = await Promise.all([
        fetch('/api/chapter-status').then(r => r.json()),
    ]);
    renderChapterCards(status);
    renderStats();
}

function renderChapterCards(status) {
    const grid = document.getElementById('chapter-grid');
    grid.innerHTML = '';

    CHAPTERS.forEach(ch => {
        const count = status[ch.key] ?? 0;
        const available = count > 0;
        const card = document.createElement('div');
        card.className = `chapter-card${available ? '' : ' disabled'}`;
        card.innerHTML = `
            <div class="chapter-icon">${ch.icon}</div>
            <div class="chapter-name">${ch.label}</div>
            <div class="chapter-count">${available ? count + ' questions' : 'Coming soon'}</div>
        `;
        if (available) card.onclick = () => selectChapter(ch.key, card);
        grid.appendChild(card);
    });
}

function selectChapter(key, card) {
    selectedChapter = key;
    document.querySelectorAll('.chapter-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const btn = document.getElementById('start-btn');
    btn.disabled = false;
    btn.textContent = `Start Quiz →`;
}

function startQuiz() {
    if (selectedChapter) window.location.href = `/quiz?chapter=${selectedChapter}`;
}

async function renderStats() {
    const data = await fetch('/api/stats').then(r => r.json());

    const byChapter = {
        chapter1: (data.chapter1 || []).map(Number),
        chapter2: (data.chapter2 || []).map(Number),
        chapter3: (data.chapter3 || []).map(Number),
    };

    const hasData = Object.values(byChapter).some(arr => arr.length > 0);
    if (!hasData) {
        document.getElementById('no-stats').style.display = 'block';
        document.getElementById('statsChart').style.display = 'none';
        return;
    }

    const datasets = Object.entries(byChapter)
        .filter(([, scores]) => scores.length > 0)
        .map(([key, scores]) => ({
            label: key.replace('chapter', 'Chapter '),
            data: scores.map((y, i) => ({ x: i + 1, y })),
            borderColor: CHART_COLORS[key].line,
            backgroundColor: CHART_COLORS[key].bg,
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: CHART_COLORS[key].line,
            fill: true,
        }));

    new Chart(document.getElementById('statsChart'), {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: {
                        font: { family: 'Nunito', weight: '700', size: 13 },
                        color: '#2d3a5e',
                        padding: 20,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}/30`,
                    },
                    bodyFont: { family: 'Nunito', size: 13 },
                    titleFont: { family: 'Nunito', weight: '800' },
                },
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Attempt',
                        font: { family: 'Nunito', weight: '700', size: 13 },
                        color: '#406AAF',
                    },
                    ticks: { stepSize: 1, font: { family: 'Nunito' }, color: '#2d3a5e' },
                    grid: { color: 'rgba(64,106,175,0.1)' },
                },
                y: {
                    min: 0,
                    max: 30,
                    title: {
                        display: true,
                        text: 'Score / 30',
                        font: { family: 'Nunito', weight: '700', size: 13 },
                        color: '#406AAF',
                    },
                    ticks: { stepSize: 5, font: { family: 'Nunito' }, color: '#2d3a5e' },
                    grid: { color: 'rgba(64,106,175,0.1)' },
                },
            },
        },
    });
}

document.addEventListener('DOMContentLoaded', init);
