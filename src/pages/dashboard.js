import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { fetchUserResults, fetchQuizzes, joinQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay, FaHistory, FaTrophy, FaSearch, FaChartBar,
  FaStar, FaMedal, FaCrown, FaGraduationCap, FaShieldAlt,
  FaEye, FaClock, FaExclamationCircle, FaArrowRight, FaPlus,
  FaGamepad, FaThumbsUp, FaRegHeart, FaFire, FaBolt, FaTimes,
  FaUsers, FaFlame, FaHome
} from 'react-icons/fa';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userResults, setUserResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joiningQuiz, setJoiningQuiz] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!user && !authLoading) {
        router.push('/');
        return;
      }
  
      if (user) {
        try {
          // First try with user.id
          let resultsData = [];
          try {
            resultsData = await fetchUserResults(user.id);
          } catch (error) {
            console.warn("Couldn't fetch results by ID, trying by username");
            // Fallback to username if ID doesn't work
            resultsData = await fetchUserResults(user.name || user.email);
          }
          
          const quizzesData = await fetchQuizzes();
          
          setUserResults(resultsData || []);
          setQuizzes(quizzesData || []);
          setFilteredQuizzes(quizzesData || []);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          toast.error('Failed to load your quiz history', {
            icon: '🔥',
            style: { borderRadius: '10px', background: '#2A0E3D', color: '#FF9C27' }
          });
        } finally {
          setLoading(false);
        }
      }
    }
  
    loadData();
  }, [user, authLoading, router]);
  
  // Stats calculation with achievements logic
  const stats = useMemo(() => {
    if (!userResults || userResults.length === 0) {
      return {
        totalQuizzes: 0,
        highScores: 0,
        uniqueQuizzes: 0,
        averageScore: 0
      };
    }
  
    // Get unique quiz IDs
    const uniqueQuizIds = [...new Set(userResults.map(r => r.quizId))];
    
    // Calculate high scores (80%+ of max)
    const highScores = userResults.filter(r => 
      (r.score / (r.maxScore || 1000)) >= 0.8
    ).length;
    
    // Calculate average score percentage
    const averageScore = userResults.length > 0 
      ? userResults.reduce((sum, r) => sum + (r.score / (r.maxScore || 1000)), 0) / userResults.length * 100
      : 0;
    
    return {
      totalQuizzes: userResults.length,
      highScores,
      uniqueQuizzes: uniqueQuizIds.length,
      averageScore: Math.round(averageScore)
    };
  }, [userResults]);

  useEffect(() => {
    if (quizzes.length > 0 && searchTerm) {
      const filtered = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [searchTerm, quizzes]);

  const handleJoinQuiz = async (code = joinCode) => {
    try {
      if (!code || code.trim() === '') {
        toast.error('Please enter a valid quiz code', {
          icon: '🔥',
          style: { borderRadius: '10px', background: '#2A0E3D', color: '#FF9C27' }
        });
        return;
      }

      setJoiningQuiz(true);

      const quiz = await joinQuiz(code);

      if (quiz && quiz.id) {
        router.push(`/play/${quiz.id}`);
      } else {
        toast.error('Failed to get quiz details', {
          icon: '👁️',
          style: { borderRadius: '10px', background: '#2A0E3D', color: '#FF9C27' }
        });
      }
    } catch (error) {
      toast.error('Failed to join quiz. Please check the code and try again.', {
        icon: '🔥',
        style: { borderRadius: '10px', background: '#2A0E3D', color: '#FF9C27' }
      });
    } finally {
      setJoiningQuiz(false);
    }
  };

  const calculateAchievements = () => {
    const achievements = [
      {
        id: 'first-quiz',
        title: 'Ignition',
        description: 'Completed your first quiz',
        icon: <FaFire className="h-5 w-5" />,
        unlocked: userResults.length > 0,
        color: 'from-yellow-500 to-red-600'
      },
      {
        id: 'explorer',
        title: 'Flame Seeker',
        description: 'Completed 5 different quizzes',
        icon: <FaFlame className="h-5 w-5" />,
        unlocked: new Set(userResults.map(r => r.quizId)).size >= 5,
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'perfect',
        title: 'Inferno Master',
        description: 'Got a perfect score in any quiz',
        icon: <FaBolt className="h-5 w-5" />,
        unlocked: userResults.some(r => (r.score / r.maxScore) === 1),
        color: 'from-purple-500 to-red-600'
      },
      {
        id: 'master',
        title: 'Blaze Lord',
        description: 'Completed 10+ quizzes',
        icon: <FaMedal className="h-5 w-5" />,
        unlocked: userResults.length >= 10,
        color: 'from-red-600 to-yellow-500'
      },
      {
        id: 'scholar',
        title: 'Eye of Wisdom',
        description: 'Average score above 80%',
        icon: <FaEye className="h-5 w-5" />,
        unlocked: userResults.length > 0 &&
          (userResults.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / userResults.length) >= 0.8,
        color: 'from-cyan-400 to-purple-700'
      },
      {
        id: 'veteran',
        title: 'Fire Eternal',
        description: 'Completed 20+ quizzes',
        icon: <FaCrown className="h-5 w-5" />,
        unlocked: userResults.length >= 20,
        color: 'from-yellow-400 to-orange-600'
      }
    ];

    return achievements;
  };

  if (loading || authLoading) {
    return (
      <div className="pt-28 flex justify-center items-center h-60 bg-gradient-to-b from-[#1A0029] to-[#2A0E3D]">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#FF9C27] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-[#E83C4B] animate-spin animate-delay-150"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-t-4 border-b-4 border-[#B436D3] animate-spin animate-delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  const achievements = calculateAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  const renderQuizDetails = (quiz) => {
    if (!selectedQuiz) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute top-0 left-0 right-0 bottom-0 z-10 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(42,14,61,0.95) 0%, rgba(71,11,35,0.95) 100%)',
          boxShadow: '0 0 20px rgba(180, 54, 211, 0.4), 0 0 40px rgba(232, 60, 75, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 156, 39, 0.3)'
        }}
      >
        <div className="flex justify-between items-start p-6 border-b border-[#FF9C27]/20">
          <h3 className="text-xl font-bold text-[#FF9C27]">{selectedQuiz.title}</h3>
          <button
            onClick={() => setSelectedQuiz(null)}
            className="p-2 rounded-full hover:bg-[#B436D3]/20 text-[#FF9C27] transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[#FF9C27]/20 text-[#FF9C27] text-sm font-medium">{selectedQuiz.subject}</span>
            <span className="px-3 py-1 rounded-full bg-[#B436D3]/20 text-[#B436D3] text-sm font-medium">
              {selectedQuiz.questionCount} questions
            </span>
          </div>
          
          <p className="text-[#E1E1E6]">Challenge yourself with this fiery quiz on {selectedQuiz.subject}!</p>
          
          <div className="rounded-lg p-4 flex items-center justify-between" 
            style={{background: 'linear-gradient(90deg, rgba(180,54,211,0.2) 0%, rgba(232,60,75,0.2) 100%)'}}>
            <div className="font-mono font-bold text-2xl text-[#23CCEF] flex items-center">
              <FaFire className="mr-2 text-[#FF9C27]" /> 
              {selectedQuiz.code}
            </div>
            <button
              onClick={() => handleJoinQuiz(selectedQuiz.code)}
              className="px-5 py-2 rounded-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95"
              style={{background: 'linear-gradient(90deg, #FF9C27 0%, #E83C4B 100%)'}}
              disabled={joiningQuiz}
            >
              {joiningQuiz ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </div>
              ) : (
                <>
                  <FaPlay className="mr-2 inline" />
                  Play Now
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0029] to-[#2A0E3D] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 border-l-4 border-[#FF9C27] pl-4"
        >
          <h1 className="text-3xl font-bold text-[#FF9C27]">Greetings, {user?.name || 'Fire Keeper'}</h1>
          <p className="text-[#E1E1E6]">Your quest for knowledge continues, let the flames guide you!</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl mb-8 overflow-hidden"
          style={{
            boxShadow: '0 0 20px rgba(232, 60, 75, 0.3), 0 0 40px rgba(255, 156, 39, 0.2)',
            background: 'linear-gradient(135deg, rgba(42,14,61,0.8) 0%, rgba(71,11,35,0.8) 100%)',
            border: '1px solid rgba(255, 156, 39, 0.3)'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 flex items-center text-[#FF9C27]">
                <FaFire className="mr-2 text-[#E83C4B]" />
                Burn at the Core - Join a Quiz
              </h2>
              <p className="text-[#E1E1E6] mb-4">
                Enter the 6-digit flame code to join a blazing quiz challenge
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Enter quiz code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    className="w-full bg-[#1A0029] border-2 border-[#B436D3] text-[#E1E1E6] text-center text-xl tracking-widest font-medium py-3 px-4 rounded-xl focus:ring-2 focus:ring-[#FF9C27] focus:border-[#FF9C27]"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFire className="h-5 w-5 text-[#E83C4B]" />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinQuiz()}
                  disabled={joiningQuiz || !joinCode || joinCode.length < 6}
                  className="px-5 py-3 rounded-xl font-bold text-white transition-colors"
                  style={{
                    background: joiningQuiz || !joinCode || joinCode.length < 6 
                      ? 'linear-gradient(90deg, #666 0%, #444 100%)' 
                      : 'linear-gradient(90deg, #FF9C27 0%, #E83C4B 100%)'
                  }}
                >
                  {joiningQuiz ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Igniting...
                    </div>
                  ) : (
                    <>
                      <FaPlay className="mr-2 inline" />
                      Ignite Challenge
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B436D3] to-[#E83C4B] opacity-20 animate-pulse"></div>
              <div className="relative h-full flex flex-col items-center justify-center p-6">
                {/* Animated eye background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full radial-pulse opacity-20"></div>
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-5xl font-bold text-center mb-3 text-[#FF9C27]"
                  style={{ textShadow: '0 0 10px rgba(255, 156, 39, 0.7)' }}
                >
                  {userResults.length}
                </motion.div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-xl text-[#E1E1E6] mb-2">Trials Completed</p>
                  
                  <div className="w-12 h-1 bg-[#E83C4B] rounded mb-4"></div>

                  {userResults.length > 0 && (
                    <div className="mt-2 px-4 py-2 rounded-lg bg-[#B436D3]/20 text-[#E1E1E6]">
                      <p className="text-sm">
                        Last Trial: {new Date(userResults[0]?.completedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="rounded-xl overflow-hidden" 
              style={{
                background: 'linear-gradient(135deg, rgba(42,14,61,0.8) 0%, rgba(71,11,35,0.8) 100%)',
                boxShadow: '0 0 15px rgba(180, 54, 211, 0.3)',
                border: '1px solid rgba(255, 156, 39, 0.3)'
              }}>
              <div className="flex border-b border-[#FF9C27]/20">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'available'
                    ? 'border-[#FF9C27] text-[#FF9C27]'
                    : 'border-transparent text-[#E1E1E6] hover:text-[#FF9C27] hover:border-[#FF9C27]/50'
                    }`}
                >
                  Burning Challenges
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'history'
                    ? 'border-[#FF9C27] text-[#FF9C27]'
                    : 'border-transparent text-[#E1E1E6] hover:text-[#FF9C27] hover:border-[#FF9C27]/50'
                    }`}
                >
                  Trial Records
                </button>
              </div>

              <div className="p-6">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-[#B436D3]" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'available' ? 'challenges' : 'history'}...`}
                    className="bg-[#1A0029] border-2 border-[#B436D3] text-[#E1E1E6] pl-10 pr-4 py-2 w-full rounded-xl focus:ring-2 focus:ring-[#FF9C27] focus:border-[#FF9C27]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'available' && (
                    <motion.div
                      key="available"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {filteredQuizzes.length === 0 ? (
                        <div className="text-center py-10 bg-[#1A0029]/50 rounded-xl border border-[#FF9C27]/20">
                          <FaExclamationCircle className="text-[#E83C4B] text-4xl mx-auto mb-3" />
                          <p className="text-[#E1E1E6] mb-1">No burning challenges found</p>
                          <p className="text-sm text-[#B436D3]">
                            {searchTerm ? "Try a different search term" : "The flames are quiet for now..."}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                          {filteredQuizzes.map((quiz, index) => (
                            <motion.div
                              key={quiz.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="rounded-xl p-4 relative overflow-hidden"
                              style={{
                                background: 'linear-gradient(135deg, rgba(26,0,41,0.6) 0%, rgba(71,11,35,0.6) 100%)',
                                border: '1px solid rgba(180, 54, 211, 0.3)',
                                boxShadow: '0 4px 15px rgba(232, 60, 75, 0.2)'
                              }}
                            >
                              {/* Animated background */}
                              <div className="absolute inset-0 overflow-hidden opacity-10">
                                <div className="absolute w-full h-20 bg-gradient-to-r from-[#E83C4B] to-[#FF9C27] blur-xl transform -rotate-12 -translate-y-10"></div>
                                <div className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-r from-[#23CCEF] to-[#B436D3] blur-xl transform rotate-12 translate-y-10"></div>
                              </div>
                              
                              <div className="relative">
                                <div className="mb-3">
                                  <h3 className="font-bold text-lg mb-1 text-[#FF9C27]">{quiz.title}</h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full bg-[#E83C4B]/20 text-[#E83C4B] text-xs">{quiz.subject}</span>
                                    <span className="px-3 py-1 rounded-full bg-[#B436D3]/20 text-[#B436D3] text-xs">
                                      {quiz.questionCount} questions
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="px-3 py-1 rounded-full bg-[#23CCEF]/20 text-[#23CCEF] font-mono">
                                    {quiz.code}
                                  </div>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setSelectedQuiz(quiz)}
                                      className="p-2 rounded-full bg-[#B436D3]/20 text-[#B436D3] hover:bg-[#B436D3]/40"
                                    >
                                      <FaEye className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleJoinQuiz(quiz.code)}
                                      className="px-4 py-1 rounded-full text-white text-sm font-medium"
                                      style={{background: 'linear-gradient(90deg, #FF9C27 0%, #E83C4B 100%)'}}
                                    >
                                      <FaPlay className="inline mr-1" /> Play
                                    </motion.button>
                                  </div>
                                </div>
                              </div>

                              <AnimatePresence>
                                {selectedQuiz && selectedQuiz.id === quiz.id && renderQuizDetails(quiz)}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {userResults.length === 0 ? (
                        <div className="text-center py-10 bg-[#1A0029]/50 rounded-xl border border-[#FF9C27]/20">
                          <FaHistory className="text-[#E83C4B] text-4xl mx-auto mb-3" />
                          <p className="text-[#E1E1E6] mb-1">No trial records found</p>
                          <p className="text-sm text-[#B436D3]">
                            Begin your journey by joining a quiz!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                          {userResults
                            .filter(result =>
                              !searchTerm ||
                              result.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              result.quizSubject?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((result, index) => (
                              <motion.div
                                key={result.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="rounded-xl p-4 relative overflow-hidden"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(26,0,41,0.6) 0%, rgba(71,11,35,0.6) 100%)',
                                  border: '1px solid rgba(180, 54, 211, 0.3)',
                                  boxShadow: '0 4px 15px rgba(232, 60, 75, 0.2)'
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-lg mb-1 text-[#FF9C27]">{result.quizTitle}</h3>
                                    <div className="flex items-center text-sm text-[#E1E1E6] gap-2">
                                      {result.quizSubject && (
                                        <span className="px-3 py-1 rounded-full bg-[#E83C4B]/20 text-[#E83C4B] text-xs">{result.quizSubject}</span>
                                      )}
                                      <div className="flex items-center">
                                        <FaClock className="mr-1 text-xs text-[#B436D3]" />
                                        {new Date(result.completedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${(result.score / result.maxScore) >= 0.8 ? 'text-[#23CCEF]' :
                                      (result.score / result.maxScore) >= 0.6 ? 'text-[#FF9C27]' :
                                        'text-[#E1E1E6]'
                                      }`}>
                                      {result.score} <span className="text-sm text-[#B436D3]/80">/ {result.maxScore}</span>
                                    </div>
                                    <div className={`text-sm font-medium ${(result.score / result.maxScore) >= 0.8 ? 'text-[#23CCEF]' :
                                      (result.score / result.maxScore) >= 0.6 ? 'text-[#FF9C27]' :
                                        'text-[#E1E1E6]'
                                      }`}>
                                      {Math.round((result.score / result.maxScore) * 100)}%
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="rounded-xl overflow-hidden p-6" 
              style={{
                background: 'linear-gradient(135deg, rgba(42,14,61,0.8) 0%, rgba(71,11,35,0.8) 100%)',
                boxShadow: '0 0 15px rgba(180, 54, 211, 0.3)',
                border: '1px solid rgba(255, 156, 39, 0.3)'
              }}>
              <h2 className="text-xl font-bold mb-6 flex items-center text-[#FF9C27]">
                <FaChartBar className="mr-2 text-[#23CCEF]" />
                Flame Statistics
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="rounded-xl p-4 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,60,75,0.2) 0%, rgba(255,156,39,0.2) 100%)',
                    border: '1px solid rgba(255,156,39,0.3)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-2xl font-bold text-[#FF9C27]">
                      {stats.totalQuizzes}
                    </div>
                    <div className="text-sm text-[#E1E1E6]">
                      Trials Faced
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 text-[#FF9C27]/10">
                    <FaFire className="w-full h-full" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="rounded-xl p-4 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(35,204,239,0.2) 0%, rgba(180,54,211,0.2) 100%)',
                    border: '1px solid rgba(35,204,239,0.3)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-2xl font-bold text-[#23CCEF]">
                      {stats.highScores}
                    </div>
                    <div className="text-sm text-[#E1E1E6]">
                      Perfect Flames
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 text-[#23CCEF]/10">
                    <FaCrown className="w-full h-full" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="rounded-xl p-4 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(180,54,211,0.2) 0%, rgba(232,60,75,0.2) 100%)',
                    border: '1px solid rgba(180,54,211,0.3)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-2xl font-bold text-[#B436D3]">
                      {stats.uniqueQuizzes}
                    </div>
                    <div className="text-sm text-[#E1E1E6]">
                      Unique Trials
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 text-[#B436D3]/10">
                    <FaFlame className="w-full h-full" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="rounded-xl p-4 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,156,39,0.2) 0%, rgba(232,60,75,0.2) 100%)',
                    border: '1px solid rgba(255,156,39,0.3)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-2xl font-bold text-[#FF9C27]">
                      {unlockedAchievements}
                    </div>
                    <div className="text-sm text-[#E1E1E6]">
                      Achievements
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 text-[#FF9C27]/10">
                    <FaTrophy className="w-full h-full" />
                  </div>
                </motion.div>
              </div>

              {userResults.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-[#E1E1E6]">Average Flame Intensity</div>
                    <div className="text-sm font-medium text-[#FF9C27]">
                      {stats.averageScore}%
                    </div>
                  </div>
                  <div className="h-2 bg-[#1A0029] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.averageScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #E83C4B 0%, #FF9C27 50%, #23CCEF 100%)' }}
                    ></motion.div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden p-6" 
              style={{
                background: 'linear-gradient(135deg, rgba(42,14,61,0.8) 0%, rgba(71,11,35,0.8) 100%)',
                boxShadow: '0 0 15px rgba(180, 54, 211, 0.3)',
                border: '1px solid rgba(255, 156, 39, 0.3)'
              }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center text-[#FF9C27]">
                  <FaTrophy className="mr-2 text-[#B436D3]" />
                  Fiery Achievements
                </h2>
                <span className="text-sm px-3 py-1 rounded-full bg-[#B436D3]/20 text-[#B436D3]">
                  {unlockedAchievements}/{achievements.length}
                </span>
              </div>

              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl p-4 relative overflow-hidden"
                    style={{
                      background: achievement.unlocked 
                        ? `linear-gradient(90deg, ${achievement.color.replace('from-', '').replace('to-', '')})` 
                        : 'linear-gradient(90deg, rgba(26,0,41,0.4) 0%, rgba(71,11,35,0.4) 100%)',
                      border: achievement.unlocked 
                        ? '1px solid rgba(255,156,39,0.3)' 
                        : '1px solid rgba(180,54,211,0.2)',
                      opacity: achievement.unlocked ? 1 : 0.6
                    }}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 h-10 w-10 rounded-full flex items-center justify-center"
                        style={{
                          background: achievement.unlocked 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(180, 54, 211, 0.2)'
                        }}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="font-medium text-[#FF9C27]">
                          {achievement.title}
                        </div>
                        <div className="text-sm text-[#E1E1E6]/80">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-xl overflow-hidden p-6 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(180,54,211,0.8) 0%, rgba(232,60,75,0.8) 100%)',
                boxShadow: '0 0 20px rgba(180, 54, 211, 0.4), 0 0 40px rgba(232, 60, 75, 0.2)',
                border: '1px solid rgba(35, 204, 239, 0.3)'
              }}
            >
              {/* Animated Eye Background */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#FF9C27] filter blur-3xl animate-pulse"></div>
                </div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4 text-white">Burning Actions</h2>

                <div className="space-y-3">
                  {user && user.isAdmin && (
                    <motion.a
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      href="/admin/create"
                      className="flex items-center justify-center py-3 px-4 rounded-xl text-white group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <FaPlus className="mr-2" />
                      Forge New Challenge
                      <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </motion.a>
                  )}

                  <motion.a
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    href="#"
                    className="flex items-center justify-center py-3 px-4 rounded-xl text-white group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <FaHistory className="mr-2" />
                    View Your Embers
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </motion.a>

                  <motion.a
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    href="#"
                    className="flex items-center justify-center py-3 px-4 rounded-xl text-white group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <FaGamepad className="mr-2" />
                    Explore All Trials
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="relative bg-gradient-to-r from-[#1A0029] to-[#2A0E3D] shadow-lg border-t border-[#FF9C27]/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E83C4B] via-[#FF9C27] to-[#B436D3] opacity-80"></div>
          <div className="grid grid-cols-5 h-16">
            <motion.a 
              href="/"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className="p-1.5 rounded-full text-[#E1E1E6]">
                <FaHome className="h-5 w-5" />
              </div>
              <span className="mt-1 font-medium text-[#E1E1E6]">Home</span>
            </motion.a>
            
            <motion.a 
              href="/dashboard"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className="p-1.5 rounded-full bg-[#FF9C27]/20 text-[#FF9C27]">
                <FaGamepad className="h-5 w-5" />
              </div>
              <span className="mt-1 font-medium text-[#FF9C27]">Play</span>
            </motion.a>
            
            <motion.a 
              href="/join"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative -top-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E83C4B] to-[#FF9C27] rounded-full opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-[#E83C4B] to-[#FF9C27] w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#E83C4B]/20">
                  <FaPlay className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xs font-medium text-[#E1E1E6] -mt-3">Join</span>
            </motion.a>
            
            <motion.a 
              href="/leaderboard"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className="p-1.5 rounded-full text-[#E1E1E6]">
                <FaTrophy className="h-5 w-5" />
              </div>
              <span className="mt-1 font-medium text-[#E1E1E6]">Ranks</span>
            </motion.a>
            
            <motion.a 
              href="/profile"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className="p-1.5 rounded-full text-[#E1E1E6]">
                <FaUsers className="h-5 w-5" />
              </div>
              <span className="mt-1 font-medium text-[#E1E1E6]">Profile</span>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}