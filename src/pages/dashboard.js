import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchUserResults, fetchQuizzes, joinQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion , AnimatePresence} from 'framer-motion';
import { 
  FaPlay, FaHistory, FaTrophy, FaSearch, FaChartBar, 
  FaMedal, FaCrown, FaEye, FaClock, FaExclamationCircle, 
  FaArrowRight, FaPlus, FaGamepad, FaFire, FaTimes
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

  // Component content will go here
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
          toast.error('Failed to load your quiz history');
        } finally {
          setLoading(false);
        }
      }
    }
  
    loadData();
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (quizzes.length > 0 && searchTerm) {
      const filtered = quizzes.filter(quiz =>
        quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [searchTerm, quizzes]);
  
  const handleJoinQuiz = async (code) => {
    if (!code) {
      toast.error('Please enter a quiz code');
      return;
    }
    
    setJoiningQuiz(true);
    
    try {
      const quiz = await joinQuiz(code);
      
      if (quiz && quiz.id) {
        toast.success('Joining quiz...');
        setTimeout(() => {
          router.push(`/play/${quiz.id}`);
        }, 1000);
      } else {
        toast.error('Invalid quiz code');
      }
    } catch (error) {
      toast.error('Failed to join quiz');
    } finally {
      setJoiningQuiz(false);
    }
  };
  
  const calculateStats = () => {
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
  };
  
  const calculateAchievements = () => {
    const achievements = [
      {
        id: 'first-quiz',
        title: 'Flame Ignited',
        description: 'Completed your first quiz',
        icon: <FaFire className="h-5 w-5" />,
        unlocked: userResults.length > 0,
        color: 'bg-gradient-to-r from-yellow-500 to-red-600'
      },
      {
        id: 'explorer',
        title: 'Knowledge Seeker',
        description: 'Completed 5 different quizzes',
        icon: <FaFire className="h-5 w-5" />,
        unlocked: new Set(userResults.map(r => r.quizId)).size >= 5,
        color: 'bg-gradient-to-r from-orange-500 to-red-500'
      },
      {
        id: 'perfect',
        title: 'Inferno Master',
        description: 'Got a perfect score in any quiz',
        icon: <FaFire className="h-5 w-5" />,
        unlocked: userResults.some(r => (r.score / (r.maxScore || 1)) === 1),
        color: 'bg-gradient-to-r from-purple-500 to-red-600'
      },
      {
        id: 'master',
        title: 'Blaze Lord',
        description: 'Completed 10+ quizzes',
        icon: <FaMedal className="h-5 w-5" />,
        unlocked: userResults.length >= 10,
        color: 'bg-gradient-to-r from-red-600 to-yellow-500'
      },
      {
        id: 'scholar',
        title: 'Eye of Wisdom',
        description: 'Average score above 80%',
        icon: <FaEye className="h-5 w-5" />,
        unlocked: userResults.length > 0 && 
          (userResults.reduce((sum, r) => sum + (r.score / (r.maxScore || 1)), 0) / userResults.length) >= 0.8,
        color: 'bg-gradient-to-r from-blue-400 to-purple-600'
      },
      {
        id: 'veteran',
        title: 'Eternal Flame',
        description: 'Completed 20+ quizzes',
        icon: <FaCrown className="h-5 w-5" />,
        unlocked: userResults.length >= 20,
        color: 'bg-gradient-to-r from-yellow-400 to-orange-600'
      }
    ];
  
    return achievements;
  };
  // Compute stats and achievements
const stats = calculateStats();
const achievements = calculateAchievements();
const unlockedAchievements = achievements.filter(a => a.unlocked).length;

if (loading || authLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0029] to-[#2A0E3D] pt-28 flex justify-center items-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-t-brand-red border-r-brand-blue border-b-brand-green border-l-brand-yellow animate-spin"></div>
      </div>
    </div>
  );
}
return (
  <div className="min-h-screen bg-gradient-to-b from-[#1A0029] to-[#2A0E3D] pt-24 pb-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 border-l-4 border-brand-red pl-4"
      >
        <h1 className="text-4xl font-bold text-brand-red">
          Welcome, {user ? user.name : 'Seeker'}
        </h1>
        <p className="text-gray-300 mt-2">
          Ready to test your knowledge? Join a quiz or view your history.
        </p>
      </motion.div>

      {/* Quiz Joining Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 rounded-xl mb-8 overflow-hidden shadow-lg border border-brand-purple/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-brand-red to-brand-orange mr-4">
                <FaFire className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-yellow">
                  Join a Quiz
                </h2>
                <p className="text-gray-300">Enter a code to join an existing quiz</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.slice(0, 6))}
                  maxLength={6}
                  className="w-full bg-gray-800 border-2 border-brand-purple text-white text-center text-xl tracking-widest font-medium py-3 px-4 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleJoinQuiz(joinCode)}
                disabled={joiningQuiz || !joinCode || joinCode.length < 6}
                className={`px-6 py-3 rounded-xl font-bold text-white ${
                  joiningQuiz || !joinCode || joinCode.length < 6 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-red to-brand-orange'
                }`}
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
                    <FaPlay className="inline mr-2" />
                    Join Quiz
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-yellow flex items-center">
                <FaTrophy className="mr-2 text-brand-red" />
                Your Stats
              </h3>
              
              <div className="text-3xl font-bold text-brand-red">
                {stats.totalQuizzes}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quizzes Completed</span>
                <span className="font-bold text-white">{stats.totalQuizzes}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg. Score</span>
                <span className="font-bold text-brand-cyan">{stats.averageScore}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Achievements</span>
                <span className="font-bold text-brand-yellow">{unlockedAchievements}/{achievements.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);
{/* Main Content */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Available Quests / History Tab Section */}
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="lg:col-span-2"
  >
    <div className="bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-brand-purple/30">
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-4 px-6 font-medium border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-400 hover:text-brand-red'
          }`}
        >
          <FaFire className="inline mr-2" />
          Available Quizzes
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-4 px-6 font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-gray-400 hover:text-brand-red'
          }`}
        >
          <FaHistory className="inline mr-2" />
          Your History
        </button>
      </div>

      <div className="p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab === 'available' ? 'quizzes' : 'history'}...`}
            className="bg-gray-800 border border-gray-600 text-white pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  </motion.div>
</div>
{activeTab === 'available' && (
  <div>
    {filteredQuizzes.length === 0 ? (
      <div className="text-center py-10 bg-gray-800/50 rounded-xl">
        <FaExclamationCircle className="text-brand-red text-4xl mx-auto mb-3" />
        <p className="text-white mb-1">No quizzes found</p>
        <p className="text-sm text-gray-400">
          {searchTerm ? "Try a different search term" : "No quizzes are available at the moment"}
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 hover:border-brand-purple transition-all"
          >
            <div className="mb-3">
              <h3 className="font-bold text-lg mb-1 text-brand-yellow">{quiz.title}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs">{quiz.subject}</span>
                <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs">
                  {quiz.questionCount} questions
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="px-3 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan font-mono">
                {quiz.code}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedQuiz(quiz)}
                  className="p-2 rounded-full bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/40"
                >
                  <FaEye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleJoinQuiz(quiz.code)}
                  className="px-4 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r from-brand-red to-brand-orange"
                >
                  <FaPlay className="inline mr-1" /> Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
{activeTab === 'history' && (
  <div>
    {userResults.length === 0 ? (
      <div className="text-center py-10 bg-gray-800/50 rounded-xl">
        <FaHistory className="text-brand-red text-4xl mx-auto mb-3" />
        <p className="text-white mb-1">No history found</p>
        <p className="text-sm text-gray-400">
          Join a quiz to start building your history
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
          .map((result) => (
            <div
              key={result.id}
              className="bg-gray-800/60 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1 text-brand-yellow">{result.quizTitle}</h3>
                  <div className="flex items-center text-sm text-gray-300 gap-2">
                    {result.quizSubject && (
                      <span className="px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs">{result.quizSubject}</span>
                    )}
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-xs text-gray-400" />
                      {new Date(result.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    (result.score / result.maxScore) >= 0.8 ? 'text-brand-cyan' :
                    (result.score / result.maxScore) >= 0.6 ? 'text-brand-yellow' :
                    'text-gray-300'
                  }`}>
                    {result.score} <span className="text-sm text-gray-500">/ {result.maxScore}</span>
                  </div>
                  <div className={`text-sm font-medium ${
                    (result.score / result.maxScore) >= 0.8 ? 'text-brand-cyan' :
                    (result.score / result.maxScore) >= 0.6 ? 'text-brand-yellow' :
                    'text-gray-300'
                  }`}>
                    {Math.round((result.score / result.maxScore) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
)}
{selectedQuiz && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 relative">
      <button
        onClick={() => setSelectedQuiz(null)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <FaTimes className="h-5 w-5" />
      </button>
      
      <h3 className="text-xl font-bold text-brand-yellow mb-2">{selectedQuiz.title}</h3>
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs">{selectedQuiz.subject}</span>
        <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs">
          {selectedQuiz.questionCount} questions
        </span>
      </div>
      
      <p className="text-gray-300 mb-6">Ready to test your knowledge on {selectedQuiz.subject}?</p>
      
      <div className="flex justify-between items-center bg-gray-800 rounded-lg p-4 mb-6">
        <div className="font-mono font-bold text-xl text-brand-cyan">
          {selectedQuiz.code}
        </div>
        <button
          onClick={() => handleJoinQuiz(selectedQuiz.code)}
          className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-brand-red to-brand-orange"
          disabled={joiningQuiz}
        >
          {joiningQuiz ? "Joining..." : "Play Now"}
        </button>
      </div>
    </div>
  </div>
)}
{/* Right Sidebar */}
<motion.div 
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
  className="space-y-6"
>
  {/* Achievements Widget */}
  <div className="bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-brand-purple/30 p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-brand-yellow flex items-center">
        <FaTrophy className="mr-2 text-brand-purple" />
        Achievements
      </h2>
      <span className="text-sm px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple">
        {unlockedAchievements}/{achievements.length}
      </span>
    </div>

    <div className="space-y-3">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`rounded-xl p-4 border ${
            achievement.unlocked 
              ? achievement.color + ' border-yellow-400/30' 
              : 'bg-gray-800/60 border-gray-700'
          } ${achievement.unlocked ? '' : 'opacity-50'}`}
        >
          <div className="flex items-start">
            <div className="mr-3 h-10 w-10 rounded-full bg-black/20 flex items-center justify-center">
              {achievement.icon}
            </div>
            <div>
              <div className="font-medium text-white">
                {achievement.title}
              </div>
              <div className="text-sm text-gray-300">
                {achievement.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</motion.div>

  return (
    <div>Loading...</div>
  );
}