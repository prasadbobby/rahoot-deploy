// src/pages/admin/host/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers, FaPlay, FaStepForward, FaTrophy, FaChartBar,
    FaTimes, FaCopy, FaClock, FaCheckCircle, FaTimesCircle,
    FaCircle, FaGamepad, FaChevronRight, FaUserPlus, FaHome, FaCheck
} from 'react-icons/fa';
import CustomConfetti from '@/components/CustomConfetti';
import AppLayout from '@/components/layout/AppLayout';


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
          setGameState('preview');
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
                const quizData = await fetchQuiz(id);
                setQuiz(quizData);
                if (quizData.code) {
                    setRoomCode(quizData.code);
                }
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load quiz');
                router.push('/admin');
            }
        }

        if (isAdmin()) {
            loadQuiz();
        } else {
            toast.error('You do not have permission to host quizzes');
            router.push('/dashboard');
        }
    }, [id, user, isAdmin, router]);

    // Set up socket connection
    useEffect(() => {
        if (!socket || !quiz || !user) return;

        // Create a room for this quiz
        socket.emit('host:createRoom', quiz.id);

        socket.on('host:roomCreated', (code) => {
            setRoomCode(code);
            toast.success(`Room created with code: ${code}`);
        });

        socket.on('host:playerJoined', (player) => {
            setPlayers(prev => [...prev, player]);
            toast(`${player.username} joined`, {
                icon: '👋',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        });

        socket.on('host:playerLeft', (playerId) => {
            setPlayers(prev => {
                const player = prev.find(p => p.id === playerId);
                if (player) {
                    toast(`${player.username} left`);
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
            // Update player answer count without replacing the entire players array
            setPlayers(prevPlayers => {
                return prevPlayers.map(player => {
                    if (player.id === data.playerId) {
                        return { ...player, hasAnswered: true };
                    }
                    return player;
                });
            });
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
            socket.off('host:allPlayersAnswered');
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
            <div className="pt-28 flex justify-center items-center h-[calc(100vh-7rem)]">
                <div className="text-center">
                    <div className="relative animate-spin w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-t-brand-red border-b-brand-blue border-l-brand-yellow border-r-brand-green"></div>
                    </div>
                    <p className="text-xl font-semibold">
                        Loading quiz...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAdmin()) {
        return (
            <div className="pt-28 flex flex-col items-center justify-center min-h-screen">
                <div className="card max-w-md w-full text-center">
                    <div className="mx-auto p-4 bg-brand-red/10 rounded-full mb-6">
                        <FaTimesCircle className="h-16 w-16 text-brand-red" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You don't have permission to host quizzes.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="btn-primary w-full"
                    >
                        <FaHome className="mr-2" />
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
        <div className="min-h-screen pt-24 pb-12">
            <CustomConfetti active={showConfetti} />

            <div className="fixed top-16 left-0 z-40 w-full bg-gradient-to-r from-brand-red to-brand-orange py-3 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center text-white">
                        <div className="bg-white rounded-full p-1 mr-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-red to-brand-blue flex items-center justify-center text-white">
                                <FaGamepad className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg line-clamp-1">{quiz?.title}</h1>
                            <div className="flex items-center text-sm text-white/80">
                                <span className="mr-3">{quiz?.subject}</span>
                                <div className="flex items-center cursor-pointer" onClick={copyCodeToClipboard}>
                                    <div className="bg-white/20 px-2 py-0.5 rounded font-mono text-sm flex items-center">
                                        {roomCode}
                                        <FaCopy className="ml-1 h-3 w-3" />
                                    </div>
                                    {copySuccess && <span className="ml-2 text-xs animate-pulse">Copied!</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-white/20 text-white rounded-full px-3 py-1 mr-4 flex items-center">
                            <FaUsers className="mr-1" />
                            <span className="font-bold">{players.length}</span>
                        </div>

                        {gameState === 'waiting' && (
                            <button
                                onClick={startGame}
                                disabled={players.length === 0}
                                className={`btn ${players.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-white text-brand-red hover:bg-gray-100'}`}
                            >
                                <FaPlay className="mr-2" />
                                Start Game
                            </button>
                        )}

                        {gameState === 'question' && timeLeft > 0 && (
                            <button
                                onClick={showResults}
                                className={`btn ${allPlayersAnswered ? 'bg-white text-brand-red animate-pulse' : 'bg-white text-brand-red'}`}
                            >
                                <FaChartBar className="mr-2" />
                                {allPlayersAnswered ? 'All Answered!' : 'Show Results'}
                            </button>
                        )}

                        {gameState === 'results' && (
                            <button
                                onClick={nextQuestion}
                                className="btn bg-white text-brand-blue"
                            >
                                <FaStepForward className="mr-2" />
                                Next Question
                            </button>
                        )}

                        {gameState === 'final' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="btn bg-white text-purple-600"
                            >
                                End Game
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area with Game States */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
                <AnimatePresence mode="wait">
                    {gameState === 'waiting' && (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                        >
                            {/* Waiting Room Instructions */}
                            <div className="lg:col-span-3">
                                <div className="card h-full flex flex-col">
                                    <div className="rounded-xl overflow-hidden mb-6">
                                        <div className="bg-gradient-to-r from-brand-red to-brand-orange p-6 text-white text-center relative">
                                            <h2 className="text-3xl font-bold mb-2">Waiting for Players</h2>
                                            <p className="text-white/80 text-lg">Share this code with your participants</p>

                                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                                                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white animate-float"></div>
                                                <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white animate-float" style={{ animationDelay: '1s' }}></div>
                                                <div className="absolute bottom-5 left-1/4 w-12 h-12 rounded-full bg-white animate-float" style={{ animationDelay: '0.5s' }}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center p-8 bg-brand-dark text-white">
                                            <div className="text-5xl md:text-6xl font-bold tracking-wider font-mono">{roomCode}</div>
                                            <button
                                                onClick={copyCodeToClipboard}
                                                className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                                aria-label="Copy code"
                                            >
                                                <FaCopy className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center p-6 flex-grow flex flex-col justify-center">
                                        <div className="text-6xl font-bold mb-6 text-gray-200 dark:text-gray-700">{players.length}</div>
                                        <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">Players have joined</p>

                                        <div className="relative">
                                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-200 dark:border-gray-700"></div>
                                            <div className="relative z-10 bg-white dark:bg-brand-dark-card inline-block px-4">
                                                <FaUserPlus className="inline-block text-gray-400 dark:text-gray-600 mr-2" />
                                                <span className="text-gray-500 dark:text-gray-400">Waiting for players to join...</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            onClick={startGame}
                                            disabled={players.length === 0}
                                            className={`w-full btn ${players.length === 0 ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                                        >
                                            <FaPlay className="mr-2" />
                                            Start Game ({players.length} {players.length === 1 ? 'player' : 'players'})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Player List */}
                            <div className="lg:col-span-2">
                                <div className="card h-full flex flex-col">
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                        <h3 className="text-xl font-bold flex items-center">
                                            <FaUsers className="mr-2 text-brand-blue" />
                                            Players
                                        </h3>
                                        <div className="bg-brand-blue/10 text-brand-blue text-sm font-medium px-3 py-1 rounded-full">
                                            {players.length}
                                        </div>
                                    </div>

                                    <div className="flex-grow p-4 overflow-y-auto max-h-[400px]">
                                        {players.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                                    <FaUsers className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-2">No players yet</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                                    Share the game code to let players join
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                                {players.map((player) => (
                                                    <motion.div
                                                        key={player.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-brand-red text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">
                                                                {player.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium truncate max-w-[120px]">{player.username}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => kickPlayer(player.id)}
                                                            className="text-gray-400 hover:text-brand-red transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <FaTimes className="h-4 w-4" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                            className="grid grid-cols-1 lg:grid-cols-6 gap-8"
                        >
                            {/* Question Display */}
                            <div className="lg:col-span-4">
                                <div className="card">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="badge bg-brand-blue/10 text-brand-blue px-3 py-1">
                                            Question {question.questionIndex + 1} of {question.totalQuestions}
                                        </div>
                                        <div className="flex items-center text-xl font-bold text-brand-red">
                                            <FaClock className="mr-2" />
                                            {timeLeft}s
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold mb-6">
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

                                    <div className="mb-6">
                                        <div className="question-timer">
                                            <div
                                                className="timer-progress"
                                                style={{ width: `${(timeLeft / question.time) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {question.answers.map((answer, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-xl text-white font-medium flex items-center justify-between ${index === 0 ? 'bg-brand-red' :
                                                        index === 1 ? 'bg-brand-blue' :
                                                            index === 2 ? 'bg-brand-yellow text-gray-800' : 'bg-brand-green'
                                                    } ${index === question.solution ? 'ring-4 ring-white dark:ring-gray-800' : ''
                                                    }`}
                                            >
                                                <span>{answer}</span>
                                                {index === question.solution && (
                                                    <div className="text-white bg-white/20 rounded-full p-1">
                                                        <FaCheck className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">Correct answer: {question.answers[question.solution]}</p>
                                        </div>
                                        <button
                                            onClick={showResults}
                                            className={`btn ${allPlayersAnswered ? 'btn-success animate-pulse' : 'btn-primary'}`}
                                        >
                                            <FaChartBar className="mr-2" />
                                            {allPlayersAnswered ? 'All Answered!' : 'Show Results'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Player Status */}
                            <div className="lg:col-span-2">
                                <div className="card h-full flex flex-col">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="font-bold flex items-center">
                                            <FaUsers className="mr-2 text-brand-blue" />
                                            Player Responses
                                        </h3>
                                    </div>

                                    <div className="p-4 text-center flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold mb-2 flex items-baseline">
                                            <span className="text-brand-green">{players.filter(p => p.hasAnswered).length}</span>
                                            <span className="mx-2 text-gray-400">/</span>
                                            <span>{players.length}</span>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">players have answered</p>

                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                                            <div
                                                className="bg-brand-green h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${players.length > 0 ? (players.filter(p => p.hasAnswered).length / players.length) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex-grow p-4 overflow-y-auto">
                                        <div className="space-y-2">
                                            {players.map((player) => (
                                                <div
                                                    key={player.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="bg-brand-red text-white h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3">
                                                            {player.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium">{player.username}</span>
                                                    </div>
                                                    {player.hasAnswered ? (
                                                        <span className="badge badge-success flex items-center">
                                                            <FaCheckCircle className="mr-1" />
                                                            Answered
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                            Waiting...
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

{gameState === 'preview' && question && (
  <motion.div
    key="preview"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="card max-w-4xl mx-auto"
  >
    <div className="flex justify-between items-center mb-6">
      <span className="badge badge-primary">
        Question {question.questionIndex + 1} of {question.totalQuestions}
      </span>
      <div className="badge badge-secondary flex items-center">
        <FaClock className="mr-1" />
        Preview: {previewTimeLeft}s
      </div>
    </div>
    
    <h2 className="text-2xl font-bold mb-6 text-center">
      {question.question}
    </h2>

    {question.image && (
      <div className="mb-6 flex justify-center">
        <img
          src={question.image}
          alt="Question"
          className="max-h-64 rounded-lg shadow-md"
        />
      </div>
    )}

    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Players are currently previewing the question
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Answer options will appear soon
      </p>
    </div>

    <div className="question-timer mb-4">
      <div
        className="timer-progress bg-brand-yellow"
        style={{ width: `${(previewTimeLeft / question.previewTime) * 100}%` }}
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
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Answer Distribution */}
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <FaChartBar className="mr-2 text-brand-blue" />
                                    Results
                                </h2>

                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm text-gray-500">Correct Answers</div>
                                        <div className="font-bold text-brand-green">{questionResults.correctCount} / {questionResults.totalAnswers}</div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-brand-green h-2.5 rounded-full"
                                            style={{ width: `${questionResults.totalAnswers > 0 ? (questionResults.correctCount / questionResults.totalAnswers) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    {question.answers.map((answer, index) => {
                                        const count = questionResults.answerCounts[index] || 0;
                                        const percent = Math.round((count / questionResults.totalAnswers) * 100) || 0;

                                        return (
                                            <div key={index} className="flex flex-col">
                                                <div className={`p-3 rounded-t-lg text-white ${index === question.solution ? 'bg-brand-green' :
                                                    index === 0 ? 'bg-brand-red' :
                                                        index === 1 ? 'bg-brand-blue' :
                                                            index === 2 ? 'bg-brand-yellow text-gray-800' : 'bg-brand-green'
                                                    }`}>
                                                    <div className="flex justify-between items-center">
                                                        <span>{answer}</span>
                                                        {index === question.solution && (
                                                            <FaCheckCircle className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-100 dark:bg-gray-800 rounded-b-lg p-3">
                                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded">
                                                        <div
                                                            className={`h-6 rounded transition-all duration-500 ${index === question.solution ? 'bg-brand-green' : 'bg-brand-blue'}`}
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

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-end">
                                    <button
                                        onClick={nextQuestion}
                                        className="btn-primary"
                                    >
                                        <FaChevronRight className="mr-2" />
                                        Next Question
                                    </button>
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <div className="card">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold flex items-center">
                                        <FaTrophy className="mr-2 text-brand-yellow" />
                                        Leaderboard
                                    </h2>
                                    <div className="badge bg-brand-blue/10 text-brand-blue px-3 py-1">
                                        {leaderboard.length} Players
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                                    {leaderboard.map((player, index) => (
                                        <div
                                            key={player.id}
                                            className={`flex items-center p-4 rounded-xl ${index === 0 ? 'bg-brand-yellow/10 border border-brand-yellow/20' :
                                                    index === 1 ? 'bg-gray-100 dark:bg-gray-800' :
                                                        index === 2 ? 'bg-amber-700/10 border border-amber-700/20' :
                                                            'bg-gray-50 dark:bg-gray-800/50'
                                                } transition-all`}
                                        >
                                            <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold mr-4 ${index === 0 ? 'bg-brand-yellow text-gray-800' :
                                                    index === 1 ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white' :
                                                        index === 2 ? 'bg-amber-700 text-white' :
                                                            'bg-brand-blue/10 text-brand-blue'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="font-bold">{player.username}</div>
                                                <div className="text-sm text-gray-500">
                                                    {index === 0 ? '1st Place' :
                                                        index === 1 ? '2nd Place' :
                                                            index === 2 ? '3rd Place' :
                                                                `${index + 1}th Place`}
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-brand-blue">
                                                {player.score}
                                            </div>
                                        </div>
                                    ))}

                                    {leaderboard.length === 0 && (
                                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                            No players have scored yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'final' && (
                        <motion.div
                            key="final"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="card"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
                                <FaTrophy className="text-brand-yellow mr-3" />
                                Game Results
                            </h2>

                            {leaderboard.length > 0 ? (
                                <>
                                    <div className="flex flex-col md:flex-row justify-center items-end gap-8 mb-12">
                                        {leaderboard.length > 1 && (
                                            <div className="flex-1 order-2 md:order-1">
                                                <div className="h-24 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-t-lg flex items-end justify-center p-2">
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-400 dark:bg-gray-500 mb-1 flex items-center justify-center text-white">
                                                            <span className="text-2xl font-bold">2</span>
                                                        </div>
                                                        <p className="font-bold text-gray-800 dark:text-white truncate max-w-[120px] mx-auto">
                                                            {leaderboard[1]?.username}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-200 dark:bg-gray-700 py-3 rounded-b-lg text-center">
                                                    <p className="text-xl font-bold">{leaderboard[1]?.score}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 order-1 md:order-2 z-10">
                                            <div className="h-32 bg-gradient-to-b from-brand-yellow to-yellow-500 rounded-t-lg flex items-end justify-center p-2">
                                                <div className="text-center">
                                                    <div className="w-24 h-24 mx-auto rounded-full bg-yellow-400 border-4 border-white mb-1 flex items-center justify-center">
                                                        <FaTrophy className="text-white text-4xl" />
                                                    </div>
                                                    <p className="text-xl font-bold text-white truncate max-w-[150px] mx-auto">
                                                        {leaderboard[0]?.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-brand-yellow py-3 rounded-b-lg text-center">
                                                <p className="text-2xl font-bold text-gray-800">{leaderboard[0]?.score}</p>
                                            </div>
                                        </div>

                                        {leaderboard.length > 2 && (
                                            <div className="flex-1 order-3">
                                                <div className="h-20 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-lg flex items-end justify-center p-2">
                                                    <div className="text-center">
                                                        <div className="w-14 h-14 mx-auto rounded-full bg-amber-600 mb-1 flex items-center justify-center text-white">
                                                            <span className="text-xl font-bold">3</span>
                                                        </div>
                                                        <p className="font-bold text-white truncate max-w-[120px] mx-auto">
                                                            {leaderboard[2]?.username}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-800 py-3 rounded-b-lg text-center">
                                                    <p className="text-xl font-bold text-white">{leaderboard[2]?.score}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold mb-4">All Players</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {leaderboard.slice(3).map((player, index) => (
                                                <div
                                                    key={player.id}
                                                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold mr-3">
                                                        {index + 4}
                                                    </div>
                                                    <div className="flex-grow font-medium">
                                                        {player.username}
                                                    </div>
                                                    <div className="font-bold text-brand-blue">
                                                        {player.score}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full inline-block mb-4">
                                        <FaUsers className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No Players Completed the Quiz</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">Try again with at least one player.</p>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="btn-primary btn-lg"
                                >
                                    End Game
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        </AppLayout>
    );
}