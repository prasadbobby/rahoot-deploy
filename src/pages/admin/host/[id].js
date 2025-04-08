// src/pages/admin/host/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlay, FaStepForward, FaTrophy, FaChartBar, FaTimes, FaCopy } from 'react-icons/fa';
import CustomConfetti from '@/components/CustomConfetti';

export default function HostQuiz() {
    const router = useRouter();
    const { id } = router.query;
    const { user, isAdmin } = useAuth();
    const { socket } = useSocket();
    const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [gameState, setGameState] = useState('waiting'); // waiting, preview, question, results, leaderboard, final
    const [previewTimeLeft, setPreviewTimeLeft] = useState(0);
    const [players, setPlayers] = useState([]);
    const [roomCode, setRoomCode] = useState('');
    const [question, setQuestion] = useState(null);
    const [questionResults, setQuestionResults] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('game:questionPreview', (data) => {
            setQuestion(data);
            setPreviewTimeLeft(data.previewTime);
            setGameState('preview');

            const timer = setInterval(() => {
                setPreviewTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        return () => {
            socket.off('game:questionPreview');
        };
    }, [socket]);

    // Load quiz data
    useEffect(() => {
        if (!id || !user) return;

        async function loadQuiz() {
            try {
                console.log("Loading quiz with ID:", id);
                const quizData = await fetchQuiz(id);
                console.log("Quiz data loaded:", quizData);
                setQuiz(quizData);
                // If quiz has a code, set it directly
                if (quizData.code) {
                    setRoomCode(quizData.code);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to load quiz:', error);
                toast.error('Failed to load quiz');
                router.push('/admin');
            }
        }

        if (isAdmin()) {
            loadQuiz();
        } else {
            router.push('/dashboard');
        }
    }, [id, user, isAdmin, router]);

    // Set up socket connection
    useEffect(() => {
        if (!socket || !quiz || !user) return;

        console.log("Setting up socket for quiz:", quiz.id);

        // Create a room for this quiz
        socket.emit('host:createRoom', quiz.id);

        socket.on('host:roomCreated', (code) => {
            console.log("Room created with code:", code);
            setRoomCode(code);
            toast.success(`Room created with code: ${code}`);
        });

        socket.on('host:playerJoined', (player) => {
            console.log("Player joined:", player);
            setPlayers(prev => [...prev, player]);
            toast(`${player.username} joined`, { icon: '👋' });
        });

        socket.on('host:playerLeft', (playerId) => {
            setPlayers(prev => {
                const player = prev.find(p => p.id === playerId);
                if (player) {
                    toast(`${player.username} left`, { icon: '👋' });
                }
                return prev.filter(p => p.id !== playerId);
            });
        });

        socket.on('host:playerKicked', (playerId) => {
            setPlayers(prev => prev.filter(p => p.id !== playerId));
        });

        socket.on('host:question', (data) => {
            setQuestion(data);
            setTimeLeft(data.time);
            setGameState('question');

            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on('host:playerAnswered', (data) => {
            // Update UI to show player answered
            console.log("Player answered:", data);
        });

        socket.on('host:questionResults', (data) => {
            setQuestionResults(data);
            setLeaderboard(data.leaderboard);
            setGameState('results');
        });

        socket.on('game:end', (data) => {
            setLeaderboard(data.leaderboard);
            setGameState('final');
            setShowConfetti(true);

            // Hide confetti after some time
            setTimeout(() => {
                setShowConfetti(false);
            }, 7000);
        });

        socket.on('error', (message) => {
            toast.error(message);
        });
        socket.on('host:allPlayersAnswered', () => {
            setAllPlayersAnswered(true);
          });

        return () => {
            socket.off('host:roomCreated');
            socket.off('host:playerJoined');
            socket.off('host:playerLeft');
            socket.off('host:playerKicked');
            socket.off('host:question');
            socket.off('host:playerAnswered');
            socket.off('host:questionResults');
            socket.off('game:end');
            socket.off('error');
        };
    }, [socket, quiz, user]);

    const startGame = () => {
        if (players.length === 0) {
            toast.error('You need at least one player to start the game');
            return;
        }

        socket.emit('host:startGame', roomCode);
    };

    const showResults = () => {
        socket.emit('host:showResults', roomCode);
    };

    const nextQuestion = () => {
        socket.emit('host:nextQuestion', roomCode);
    };

    const kickPlayer = (playerId) => {
        socket.emit('host:kickPlayer', { roomCode, playerId });
    };

    const copyCodeToClipboard = () => {
        navigator.clipboard.writeText(roomCode);
        setCopySuccess(true);
        toast.success('Game PIN copied to clipboard!');
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Loading quiz...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <CustomConfetti active={showConfetti} />

            {/* Header with quiz info and controls */}
            <div className="bg-indigo-600 text-white p-4 md:p-6 shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                        <p>{quiz.subject} • {quiz.questions.length} questions</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                        {gameState === 'waiting' && (
                            <button
                                onClick={startGame}
                                disabled={players.length === 0}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center ${players.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                <FaPlay className="mr-2" />
                                Start Game
                            </button>
                        )}

                        {gameState === 'question' && timeLeft > 0 && (
                            <button
                                onClick={showResults}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-medium flex items-center"
                            >
                                <FaChartBar className="mr-2" />
                                Show Results
                            </button>
                        )}

                        {gameState === 'preview' && question && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Question {question.questionIndex + 1} of {question.totalQuestions}
                                    </span>
                                    <span className="text-2xl font-bold text-yellow-500">
                                        Preview: {previewTimeLeft}s
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold mb-6 dark:text-white">
                                    {question.question}
                                </h2>

                                {question.image && (
                                    <div className="flex justify-center mb-6">
                                        <img
                                            src={question.image}
                                            alt="Question"
                                            className="max-h-64 rounded-lg shadow-md"
                                        />
                                    </div>
                                )}

                                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                                    Showing question to players. Answers will appear in {previewTimeLeft} seconds...
                                </p>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full mb-6">
                                    <div
                                        className="bg-yellow-500 h-4 rounded-full transition-all duration-1000"
                                        style={{ width: `${(previewTimeLeft / question.previewTime) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8 opacity-50">
                                    {/* Use placeholders instead of trying to map over answers */}
                                    {[0, 1, 2, 3].map((index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg text-white font-medium ${index === 0 ? 'bg-red-500' :
                                                    index === 1 ? 'bg-blue-500' :
                                                        index === 2 ? 'bg-yellow-500' : 'bg-green-500'
                                                } h-16 animate-pulse`}
                                        >
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center">
                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        Players are reviewing the question
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'results' && (
                            <button
                                onClick={nextQuestion}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium flex items-center"
                            >
                                <FaStepForward className="mr-2" />
                                Next Question
                            </button>
                        )}

                        {gameState === 'final' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium flex items-center"
                            >
                                End Game
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Game PIN */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">Game PIN:</span>
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{roomCode}</span>
                        <button
                            onClick={copyCodeToClipboard}
                            className="ml-2 text-indigo-500 hover:text-indigo-700 p-1"
                        >
                            <FaCopy />
                        </button>
                        {copySuccess && <span className="ml-2 text-green-500 text-sm">Copied!</span>}
                    </div>

                    <div className="flex items-center">
                        <FaUsers className="text-indigo-600 dark:text-indigo-400 mr-2" />
                        <span className="font-bold">{players.length}</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    {gameState === 'waiting' && (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col lg:flex-row gap-8"
                        >
                            <div className="lg:w-1/2">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white">
                                        Waiting for Players
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Share the Game PIN with your players
                                    </p>

                                    <div className="bg-indigo-600 text-white text-4xl font-bold rounded-lg p-6 text-center mb-6">
                                        {roomCode}
                                    </div>

                                    <button
                                        onClick={startGame}
                                        disabled={players.length === 0}
                                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center ${players.length === 0
                                            ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                    >
                                        <FaPlay className="mr-2" />
                                        Start Game ({players.length} {players.length === 1 ? 'player' : 'players'})
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold mb-4 dark:text-white">
                                        Quiz Details
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">Title:</span>
                                            <p className="font-medium dark:text-white">{quiz.title}</p>
                                        </div>

                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">Subject:</span>
                                            <p className="font-medium dark:text-white">{quiz.subject}</p>
                                        </div>

                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">Questions:</span>
                                            <p className="font-medium dark:text-white">{quiz.questions.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-1/2">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold dark:text-white">
                                            Players ({players.length})
                                        </h2>
                                    </div>

                                    {players.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                            <FaUsers className="text-gray-400 dark:text-gray-600 text-5xl mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No players have joined yet
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Share the Game PIN with your players
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                                            {players.map((player) => (
                                                <motion.div
                                                    key={player.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
                                                >
                                                    <span className="font-medium dark:text-white">{player.username}</span>
                                                    <button
                                                        onClick={() => kickPlayer(player.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

{gameState === 'question' && question && (
  <motion.div
    key="question"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
  >
    <div className="flex justify-between items-center mb-6">
      <span className="text-gray-600 dark:text-gray-400">
        Question {question.questionIndex + 1} of {question.totalQuestions}
      </span>
      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        {timeLeft}s
      </span>
    </div>
    
    <h2 className="text-2xl font-bold mb-6 dark:text-white">
      {question.question}
    </h2>
    
    {question.image && (
      <div className="flex justify-center mb-6">
        <img 
          src={question.image} 
          alt="Question" 
          className="max-h-64 rounded-lg shadow-md" 
        />
      </div>
    )}
    
    <div className="grid grid-cols-2 gap-4 mb-8">
      {question.answers.map((answer, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg text-white font-medium ${
            index === 0 ? 'bg-red-500' : 
            index === 1 ? 'bg-blue-500' : 
            index === 2 ? 'bg-yellow-500' : 'bg-green-500'
          } ${
            index === question.solution ? 'ring-4 ring-gray-300 dark:ring-gray-600' : ''
          }`}
        >
          {answer}
          {index === question.solution && (
            <div className="text-sm mt-1 font-normal">
              ✓ Correct Answer
            </div>
          )}
        </div>
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <FaUsers className="text-indigo-600 dark:text-indigo-400 mr-2" />
        <span className="font-medium dark:text-white">
          {gameState.answers ? gameState.answers.length : 0} / {players.length} players answered
        </span>
      </div>
      
      {/* Add a pulsing effect when all players have answered */}
      <button
        onClick={showResults}
        className={`px-4 py-2 text-white rounded-lg font-medium flex items-center ${
          allPlayersAnswered ? 'bg-green-500 hover:bg-green-600 animate-pulse' : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        <FaChartBar className="mr-2" />
        {allPlayersAnswered ? 'All Answered! Show Results' : 'Show Results'}
      </button>
    </div>
    
    {/* Progress bar */}
    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4">
      <div 
        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
        style={{ width: `${(timeLeft / question.time) * 100}%` }}
      ></div>
    </div>
  </motion.div>
)}

                    {gameState === 'results' && questionResults && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                        >
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">
                                Results
                            </h2>

                            <div className="mb-8">
                                <div className="text-center mb-4">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {questionResults.correctCount} out of {questionResults.totalAnswers} answered correctly
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {question.answers.map((answer, index) => {
                                        const count = questionResults.answerCounts[index] || 0;
                                        const percent = Math.round((count / questionResults.totalAnswers) * 100) || 0;

                                        return (
                                            <div key={index} className="flex flex-col">
                                                <div className={`p-3 rounded-t-lg text-white ${index === question.solution ? 'bg-green-600' :
                                                    index === 0 ? 'bg-red-500' :
                                                        index === 1 ? 'bg-blue-500' :
                                                            index === 2 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}>
                                                    <div className="flex justify-between items-center">
                                                        <span>{answer}</span>
                                                        {index === question.solution && (
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-b-lg p-3">
                                                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded">
                                                        <div
                                                            className={`h-6 rounded ${index === question.solution ? 'bg-green-600' : 'bg-indigo-600'
                                                                }`}
                                                            style={{ width: `${percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span>{count} {count === 1 ? 'player' : 'players'}</span>
                                                        <span>{percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 mb-8">
                                    <div className="flex items-center mb-4">
                                        <FaTrophy className="text-yellow-500 mr-2" />
                                        <h3 className="text-xl font-bold dark:text-white">Leaderboard</h3>
                                    </div>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {leaderboard.map((player, index) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-grow font-medium dark:text-white">
                                                    {player.username}
                                                </div>
                                                <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {player.score}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <FaTrophy className="text-yellow-500 mr-2" />
                                    <h3 className="text-xl font-bold dark:text-white">Leaderboard</h3>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {leaderboard.map((player, index) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow font-medium dark:text-white">
                                                {player.username}
                                            </div>
                                            <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {player.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={nextQuestion}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                            >
                                <FaStepForward className="mr-2" />
                                Next Question
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'final' && (
                        <motion.div
                            key="final"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
                                Game Over!
                            </h2>

                            <div className="flex flex-col md:flex-row justify-center gap-8 mb-10">
                                {leaderboard.length > 0 && leaderboard[0] && (
                                    <div className="flex flex-col items-center">
                                        <div className="text-4xl font-bold text-yellow-500 mb-2">🏆</div>
                                        <div className="bg-yellow-100 dark:bg-yellow-900 rounded-xl p-6 text-center">
                                            <div className="text-xl font-bold mb-1 dark:text-white">Winner</div>
                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                                                {leaderboard[0].username}
                                            </div>
                                            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {leaderboard[0].score}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {leaderboard.length > 1 && (
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl font-bold text-gray-400 mb-2">🥈</div>
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
                                            <div className="text-lg font-bold mb-1 dark:text-white">2nd Place</div>
                                            <div className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                                                {leaderboard[1].username}
                                            </div>
                                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {leaderboard[1].score}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {leaderboard.length > 2 && (
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl font-bold text-yellow-700 mb-2">🥉</div>
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
                                            <div className="text-lg font-bold mb-1 dark:text-white">3rd Place</div>
                                            <div className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                                                {leaderboard[2].username}
                                            </div>
                                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {leaderboard[2].score}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-indigo-600 dark:text-indigo-400 mr-2" />
                                    <h3 className="text-xl font-bold dark:text-white">All Players</h3>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {leaderboard.map((player, index) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow font-medium dark:text-white">
                                                {player.username}
                                            </div>
                                            <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {player.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/admin')}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
                            >
                                End Game
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}