
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

let players = {};
let questions = [];
let currentQuestion = 0;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new player', (name) => {
    players[socket.id] = { name, score: 0 };
    io.emit('update players', players);
  });

  socket.on('start game', (newQuestions) => {
    questions = newQuestions;
    currentQuestion = 0;
    io.emit('game started', questions[currentQuestion]);
  });

  socket.on('answer', (answer) => {
    const player = players[socket.id];
    if (player) {
      const correct_answers = questions[currentQuestion].correct_answers;
      let isCorrect = false;
      for (const key in correct_answers) {
        if (correct_answers[key] === 'true' && key.startsWith(answer)) {
          isCorrect = true;
          break;
        }
      }

      if (isCorrect) {
        player.score++;
      }
      io.emit('update players', players);
    }
  });

  socket.on('next question', () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      io.emit('next question', questions[currentQuestion]);
    } else {
      io.emit('game over', players);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete players[socket.id];
    io.emit('update players', players);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
