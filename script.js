const dashboard   = document.getElementById('dashboard');
const quizArea    = document.getElementById('quiz-area');
const quizTitle   = document.getElementById('quiz-title');
const quizContainer = document.getElementById('quiz-container');
const startBtn    = document.getElementById('start-btn');
const nextBtn     = document.getElementById('next-btn');
const categorySelect = document.getElementById('category-select');


let questions = [];
let current   = 0;
let score     = 0;
let userAnswers = [];

startBtn.addEventListener('click', () => {
  const category = categorySelect.value;
  const api=document.getElementById("api").value;
  if (!category) {
    alert('Please select a category.');
    return;
  }
  startQuiz(category,api);
});

function startQuiz(category,api) {
  dashboard.style.display = 'none';
  quizArea.style.display  = 'block';
  quizTitle.textContent   = `${category} Quiz`;

  fetch(`https://quizapi.io/api/v1/questions?category=${encodeURIComponent(category)}&limit=5`, {
    headers: { 'X-Api-Key':api} // <-- put your real key W2d3NfF7kz9kZTT2ZCndnf9sVyJQl1TvAt6UubPs
  })
    .then(res => res.json())
    .then(data => {
      questions = data;
      current = 0;
      score = 0;
      userAnswers = [];
      if (!questions.length) {
        quizContainer.innerHTML = '<p>No questions found for this category.</p>';
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'inline-block';
        showQuestion();
      }
    })
    .catch(err => {
      console.error(err);
      quizContainer.textContent = 'Failed to load quiz.';
    });
}

function showQuestion() {
  const q = questions[current];
  const answersHtml = Object.entries(q.answers)
    .filter(([_, val]) => val)
    .map(([key, val]) => `
        <li>
          <label>
            <input type="radio" name="answer" value="${key}">
            ${val}
          </label>
        </li>`
    ).join('');

  quizContainer.innerHTML = `
    <div class="question-block">
      <h3>Q${current + 1}. ${q.question}</h3>
      ${q.description ? `<p>${q.description}</p>` : ''}
      <ul>${answersHtml}</ul>
    </div>
  `;

  nextBtn.textContent = current === questions.length - 1 ? 'Submit' : 'Next';
}

nextBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert('Please choose an answer.');
    return;
  }

  userAnswers[current] = selected.value;

  // check if correct
  const correctKeys = Object.entries(questions[current].correct_answers)
    .filter(([_, v]) => v === 'true')
    .map(([k]) => k.replace('_correct',''));
  if (correctKeys.includes(selected.value)) score++;

  current++;

  if (current < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  let resultHtml = `<h2>Your score: ${score}/${questions.length}</h2>`;
  resultHtml += '<h3>Review:</h3>';

  questions.forEach((q, i) => {
    const correctKeys = Object.entries(q.correct_answers)
      .filter(([_, v]) => v === 'true')
      .map(([k]) => k.replace('_correct',''));

    const correctTexts = correctKeys
      .map(k => q.answers[k])
      .filter(Boolean)
      .join(', ');

    const userText = userAnswers[i] ? q.answers[userAnswers[i]] : 'No answer';

    resultHtml += `
      <div class="question-block">
        <h4>Q${i + 1}. ${q.question}</h4>
        <p>Your answer: <span class="${correctKeys.includes(userAnswers[i]) ? 'correct' : 'wrong'}">${userText}</span></p>
        <p>Correct answer: <span class="correct">${correctTexts}</span></p>
      </div>
    `;
  });

  quizContainer.innerHTML = resultHtml;
  nextBtn.style.display = 'none';
}



hereW2d3NfF7kz9kZTT2ZCndnf9sVyJQl1TvAt6UubPs