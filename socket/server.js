// socket/server.js
import { Server } from "socket.io";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get file path for data.json
const dataFilePath = path.join(process.cwd(), 'data.json');

// Initialize game state storage
const gameStates = {};

const PORT = process.env.PORT || 5505;

// Create Socket.IO server with CORS configuration
const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
});

console.log(`Socket server running on port ${PORT}`);
io.listen(PORT);

// Initialize data.json if it doesn't exist
try {
  fs.accessSync(dataFilePath);
  console.log("data.json exists");
} catch (error) {
  console.log("Creating new data.json");
  const initialData = {
    users: [],
    quizzes: [],
    results: []
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), 'utf8');
}

function sendQuestion(roomCode) {
  const gameState = gameStates[roomCode];
  if (!gameState) return;
  
  const question = gameState.quiz.questions[gameState.currentQuestion];
  
  // Record when the question started for timing calculations
  gameState.questionStartTime = Date.now();
  
  // Send to players (without the solution)
  io.to(roomCode).emit("game:question", {
    questionIndex: gameState.currentQuestion,
    totalQuestions: gameState.quiz.questions.length,
    question: question.question,
    answers: question.answers,
    image: question.image,
    time: question.time
  });
  
  // Send to host (with the solution)
  io.to(gameState.host).emit("host:question", {
    questionIndex: gameState.currentQuestion,
    totalQuestions: gameState.quiz.questions.length,
    question: question.question,
    answers: question.answers,
    image: question.image,
    time: question.time,
    solution: question.solution
  });
  
  // Auto-advance to results after time is up
  setTimeout(() => {
    const currentGameState = gameStates[roomCode];
    if (currentGameState && currentGameState.currentQuestion === gameState.currentQuestion) {
      showResults(roomCode);
    }
  }, (question.time + 1) * 1000);
}

function showResults(roomCode) {
  const gameState = gameStates[roomCode];
  if (!gameState) return;
  
  const question = gameState.quiz.questions[gameState.currentQuestion];
  
  // Calculate answer statistics
  const answerCounts = [0, 0, 0, 0];
  let correctCount = 0;
  let avgResponseTime = 0;
  
  gameState.answers.forEach(answer => {
    if (answer.answer >= 0 && answer.answer < 4) {
      answerCounts[answer.answer]++;
    }
    if (answer.correct) {
      correctCount++;
      avgResponseTime += answer.time;
    }
  });
  
  // Calculate average response time for correct answers
  if (correctCount > 0) {
    avgResponseTime = avgResponseTime / correctCount;
  }
  
  // Update leaderboard
  gameState.leaderboard = gameState.players
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  // Send results to host
  io.to(gameState.host).emit("host:questionResults", {
    solution: question.solution,
    answerCounts,
    totalAnswers: gameState.answers.length,
    correctCount,
    avgResponseTime: avgResponseTime.toFixed(1),
    leaderboard: gameState.leaderboard,
    fastestCorrect: gameState.answers
      .filter(a => a.correct)
      .sort((a, b) => a.time - b.time)[0]
  });
  
  // Send to all players
  io.to(roomCode).emit("game:questionResults", {
    solution: question.solution,
    answerCounts,
    totalAnswers: gameState.answers.length,
    correctCount,
    leaderboard: gameState.leaderboard
  });
}

function endGame(roomCode) {
  const gameState = gameStates[roomCode];
  if (!gameState) return;
  
  // Sort players by score
  const finalLeaderboard = gameState.players
    .sort((a, b) => b.score - a.score);
  
  // Send final results
  io.to(roomCode).emit("game:end", {
    leaderboard: finalLeaderboard
  });
  
  // Save results to data.json
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Add results for this game
    const gameResult = {
      id: uuidv4(),
      quizId: gameState.quiz.id,
      quizTitle: gameState.quiz.title,
      date: new Date().toISOString(),
      players: finalLeaderboard.map(p => ({
        username: p.username,
        score: p.score
      }))
    };
    
    data.results.push(gameResult);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error saving game results:", error);
  }
  
  // Clean up game state after a delay
  setTimeout(() => {
    delete gameStates[roomCode];
  }, 60000); // Keep game state for 1 minute for late viewers
}

// Socket connection handler
io.on("connection", (socket) => {
  console.log(`A user connected ${socket.id}`);

  // Host creates a room
  socket.on("host:createRoom", async (quizId) => {
    try {
      console.log(`Host creating room for quiz: ${quizId}`);
      
      // Read data.json to get the quiz
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(fileContents);
      const quiz = data.quizzes.find(q => q.id === quizId);
      
      if (!quiz) {
        console.error(`Quiz not found with ID: ${quizId}`);
        socket.emit("error", "Quiz not found");
        return;
      }
      
      console.log(`Found quiz: ${quiz.title} with code: ${quiz.code}`);
      
      // Create game state for this room
      gameStates[quiz.code] = {
        quiz: quiz,
        host: socket.id,
        players: [],
        currentQuestion: 0,
        started: false,
        answers: [],
        leaderboard: []
      };
      
      socket.join(quiz.code);
      socket.emit("host:roomCreated", quiz.code);
      console.log(`Host created room with code: ${quiz.code}`);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", "Failed to create room");
    }
  });

  // Player checks if room exists
  socket.on("player:checkRoom", (roomCode) => {
    console.log(`Player checking room: ${roomCode}`);
    const gameState = gameStates[roomCode];
    
    if (!gameState) {
      console.log(`Room not found: ${roomCode}`);
      socket.emit("error", "Room not found");
      return;
    }
    
    if (gameState.started) {
      console.log(`Game already started in room: ${roomCode}`);
      socket.emit("error", "Game already started");
      return;
    }
    
    console.log(`Room valid: ${roomCode}`);
    socket.emit("player:roomValid", roomCode);
  });

// socket/server.js (continued)
socket.on("player:join", ({username, roomCode}) => {
  console.log(`Player ${username} trying to join room: ${roomCode}`);
  const gameState = gameStates[roomCode];
  
  if (!gameState) {
    console.log(`Room not found for join: ${roomCode}`);
    socket.emit("error", "Room not found");
    return;
  }
  
  if (gameState.started) {
    console.log(`Game already started in room: ${roomCode}`);
    socket.emit("error", "Game already started");
    return;
  }
  
  if (gameState.players.some(p => p.username === username)) {
    console.log(`Username ${username} already taken in room: ${roomCode}`);
    socket.emit("error", "Username already taken");
    return;
  }
  
  const player = {
    id: socket.id,
    username: username,
    score: 0
  };
  
  gameState.players.push(player);
  socket.join(roomCode);
  
  socket.emit("player:joined", { 
    roomCode,
    quiz: {
      title: gameState.quiz.title,
      subject: gameState.quiz.subject
    } 
  });
  
  io.to(gameState.host).emit("host:playerJoined", player);
  console.log(`Player ${username} joined room ${roomCode}`);
});

// Host kicks a player
socket.on("host:kickPlayer", ({ roomCode, playerId }) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || gameState.host !== socket.id) {
    return;
  }
  
  const player = gameState.players.find(p => p.id === playerId);
  if (player) {
    gameState.players = gameState.players.filter(p => p.id !== playerId);
    io.to(playerId).emit("player:kicked");
    socket.emit("host:playerKicked", playerId);
    console.log(`Player ${player.username} kicked from room ${roomCode}`);
  }
});

// Host starts the game
socket.on("host:startGame", (roomCode) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || gameState.host !== socket.id) {
    return;
  }
  
  gameState.started = true;
  gameState.currentQuestion = 0;
  
  io.to(roomCode).emit("game:starting", { countdown: 3 });
  console.log(`Game starting in room ${roomCode}`);
  
  setTimeout(() => {
    sendQuestion(roomCode);
  }, 3000);
});

// Player submits an answer
socket.on("player:submitAnswer", ({ roomCode, answer }) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || !gameState.started) {
    return;
  }
  
  const player = gameState.players.find(p => p.id === socket.id);
  if (!player) return;
  
  if (gameState.answers.some(a => a.playerId === socket.id)) {
    console.log(`Player ${player.username} already submitted answer`);
    return;
  }
  
  const question = gameState.quiz.questions[gameState.currentQuestion];
  const isCorrect = answer === question.solution;
  
  // Calculate score based on time - faster answers get more points
  // Calculate how many seconds passed since question started
  const now = Date.now();
  const elapsedSeconds = (now - gameState.questionStartTime) / 1000;
  const timeRatio = 1 - (elapsedSeconds / question.time); // 1 at start, 0 at end
  
  // Points are max 1000 for immediate correct answer, decreasing over time
  const points = isCorrect ? Math.round(1000 * Math.max(0, timeRatio)) : 0;
  
  gameState.answers.push({
    playerId: socket.id,
    answer,
    correct: isCorrect,
    points,
    time: elapsedSeconds
  });
  
  player.score += points;
  
  socket.emit("player:answerResult", { 
    correct: isCorrect,
    points,
    time: elapsedSeconds.toFixed(1)
  });
  
  io.to(gameState.host).emit("host:playerAnswered", {
    playerId: socket.id,
    answersCount: gameState.answers.length,
    playersCount: gameState.players.length
  });
  
  console.log(`Player ${player.username} answered question ${gameState.currentQuestion + 1} ${isCorrect ? 'correctly' : 'incorrectly'} in ${elapsedSeconds.toFixed(1)}s - ${points} points`);
  
  // If all players answered, show results
  if (gameState.answers.length === gameState.players.length) {
    console.log(`All players answered in room ${roomCode}, showing results`);
    showResults(roomCode);
  }
});
// Host manually shows results
socket.on("host:showResults", (roomCode) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || gameState.host !== socket.id) {
    return;
  }
  
  console.log(`Host manually showing results in room ${roomCode}`);
  showResults(roomCode);
});

// Host moves to next question
socket.on("host:nextQuestion", (roomCode) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || gameState.host !== socket.id) {
    return;
  }
  
  gameState.currentQuestion++;
  gameState.answers = [];
  
  if (gameState.currentQuestion < gameState.quiz.questions.length) {
    console.log(`Moving to question ${gameState.currentQuestion + 1} in room ${roomCode}`);
    sendQuestion(roomCode);
  } else {
    console.log(`Game over in room ${roomCode}`);
    endGame(roomCode);
  }
});

// Handle disconnect
socket.on("disconnect", () => {
  console.log(`User disconnected: ${socket.id}`);
  
  // Check if this was a host
  for (const roomCode in gameStates) {
    const gameState = gameStates[roomCode];
    
    if (gameState.host === socket.id) {
      // Host disconnected, end the game
      io.to(roomCode).emit("game:hostLeft");
      delete gameStates[roomCode];
      console.log(`Host left, game in room ${roomCode} ended`);
    } else {
      // Check if this was a player
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = gameState.players[playerIndex];
        gameState.players.splice(playerIndex, 1);
        io.to(gameState.host).emit("host:playerLeft", player.id);
        console.log(`Player ${player.username} left room ${roomCode}`);
      }
    }
  }
});
});