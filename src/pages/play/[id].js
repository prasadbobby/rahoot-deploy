// src/pages/play/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaClock, FaTrophy, FaArrowRight } from 'react-icons/fa';
import CustomConfetti from '@/components/CustomConfetti';

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
  
  // Load quiz data
  useEffect(() => {
    if (!id || !user) return;
    
    async function loadQuiz() {
      try {
        console.log("Loading quiz with ID:", id);
        const quizData = await fetchQuiz(id);
        console.log("Quiz data loaded:", quizData);
        setQuiz(quizData);
        setRoomCode(quizData.code);
        setUsername(user.name);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load quiz:', error);
        toast.error('Failed to load quiz');
        router.push('/dashboard');
      }
    }
    
    loadQuiz();
  }, [id, user, router]);
  
  // Join game when quiz is loaded
  useEffect(() => {
    if (!socket || !roomCode || !username) return;
    
    console.log("Checking room:", roomCode);
    // Check if room exists
    socket.emit('player:checkRoom', roomCode);
    
    socket.on('player:roomValid', (code) => {
      console.log("Room valid, joining:", code);
      // Join the room
      socket.emit('player:join', { username, roomCode: code });
    });
    
    socket.on('player:joined', (data) => {
      console.log("Successfully joined game:", data);
      setGameState('waiting');
      toast.success('Successfully joined the game!');
    });
    
    socket.on('error', (message) => {
      console.error("Socket error:", message);
      toast.error(message);
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
      toast.error('You were kicked from the game');
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
      toast.error('The host left the game');
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
    <div className="min-h-screen flex flex-col">
      <CustomConfetti active={showConfetti} />
      
      {/* Game states */}
      <AnimatePresence mode="wait">
        {gameState === 'joining' && (
          <motion.div 
            key="joining"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">
                Joining Game
              </h1>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-600"></div>
              </div>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
                Connecting to game server...
              </p>
            </div>
          </motion.div>
        )}
        
        {gameState === 'waiting' && !selectedAnswer && (
          <motion.div 
            key="waiting-initial"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">
                Waiting for host to start
              </h1>
              <p className="text-center text-indigo-600 dark:text-indigo-400 font-semibold mb-8">
                {quiz?.title}
              </p>
              
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-6 mb-6">
                <p className="text-center text-indigo-800 dark:text-indigo-200 text-lg font-bold">
                  Game Code: {roomCode}
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="h-8 w-8 flex items-center justify-center text-indigo-600 relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {gameState === 'waiting' && selectedAnswer !== null && (
          <motion.div 
            key="waiting-answered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="animate-pulse bg-indigo-100 dark:bg-indigo-900 rounded-full w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                  Answer Submitted
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Waiting for other players and host to reveal results...
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {question.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg text-white font-medium text-lg shadow-lg
                      ${selectedAnswer === index ? 'ring-4 ring-indigo-400' : 'opacity-70'}
                      ${index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        index === 2 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  >
                    {answer}
                  </div>
                ))}
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
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-8 dark:text-white">Get Ready!</h1>
              <motion.div 
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-8xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                {countdown}
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {gameState === 'preview' && question && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow p-6"
          >
            <div className="w-full max-w-2xl mx-auto">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Question {question.questionIndex + 1} of {question.totalQuestions}
                </span>
                <div className="flex items-center bg-indigo-600 text-white px-3 py-1 rounded-full">
                  <span className="font-bold">Preview: {previewTimeLeft}s</span>
                </div>
              </div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
              >
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  {question.question}
                </h2>
                
                {question.image && (
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={question.image} 
                      alt="Question" 
                      className="max-h-60 rounded-lg shadow-md" 
                    />
                  </div>
                )}
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(previewTimeLeft / question.previewTime) * 100}%` }}
                  ></div>
                </div>
                
                <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                  Get ready! Answers will appear soon...
                </p>
              </motion.div>
              
              {/* Placeholder for answers */}
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg text-white font-medium text-lg shadow-lg bg-gray-300 dark:bg-gray-600 animate-pulse h-16`}
                  ></div>
                ))}
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
            className="flex flex-col flex-grow p-6"
          >
            <div className="w-full max-w-2xl mx-auto">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Question {question.questionIndex + 1} of {question.totalQuestions}
                </span>
                <div className="flex items-center bg-indigo-600 text-white px-3 py-1 rounded-full">
                  <FaClock className="mr-1" />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              </div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
              >
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  {question.question}
                </h2>
                
                {question.image && (
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={question.image} 
                      alt="Question" 
                      className="max-h-48 rounded-lg shadow-md" 
                    />
                  </div>
                )}
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / question.time) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-4">
                {question.answers.map((answer, index) => (
                  <motion.button
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-lg text-white font-medium text-lg shadow-lg transition-all hover:scale-105
                      ${selectedAnswer === index ? 'ring-4 ring-white' : ''}
                      ${selectedAnswer !== null && selectedAnswer !== index ? 'opacity-70' : ''}
                      ${index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        index === 2 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  >
                    {answer}
                  </motion.button>
                ))}
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
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              {result.correct ? (
                <>
                  <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                    Correct!
                  </h2>
                </>
              ) : (
                <>
                  <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                    Incorrect!
                  </h2>
                </>
              )}
              
              {result.time && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    You answered in <span className="font-bold">{result.time.toFixed(1)}</span> seconds
                  </p>
                </div>
              )}
              
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4">
                <p className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
                  +{Math.round(result.points)} points
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {gameState === 'leaderboard' && (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <FaTrophy className="text-yellow-500 text-2xl mr-2" />
                <h2 className="text-2xl font-bold dark:text-white">Leaderboard</h2>
              </div>
              
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <motion.div 
                    key={player.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-3 rounded-lg ${
                      player.id === socket.id 
                        ? 'bg-indigo-100 dark:bg-indigo-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-grow font-medium dark:text-white">
                      {player.username} {player.id === socket.id && '(You)'}
                    </div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">
                      {player.score}
                    </div>
                  </motion.div>
                ))}
                
                {leaderboard.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No players have scored yet
                  </p>
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
            className="flex flex-col items-center justify-center flex-grow p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">
                Game Over!
              </h1>
              
              {leaderboard.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <FaTrophy className="text-yellow-500 text-2xl mr-2" />
                    <h2 className="text-xl font-bold dark:text-white">Final Results</h2>
                  </div>
                  
                  {leaderboard.slice(0, 3).map((player, index) => (
                    <motion.div 
                      key={player.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`flex items-center p-4 rounded-lg mb-2 ${
                        index === 0 
                          ? 'bg-yellow-100 dark:bg-yellow-900' 
                          : index === 1 
                          ? 'bg-gray-200 dark:bg-gray-600' 
                          : 'bg-yellow-50 dark:bg-yellow-950'
                      } ${
                        player.id === socket.id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${
                        index === 0 
                          ? 'bg-yellow-500 text-white' 
                          : index === 1 
                          ? 'bg-gray-400 text-white' 
                          : 'bg-yellow-700 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-grow font-medium dark:text-white">
                        {player.username} {player.id === socket.id && '(You)'}
                      </div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {player.score}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Player's own result if not in top 3 */}
                  {!leaderboard.slice(0, 3).some(p => p.id === socket.id) && 
                    leaderboard.find(p => p.id === socket.id) && (
                    <div className="mt-4 p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <p className="text-center text-gray-700 dark:text-gray-300 mb-2">Your Position</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                          {leaderboard.findIndex(p => p.id === socket.id) + 1}
                        </div>
                        <div className="flex-grow font-medium dark:text-white">
                          {leaderboard.find(p => p.id === socket.id).username} (You)
                        </div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {leaderboard.find(p => p.id === socket.id).score}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-medium flex items-center justify-center"
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