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
  
  // First, send only the question for preview (without answers)
  io.to(roomCode).emit("game:questionPreview", {
    questionIndex: gameState.currentQuestion,
    totalQuestions: gameState.quiz.questions.length,
    question: question.question,
    image: question.image,
    previewTime: 5 // 5 seconds preview time
  });
  
  // After 5 seconds, send the full question with answers and start the timer
  setTimeout(() => {
    // Record when the actual answering period started for timing calculations
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
    }, (question.time * 1000));
  }, 5000); // 5 seconds delay
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
  
  // Send to all players with their individual results
  gameState.players.forEach(player => {
    const playerAnswer = gameState.answers.find(a => a.playerId === player.id);
    
    io.to(player.id).emit("game:questionResults", {
      solution: question.solution,
      answerCounts,
      totalAnswers: gameState.answers.length,
      correctCount,
      leaderboard: gameState.leaderboard,
      playerResult: playerAnswer ? {
        correct: playerAnswer.correct,
        points: playerAnswer.points,
        time: playerAnswer.time,
        answer: playerAnswer.answer
      } : null
    });
  });
}
function endGame(roomCode) {
  const gameState = gameStates[roomCode];
  if (!gameState) return;
  
  // Sort players by score
  const finalLeaderboard = [...gameState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Send final results
  io.to(roomCode).emit("game:end", {
    leaderboard: finalLeaderboard.map(player => ({
      id: player.id,
      username: player.username,
      score: player.score || 0,
      userId: player.userId || player.username
    }))
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
      quizSubject: gameState.quiz.subject || '',
      date: new Date().toISOString(),
      players: finalLeaderboard.map(p => ({
        username: p.username,
        userId: p.userId || p.username, // Ensure there's a user identifier
        score: p.score || 0
      }))
    };
    
    data.results.push(gameResult);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Game results saved with ${finalLeaderboard.length} players`);
  } catch (error) {
    console.error("Error saving game results:", error);
  }
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
socket.on("player:join", ({username, roomCode, userId}) => {
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

  let playerData = {
    username: username,
    room: roomCode,
    id: socket.id,
    userId: userId || username, // Use username as fallback if no userId
    score: 0
  };
  gameState.players.push(playerData);
  
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

// In the player:submitAnswer handler
socket.on("player:submitAnswer", ({ roomCode, answer }) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || !gameState.started) return;
  
  const player = gameState.players.find(p => p.id === socket.id);
  if (!player || gameState.answers.some(a => a.playerId === socket.id)) return;
  
  const question = gameState.quiz.questions[gameState.currentQuestion];
  const isCorrect = answer === question.solution;
  
  // Calculate score based on time (1000 points max for instant answer)
  const now = Date.now();
  const elapsedSeconds = (now - gameState.questionStartTime) / 1000;
  const timeRatio = Math.max(0, 1 - (elapsedSeconds / question.time));
  const points = isCorrect ? Math.round(1000 * timeRatio) : 0;
  
  console.log(`Player ${player.username} scored ${points} points`);
  
  // IMPORTANT: Update player's cumulative score
  player.score = (player.score || 0) + points;
  
  gameState.answers.push({
    playerId: socket.id,
    answer,
    correct: isCorrect,
    points,
    time: elapsedSeconds,
    userId: player.userId // Store user ID for persistence
  });
  
  socket.emit("player:answerSubmitted", { 
    answerIndex: answer,
    time: elapsedSeconds.toFixed(1),
    points: points,
    totalScore: player.score
  });
  
  io.to(gameState.host).emit("host:playerAnswered", {
    playerId: socket.id,
    username: player.username,
    answersCount: gameState.answers.length,
    playersCount: gameState.players.length
  });
});

// Modify the host:showResults handler
socket.on("host:showResults", (roomCode) => {
  const gameState = gameStates[roomCode];
  
  if (!gameState || gameState.host !== socket.id) {
    return;
  }
  
  console.log(`Host manually showing results in room ${roomCode}`);
  
  // This is when we update player scores
  gameState.answers.forEach(answer => {
    if (answer.correct) {
      const player = gameState.players.find(p => p.id === answer.playerId);
      if (player) {
        player.score += answer.points;
      }
    }
  });
  
  // Now show results to everyone
  showResults(roomCode);
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