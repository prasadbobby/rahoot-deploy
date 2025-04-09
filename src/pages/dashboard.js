import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { fetchUserResults, fetchQuizzes, joinQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FaPlay, FaHistory, FaTrophy, FaSearch, FaChartBar,
  FaStar, FaMedal, FaCrown, FaGraduationCap, FaShieldAlt,
  FaEye, FaClock, FaExclamationCircle, FaArrowRight, FaPlus,
  FaGamepad, FaThumbsUp, FaRegHeart, FaFire, FaBolt
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
          
          console.log("Loaded user results:", resultsData);
          setUserResults(resultsData || []);
          setQuizzes(quizzesData || []);
          setFilteredQuizzes(quizzesData || []);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          toast.error('Failed to load your quiz history');
        } finally {
          setLoading(false);
        }
      }
    }
  
    loadData();
  }, [user, authLoading, router]);
  
  // Ensure the stats calculation is more robust
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
          icon: '🔢',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        return;
      }

      setJoiningQuiz(true);

      const quiz = await joinQuiz(code);

      if (quiz && quiz.id) {
        router.push(`/play/${quiz.id}`);
      } else {
        toast.error('Failed to get quiz details', {
          icon: '❌',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
      }
    } catch (error) {
      toast.error('Failed to join quiz. Please check the code and try again.', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } finally {
      setJoiningQuiz(false);
    }
  };

  const calculateAchievements = () => {
    const achievements = [
      {
        id: 'first-quiz',
        title: 'First Quiz',
        description: 'Completed your first quiz',
        icon: <FaStar className="h-5 w-5" />,
        unlocked: userResults.length > 0,
        color: 'from-green-400 to-brand-green'
      },
      {
        id: 'explorer',
        title: 'Quiz Explorer',
        description: 'Completed 5 different quizzes',
        icon: <FaPlay className="h-5 w-5" />,
        unlocked: new Set(userResults.map(r => r.quizId)).size >= 5,
        color: 'from-brand-blue to-blue-600'
      },
      {
        id: 'perfect',
        title: 'Perfect Score',
        description: 'Got a perfect score in any quiz',
        icon: <FaCrown className="h-5 w-5" />,
        unlocked: userResults.some(r => (r.score / r.maxScore) === 1),
        color: 'from-brand-yellow to-amber-500'
      },
      {
        id: 'master',
        title: 'Quiz Master',
        description: 'Completed 10+ quizzes',
        icon: <FaMedal className="h-5 w-5" />,
        unlocked: userResults.length >= 10,
        color: 'from-brand-red to-rose-600'
      },
      {
        id: 'scholar',
        title: 'Quiz Scholar',
        description: 'Average score above 80%',
        icon: <FaGraduationCap className="h-5 w-5" />,
        unlocked: userResults.length > 0 &&
          (userResults.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / userResults.length) >= 0.8,
        color: 'from-purple-500 to-purple-700'
      },
      {
        id: 'veteran',
        title: 'Quiz Veteran',
        description: 'Completed 20+ quizzes',
        icon: <FaShieldAlt className="h-5 w-5" />,
        unlocked: userResults.length >= 20,
        color: 'from-teal-500 to-teal-700'
      }
    ];

    return achievements;
  };

  if (loading || authLoading) {
    return (
      <div className="pt-28 flex justify-center items-center h-60">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-brand-blue animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-brand-red animate-spin animate-delay-150"></div>
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
        className="card absolute top-0 left-0 right-0 bottom-0 z-10"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{selectedQuiz.title}</h3>
          <button
            onClick={() => setSelectedQuiz(null)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="badge badge-primary">{selectedQuiz.subject}</span>
            <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {selectedQuiz.questionCount} questions
            </span>
          </div>
          
          <p>Join this quiz to test your knowledge of {selectedQuiz.subject}!</p>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="font-mono font-bold text-xl text-brand-blue">{selectedQuiz.code}</div>
            <button
              onClick={() => handleJoinQuiz(selectedQuiz.code)}
              className="btn-primary"
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
                  <FaPlay className="mr-2" />
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
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
          <p className="text-gray-600 dark:text-gray-400">Let's continue learning and having fun!</p>
        </div>

        <div className="bg-gradient-to-r from-brand-red to-brand-blue p-0.5 rounded-2xl mb-8">
          <div className="card rounded-2xl bg-white dark:bg-brand-dark-card">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <FaPlay className="mr-2 text-brand-red" />
                  Join a Quiz
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enter a 6-digit code to join a quiz game instantly
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Enter quiz code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    className="input text-center text-xl tracking-widest font-medium flex-grow"
                  />
                  <button
                    onClick={() => handleJoinQuiz()}
                    disabled={joiningQuiz || !joinCode || joinCode.length < 6}
                    className="btn-primary whitespace-nowrap min-w-[120px]"
                  >
                    {joiningQuiz ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </div>
                    ) : (
                      <>
                        <FaPlay className="mr-2" />
                        Join Quiz
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-dark to-gray-900 p-6 rounded-2xl lg:rounded-l-none lg:rounded-r-xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  <div className="absolute top-0 left-0 w-full animate-slide">
                    <div className="flex">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-none w-12 h-12 mx-1 rounded-full bg-white"></div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-20 left-0 w-full animate-slide" style={{ animationDelay: '0.5s', animationDuration: '20s' }}>
                    <div className="flex">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-none w-8 h-8 mx-1 rounded-full bg-brand-yellow"></div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-40 left-0 w-full animate-slide" style={{ animationDelay: '1s', animationDuration: '25s' }}>
                    <div className="flex">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-none w-10 h-10 mx-1 rounded-full bg-brand-blue"></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-white text-center">
                  <div className="text-5xl font-bold text-center mb-3">
                    {userResults.length}
                  </div>
                  <p className="text-xl opacity-90">Quizzes Completed</p>

                  {userResults.length > 0 && (
                    <div className="mt-4 bg-white/10 p-2 rounded-lg">
                      <p className="text-sm">
                        Last Quiz: {new Date(userResults[0]?.completedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card">
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'available'
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  Available Quizzes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === 'history'
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  Quiz History
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'available' ? 'quizzes' : 'history'}...`}
                  className="input pl-10 pr-4 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'available' && (
                <>
                  {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <FaExclamationCircle className="text-gray-400 text-4xl mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-1">No quizzes found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {searchTerm ? "Try a different search term" : "Check back later for new quizzes"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                      {filteredQuizzes.map((quiz) => (
                        <motion.div
                          key={quiz.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="card card-hover p-4 border border-gray-100 dark:border-gray-700"
                        >
                          <div className="mb-3">
                            <h3 className="font-bold text-lg mb-1 line-clamp-1">{quiz.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="badge badge-primary">{quiz.subject}</span>
                              <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {quiz.questionCount} questions
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-mono">
                              {quiz.code}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedQuiz(quiz)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleJoinQuiz(quiz.code)}
                                className="btn-primary py-1 px-3 text-sm"
                              >
                                Play
                              </button>
                            </div>
                          </div>

                          {selectedQuiz && selectedQuiz.id === quiz.id && renderQuizDetails(quiz)}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <>
                  {userResults.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <FaHistory className="text-gray-400 text-4xl mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-1">No quiz history yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Join a quiz to start building your history!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {userResults
                        .filter(result =>
                          !searchTerm ||
                          result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.quizSubject?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((result) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="card p-4 border border-gray-100 dark:border-gray-700"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg mb-1">{result.quizTitle}</h3>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                                  {result.quizSubject && (
                                    <span className="badge badge-primary">{result.quizSubject}</span>
                                  )}
                                  <div className="flex items-center">
                                    <FaClock className="mr-1 text-xs" />
                                    {new Date(result.completedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${(result.score / result.maxScore) >= 0.8 ? 'text-brand-green' :
                                  (result.score / result.maxScore) >= 0.6 ? 'text-brand-yellow' :
                                    'text-gray-700 dark:text-gray-300'
                                  }`}>
                                  {result.score} <span className="text-sm text-gray-500 dark:text-gray-400">/ {result.maxScore}</span>
                                </div>
                                <div className={`text-sm font-medium ${(result.score / result.maxScore) >= 0.8 ? 'text-brand-green' :
                                  (result.score / result.maxScore) >= 0.6 ? 'text-brand-yellow' :
                                    'text-gray-600 dark:text-gray-400'
                                  }`}>
                                  {Math.round((result.score / result.maxScore) * 100)}%
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaChartBar className="mr-2 text-brand-blue" />
                Your Stats
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
  <div className="bg-gradient-to-br from-brand-red/10 to-rose-500/10 rounded-xl p-4 text-center">
    <div className="text-2xl font-bold text-brand-red">
      {stats.totalQuizzes}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Quizzes Taken
    </div>
  </div>

  <div className="bg-gradient-to-br from-brand-green/10 to-emerald-500/10 rounded-xl p-4 text-center">
    <div className="text-2xl font-bold text-brand-green">
      {stats.highScores}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">
      High Scores
    </div>
  </div>

  <div className="bg-gradient-to-br from-brand-blue/10 to-cyan-500/10 rounded-xl p-4 text-center">
    <div className="text-2xl font-bold text-brand-blue">
      {stats.uniqueQuizzes}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Unique Quizzes
    </div>
  </div>

  <div className="bg-gradient-to-br from-brand-yellow/10 to-amber-500/10 rounded-xl p-4 text-center">
    <div className="text-2xl font-bold text-brand-yellow">
      {unlockedAchievements}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Achievements
    </div>
  </div>
</div>

{userResults.length > 0 && (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-1">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {stats.averageScore}%
      </div>
    </div>
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-brand-red via-brand-yellow to-brand-green rounded-full"
        style={{ width: `${stats.averageScore}%` }}
      ></div>
    </div>
  </div>
)}

              {userResults.length > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((userResults.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / userResults.length) * 100)}%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-red via-brand-yellow to-brand-green rounded-full"
                      style={{ width: `${Math.round((userResults.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / userResults.length) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <FaTrophy className="mr-2 text-brand-yellow" />
                  Achievements
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {unlockedAchievements}/{achievements.length} unlocked
                </span>
              </div>

              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl flex items-start ${achievement.unlocked
                      ? 'bg-gradient-to-r ' + achievement.color + ' text-white'
                      : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                      }`}
                  >
                    <div className={`mr-3 h-10 w-10 rounded-full flex items-center justify-center ${achievement.unlocked
                      ? 'bg-white/20'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="font-medium">
                        {achievement.title}
                      </div>
                      <div className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-brand-blue to-indigo-600 text-white">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

              <div className="space-y-3">
                {user && user.isAdmin && (
                  <a
                    href="/admin/create"
                    className="btn bg-white/20 hover:bg-white/30 text-white border-white/30 w-full flex items-center justify-center group"
                  >
                    <FaPlus className="mr-2" />
                    Create New Quiz
                  </a>
                )}

                <a
                  href="#"
                  className="btn bg-white/20 hover:bg-white/30 text-white border-white/30 w-full flex items-center justify-center group"
                >
                  <FaHistory className="mr-2" />
                  View All Results
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}