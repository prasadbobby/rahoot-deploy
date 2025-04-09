import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay, FaClock, FaTrophy, FaArrowRight, FaCheck,
  FaTimes, FaHourglassHalf, FaUserAlt, FaCode, FaHome,
  FaBolt, FaExclamationCircle, FaMusic, FaVolumeUp, FaVolumeMute
} from 'react-icons/fa';

export default function PlayQuiz() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { socket } = useSocket();

  const [quiz, setQuiz] = useState(null);
  const [gameState, setGameState] = useState('joining'); // joining, waiting, countdown, preview, question, waiting, result, leaderboard, end
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [muted, setMuted] = useState(false);

  // Load quiz data
  useEffect(() => {
    if (!id || !user) return;

    async function loadQuiz() {
      try {
        const quizData = await fetchQuiz(id);
        setQuiz(quizData);
        setRoomCode(quizData.code);
        setUsername(user.name);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load quiz', {
          icon: '❌',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        router.push('/dashboard');
      }
    }

    loadQuiz();
  }, [id, user, router]);

  // Join game when quiz is loaded
  useEffect(() => {
    if (!socket || !roomCode || !username || !user) return;
  
    // Check if room exists
    socket.emit('player:checkRoom', roomCode);
  
    socket.on('player:roomValid', (code) => {
      // Join the room with user identification
      socket.emit('player:join', { 
        username, 
        roomCode: code,
        userId: user.id || user.email || username // Pass user ID for tracking
      });
    });

    socket.on('player:joined', (data) => {
      setGameState('waiting');
      toast.success('Joined the game!', {
        icon: '🎮',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    });

    socket.on('error', (message) => {
      toast.error(message, {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      router.push('/dashboard');
    });

    return () => {
      socket.off('player:roomValid');
      socket.off('player:joined');
      socket.off('error');
    };
  }, [socket, roomCode, username, router]);

  // Set up other socket listeners once joined
  useEffect(() => {
    if (!socket || gameState === 'joining') return;

    socket.on('player:kicked', () => {
      toast.error('You were kicked from the game', {
        icon: '👢',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      router.push('/dashboard');
    });

    socket.on('game:starting', (data) => {
      setCountdown(data.countdown);
      setGameState('countdown');

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

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

    socket.on('game:question', (data) => {
      setQuestion(data);
      setSelectedAnswer(null);
      setResult(null);
      setGameState('question');
      setTimeLeft(data.time);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('player:answerSubmitted', (data) => {
      setSelectedAnswer(data.answerIndex);
      setGameState('waiting');
    });

    socket.on('game:questionResults', (data) => {
      if (data.playerResult) {
        setResult(data.playerResult);
      }

      setLeaderboard(data.leaderboard);
      setGameState('result');
    });

    socket.on('game:end', (data) => {
      setLeaderboard(data.leaderboard);
      setGameState('end');
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
    });

    socket.on('game:hostLeft', () => {
      toast.error('The host left the game', {
        icon: '👋',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      router.push('/dashboard');
    });

    return () => {
      socket.off('player:kicked');
      socket.off('game:starting');
      socket.off('game:questionPreview');
      socket.off('game:question');
      socket.off('player:answerSubmitted');
      socket.off('game:questionResults');
      socket.off('game:end');
      socket.off('game:hostLeft');
    };
  }, [socket, gameState, router]);

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null || gameState !== 'question') return;

    setSelectedAnswer(index);
    socket.emit('player:submitAnswer', { roomCode, answer: index });
  };

  if (loading) {
    return (
      <div className="quiz-container flex justify-center items-center min-h-[80vh]">
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

  return (
    <div className="quiz-container min-h-screen">
      {/* Game Header */}
      <header className="fixed top-16 left-0 right-0 z-30 bg-white dark:bg-brand-dark-card shadow-md py-2">
        <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-brand-red to-brand-blue rounded-full h-8 w-8 flex items-center justify-center mr-2">
              <div className="bg-white dark:bg-brand-dark h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-brand-red">Q</div>
            </div>
            <div>
              <p className="font-bold text-sm line-clamp-1">{quiz?.title || 'Quiz'}</p>
              <div className="flex items-center">
                <span className="badge badge-primary text-xs mr-2">{quiz?.subject}</span>
                {roomCode && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                    <FaCode className="mr-1 text-xs" />
                    {roomCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button 
              onClick={() => setMuted(!muted)}
              className="mr-3 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <FaVolumeMute className="h-4 w-4" /> : <FaVolumeUp className="h-4 w-4" />}
              </button>
            <div className="flex items-center mr-3">
              <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center text-white">
                <FaUserAlt className="h-4 w-4" />
              </div>
              <p className="ml-2 font-medium text-sm hidden sm:block">{username}</p>
            </div>
            {gameState !== 'joining' && gameState !== 'waiting' && gameState !== 'countdown' && gameState !== 'end' && (
              <div className="bg-brand-red text-white px-3 py-1 rounded-full text-sm font-bold">
                {timeLeft > 0 ? `${timeLeft}s` : 'Time up!'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confetti Effect for Correct Answers and End Game */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 150 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-sm animate-fall"
              style={{
                left: `${Math.random() * 100}vw`,
                top: `-${Math.random() * 20}vh`,
                width: `${5 + Math.random() * 15}px`,
                height: `${5 + Math.random() * 15}px`,
                backgroundColor: [
                  '#FF3366', '#00CCFF', '#FFD166', '#06D6A0',
                  '#EF476F', '#118AB2', '#FFD166', '#06D6A0'
                ][Math.floor(Math.random() * 8)],
                '--fall-duration': `${2 + Math.random() * 5}s`,
                '--fall-delay': `${Math.random() * 5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Game States */}
      <AnimatePresence mode="wait">
        {gameState === 'joining' && (
          <motion.div
            key="joining"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-6 max-w-md mx-auto pt-20"
          >
            <div className="card w-full text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red to-brand-blue rounded-full animate-spin-slow"></div>
                <div className="absolute inset-2 bg-white dark:bg-brand-dark-card rounded-full flex items-center justify-center text-gradient text-2xl font-bold">R</div>
              </div>

              <h1 className="text-2xl font-bold mb-4">
                Joining Game
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connecting to {quiz?.title}...
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                <span className="text-brand-blue font-mono font-bold">{roomCode}</span>
                <span className="badge badge-primary animate-pulse">Connecting...</span>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-6 max-w-md mx-auto pt-20"
          >
            <div className="card w-full">
              <div className="relative w-full h-32 mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-brand-red to-brand-blue">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <h1 className="text-2xl font-bold">Waiting for Host</h1>
                </div>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 animation-delay-2000">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white animate-float"></div>
                    <div className="absolute right-8 top-16 w-12 h-12 rounded-full bg-white animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute left-1/3 bottom-4 w-10 h-10 rounded-full bg-white animate-float" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">
                  You're in!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The game will start soon. Get ready!
                </p>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-3 sm:mb-0">
                  <div className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center text-white mr-3">
                    <FaUserAlt className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{username}</span>
                </div>
                <div className="badge badge-secondary animate-pulse flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-current mr-1 animate-ping"></span>
                  Waiting for host...
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-6 pt-20"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-8 text-gradient">
                Get Ready!
              </h1>
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 mx-auto bg-gradient-to-r from-brand-red to-brand-blue text-white rounded-full flex items-center justify-center text-6xl font-bold"
              >
                {countdown}
              </motion.div>
              <p className="mt-8 text-lg text-gray-600 dark:text-gray-400">
                The quiz is about to start!
              </p>
            </div>
          </motion.div>
        )}

        {gameState === 'preview' && question && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow p-6 max-w-2xl mx-auto min-h-[calc(100vh-7rem)] pt-20"
          >
            <div className="w-full mb-4 flex justify-between items-center">
              <span className="badge badge-primary">
                Question {question.questionIndex + 1} of {question.totalQuestions}
              </span>
              <div className="badge badge-secondary flex items-center">
                <FaClock className="mr-1" />
                Preview: {previewTimeLeft}s
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="card w-full mb-6"
            >
              <h2 className="text-xl font-bold mb-6 text-center">
                {question.question}
              </h2>

              {question.image && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={question.image}
                    alt="Question"
                    className="max-h-60 rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="question-timer mb-4">
                <div
                  className="timer-progress bg-brand-yellow"
                  style={{ width: `${(previewTimeLeft / question.previewTime) * 100}%` }}
                ></div>
              </div>

              <p className="text-center text-gray-600 dark:text-gray-400">
                Get ready! Answers will appear soon...
              </p>
            </motion.div>

            {/* Answer Placeholders */}
            <div className="game-grid opacity-50">
              <div className="answer-box answer-box-red animate-pulse h-14"></div>
              <div className="answer-box answer-box-blue animate-pulse h-14"></div>
              <div className="answer-box answer-box-yellow animate-pulse h-14"></div>
              <div className="answer-box answer-box-green animate-pulse h-14"></div>
            </div>
          </motion.div>
        )}

        {gameState === 'question' && question && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow p-6 max-w-2xl mx-auto min-h-[calc(100vh-7rem)] pt-20"
          >
            <div className="w-full mb-4 flex justify-between items-center">
              <span className="badge badge-primary">
                Question {question.questionIndex + 1} of {question.totalQuestions}
              </span>
              <div className="flex items-center bg-brand-red text-white px-3 py-1 rounded-full">
                <FaClock className="mr-1" />
                <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="card w-full mb-6"
            >
              <h2 className="text-xl font-bold mb-6 text-center">
                {question.question}
              </h2>

              {question.image && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={question.image}
                    alt="Question"
                    className="max-h-60 rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="question-timer mb-2">
                <div
                  className="timer-progress"
                  style={{ width: `${(timeLeft / question.time) * 100}%` }}
                ></div>
              </div>
            </motion.div>

            <div className="game-grid">
              {question.answers.map((answer, index) => (
                <motion.button
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`answer-box ${index === 0 ? 'answer-box-red' :
                      index === 1 ? 'answer-box-blue' :
                        index === 2 ? 'answer-box-yellow' : 'answer-box-green'
                    } ${selectedAnswer === index ? 'ring-4 ring-white dark:ring-gray-800' : ''}`}
                >
                  {answer}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}



{gameState === 'waiting' && selectedAnswer !== null && (
  <motion.div
    key="waiting-answered"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-6 max-w-md mx-auto pt-20"
  >
    <div className="card w-full text-center">
      <div className="mx-auto w-24 h-24 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin"></div>
        <FaHourglassHalf className="w-10 h-10 text-brand-blue" />
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Answer Recorded!
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Waiting for all players to answer... Results will be shown shortly!
      </p>

      <div className="game-grid mb-2">
        {question.answers.map((answer, index) => (
          <div
            key={index}
            className={`answer-box ${selectedAnswer === index
                ? `${index === 0 ? 'answer-box-red' :
                  index === 1 ? 'answer-box-blue' :
                    index === 2 ? 'answer-box-yellow' : 'answer-box-green'} ring-4 ring-white dark:ring-gray-800`
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
          >
            {answer}
          </div>
        ))}
      </div>

      <div className="mt-6 inline-block">
        <div className="badge badge-primary animate-pulse flex items-center">
          <span className="inline-block h-2 w-2 rounded-full bg-current mr-2 animate-ping"></span>
          Results coming soon...
        </div>
      </div>
    </div>
  </motion.div>
)}

        {gameState === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-6 max-w-md mx-auto pt-20"
          >
            <div className="card w-full text-center">
              {result.correct ? (
                <>
                  <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <FaCheck className="w-12 h-12 text-brand-green" />
                  </div>
                  <h2 className="text-3xl font-bold text-brand-green mb-2">
                    Correct!
                  </h2>
                  <div className="badge badge-success inline-block mb-6">
                    +{Math.round(result.points)} points
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <FaTimes className="w-12 h-12 text-brand-red" />
                  </div>
                  <h2 className="text-3xl font-bold text-brand-red mb-6">
                    Incorrect!
                  </h2>
                </>
              )}

              {result.time && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 inline-block">
                  <p className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <FaClock className="mr-2" />
                    You answered in <span className="font-bold ml-1">{result.time.toFixed(1)}s</span>
                  </p>
                </div>
              )}

              {/* Leaderboard preview */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
                <div className="flex items-center justify-center mb-4">
                  <FaTrophy className="text-brand-yellow mr-2" />
                  <h3 className="text-lg font-bold">Current Standing</h3>
                </div>

                {leaderboard.slice(0, 3).map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center p-3 rounded-lg mb-2 ${player.id === socket.id ? 'bg-brand-blue/10 dark:bg-brand-blue/5 border border-brand-blue/20' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                          'bg-amber-700 text-white'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-grow font-medium">
                      {player.username} {player.id === socket.id && '(You)'}
                    </div>
                    <div className="font-bold text-brand-blue">
                      {player.score}
                    </div>
                  </div>
                ))}

                {!leaderboard.slice(0, 3).some(p => p.id === socket.id) &&
                  leaderboard.find(p => p.id === socket.id) && (
                    <div className="mt-2 p-3 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-lg border border-brand-blue/20">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold mr-3">
                          {leaderboard.findIndex(p => p.id === socket.id) + 1}
                        </div>
                        <div className="flex-grow font-medium">
                          {leaderboard.find(p => p.id === socket.id).username} (You)
                        </div>
                        <div className="font-bold text-brand-blue">
                          {leaderboard.find(p => p.id === socket.id).score}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'end' && (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-6 max-w-md mx-auto pt-20"
          >
            <div className="card w-full">
              <div className="text-center mb-8">
                <div className="inline-block p-2 rounded-full bg-gradient-to-r from-brand-red to-brand-blue mb-4">
                  <div className="bg-white dark:bg-brand-dark-card p-3 rounded-full">
                    <FaTrophy className="h-8 w-8 text-brand-yellow" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-gradient">
                  Game Over!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {quiz?.title} - {quiz?.subject}
                </p>
              </div>

              {/* Final Standings */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-center">Final Results</h2>

                <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-6">
                  {leaderboard.length > 1 && (
                    <div className="flex-1 order-2 md:order-1">
                      <div className="h-24 bg-silver-gradient rounded-t-lg flex items-end justify-center p-2">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-gray-300 dark:bg-gray-600 mb-1 flex items-center justify-center">
                            <span className="text-gray-800 dark:text-white font-bold">2</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[100px] mx-auto">
                            {leaderboard[1]?.username}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 py-2 rounded-b-lg">
                        <p className="text-center font-bold">{leaderboard[1]?.score}</p>
                      </div>
                    </div>
                  )}

                  {leaderboard.length > 0 && (
                    <div className="flex-1 order-1 md:order-2">
                      <div className="h-32 bg-gold-gradient rounded-t-lg flex items-end justify-center p-2">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-brand-yellow mb-1 flex items-center justify-center">
                            <FaTrophy className="text-white text-xl" />
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[120px] mx-auto">
                            {leaderboard[0]?.username}
                          </p>
                        </div>
                      </div>
                      <div className="bg-brand-yellow py-2 rounded-b-lg">
                        <p className="text-center font-bold text-gray-800">{leaderboard[0]?.score}</p>
                      </div>
                    </div>
                  )}

                  {leaderboard.length > 2 && (
                    <div className="flex-1 order-3">
                      <div className="h-20 bg-bronze-gradient rounded-t-lg flex items-end justify-center p-2">
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto rounded-full bg-amber-700 mb-1 flex items-center justify-center">
                            <span className="text-white font-bold">3</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[100px] mx-auto">
                            {leaderboard[2]?.username}
                          </p>
                        </div>
                      </div>
                      <div className="bg-amber-800/30 py-2 rounded-b-lg">
                        <p className="text-center font-bold">{leaderboard[2]?.score}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Your position */}
                {leaderboard.find(p => p.id === socket.id) && (
  <div className="bg-brand-blue/10 dark:bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
    <p className="text-center text-gray-700 dark:text-gray-300 mb-2">Your Position</p>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold mr-3">
        {leaderboard.findIndex(p => p.id === socket.id) + 1}
      </div>
      <div className="flex-grow font-medium">
        {leaderboard.find(p => p.id === socket.id).username} (You)
      </div>
      <div className="font-bold text-brand-blue text-xl">
        {leaderboard.find(p => p.id === socket.id).score || 0}
      </div>
    </div>
  </div>
)}
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary w-full"
              >
                Return to Dashboard
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}