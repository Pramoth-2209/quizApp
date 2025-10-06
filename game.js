
const socket = io();

const quizContainer = document.getElementById('quiz-container');
const nextBtn = document.getElementById('next-btn');
const playersList = document.getElementById('players-list');

const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');
const category = urlParams.get('category');
const apiKey = urlParams.get('apiKey');

socket.emit('new player', name);

if (name) {
  fetch(`https://quizapi.io/api/v1/questions?category=${encodeURIComponent(category)}&limit=5`, {
    headers: { 'X-Api-Key': apiKey }
  })
    .then(res => res.json())
    .then(data => {
      socket.emit('start game', data);
    });
}

socket.on('update players', (players) => {
  playersList.innerHTML = '';
  for (const id in players) {
    const player = players[id];
    const li = document.createElement('li');
    li.textContent = `${player.name}: ${player.score}`;
    playersList.appendChild(li);
  }
});

socket.on('game started', (question) => {
  showQuestion(question);
  nextBtn.style.display = 'inline-block';
});

socket.on('next question', (question) => {
  showQuestion(question);
});

socket.on('game over', (players) => {
  let resultHtml = `<h2>Game Over!</h2><h3>Final Scores:</h3>`;
  for (const id in players) {
    const player = players[id];
    resultHtml += `<p>${player.name}: ${player.score}</p>`;
  }
  quizContainer.innerHTML = resultHtml;
  nextBtn.style.display = 'none';
});

function showQuestion(q) {
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
      <h3>${q.question}</h3>
      ${q.description ? `<p>${q.description}</p>` : ''}
      <ul>${answersHtml}</ul>
    </div>
  `;
}

nextBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (selected) {
    socket.emit('answer', selected.value);
  }
  socket.emit('next question');
});
