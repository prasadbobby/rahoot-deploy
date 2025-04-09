import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { joinQuiz } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, FaQuestionCircle, FaTrophy, FaPlus, 
  FaMedal, FaUsers, FaChartBar, FaLock, FaArrowRight,
  FaBolt, FaGamepad, FaFireAlt, FaCrown, FaLightbulb,
  FaRocket, FaAward, FaHeadset, FaGem, FaCode,
  FaHome, FaDesktop, FaMobileAlt, FaCheck, FaBrain
} from 'react-icons/fa';

export default function Home() {
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    if (!quizCode) {
      toast.error('Please enter a quiz code', {
        icon: '🔢',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }
    
    if (!user) {
      toast.error('Please log in to join a quiz', {
        icon: '🔒',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const quiz = await joinQuiz(quizCode);
      
      if (quiz && quiz.id) {
        router.push(`/play/${quiz.id}`);
      } else {
        toast.error('Invalid quiz code', {
          icon: '❌',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
      }
    } catch (error) {
      toast.error('Failed to join quiz', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FaRocket className="h-6 w-6" />,
      title: "Instant Quizzes",
      description: "Join quizzes in seconds with just a 6-digit code. No downloads required."
    },
    {
      icon: <FaLightbulb className="h-6 w-6" />,
      title: "Create & Customize",
      description: "Build your own quizzes with custom questions, timers, images, and more."
    },
    {
      icon: <FaChartBar className="h-6 w-6" />,
      title: "Real-time Results",
      description: "See live leaderboards and detailed analytics as participants answer."
    },
    {
      icon: <FaBrain className="h-6 w-6" />,
      title: "Knowledge Challenges",
      description: "Compete with friends, classmates or colleagues for the top spot."
    }
  ];

  return (
    <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section with Geometric Design */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Abstract shape background */}
          <div className="absolute w-full h-full">
            {/* Animated gradient shapes */}
            <div className="absolute top-0 right-0 w-2/3 h-2/3 rounded-full bg-gradient-to-br from-brand-red to-brand-orange opacity-10 blur-3xl transform -translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-brand-blue to-brand-cyan opacity-10 blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
            
            {/* Floating geometric elements */}
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 6,
                ease: "easeInOut" 
              }}
              className="absolute top-[20%] left-[15%] w-24 h-24 rounded-lg bg-gradient-to-r from-brand-red to-brand-orange opacity-20 blur-sm"
            ></motion.div>
            
            <motion.div 
              animate={{ 
                y: [0, 20, 0],
                rotate: [0, -8, 0]
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 8,
                ease: "easeInOut",
                delay: 1 
              }}
              className="absolute top-[30%] right-[20%] w-32 h-32 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan opacity-20 blur-sm"
            ></motion.div>
            
            <motion.div 
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, 10, 0]
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 7,
                ease: "easeInOut",
                delay: 2 
              }}
              className="absolute bottom-[25%] left-[25%] w-40 h-40 rounded-lg bg-gradient-to-r from-brand-yellow to-brand-orange opacity-15 blur-sm"
            ></motion.div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-block mb-4">
                <div className={`px-4 py-1 rounded-full text-sm font-semibold inline-flex items-center ${darkMode ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-red/10 text-brand-red'}`}>
                  <FaBolt className="mr-2" />
                  Interactive Quiz Platform
                </div>
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-bold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow">Root at the Core</span><br/>
                <span className="text-brand-red">Fun & Interactive</span>
              </h1>
              
              <p className={`text-lg md:text-xl mb-8 max-w-lg mx-auto lg:mx-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Create engaging quizzes or join existing ones in seconds. Perfect for classrooms, team building, or just having fun with friends!
              </p>
              
              {user ? (
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <motion.a 
                    href="/dashboard" 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`btn-lg bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl shadow-lg hover:shadow-brand-red/20 transform transition-all ${darkMode ? 'shadow-brand-red/10' : 'shadow-brand-red/30'}`}
                  >
                    <span className="flex items-center">
                      <FaGamepad className="mr-2" />
                      Start Playing
                    </span>
                  </motion.a>
                  
                  {user.isAdmin && (
                    <motion.a 
                      href="/admin/create" 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`btn-lg ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'} font-bold rounded-xl shadow-lg transform transition-all`}
                    >
                      <span className="flex items-center">
                        <FaPlus className="mr-2" />
                        Create Quiz
                      </span>
                    </motion.a>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`inline-flex items-center p-4 rounded-xl border ${darkMode ? 'bg-red-900/10 border-red-900/20 text-red-400' : 'bg-red-50 border-red-100 text-red-500'}`}
                >
                  <FaLock className="mr-3 flex-shrink-0" />
                  <p>Login to create and join interactive quizzes!</p>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Game-style Join Card */}
              <div className={`relative max-w-md mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl ${darkMode ? 'shadow-black/30' : 'shadow-gray-300/80'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-brand-red via-brand-orange to-brand-red p-5 text-white relative overflow-hidden">
                  {/* Animated shine effect */}
                  <div className="absolute inset-0">
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-full bg-white opacity-30 skew-x-12 transform -translate-x-full"
                      animate={{ translateX: ['100%', '-100%'] }}
                      transition={{ duration: 5, repeat: Infinity, repeatDelay: 10 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <h2 className="text-xl font-bold flex items-center">
                      <div className="relative mr-2">
                        <FaFireAlt className="h-5 w-5 animate-pulse" />
                        <div className="absolute inset-0 bg-white/30 blur-sm rounded-full animate-ping-slow"></div>
                      </div>
                      Join a Game
                    </h2>
                    <div className="flex items-center text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="animate-pulse mr-1.5 h-2 w-2 bg-green-400 rounded-full"></span>
                      LIVE
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6 relative">
                  <div className="text-center mb-6 relative z-10">
                    <div className={`mb-2 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter 6-digit game code</div>
                    <form onSubmit={handleJoinQuiz}>
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Enter code"
                          className={`w-full text-center text-3xl tracking-widest font-bold py-4 rounded-xl transition-all focus:ring-2 focus:ring-brand-red focus:border-brand-red ${
                            darkMode 
                              ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                          value={quizCode}
                          onChange={(e) => setQuizCode(e.target.value.slice(0, 6))}
                          maxLength={6}
                        />
                      </div>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-brand-red to-brand-orange text-white transition-all hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-red/10 hover:shadow-brand-red/20"
                        disabled={loading || !quizCode || quizCode.length < 6}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                          </div>
                        ) : (
                          <>
                            <FaPlay className="mr-2 inline-block" />
                            Join Game
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>
                  
                  {/* Quick Access Buttons */}
                  <div className={`text-center pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`mb-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</p>
                    <div className="flex justify-center space-x-3">
                      <motion.a 
                        href="/dashboard" 
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:opacity-90 transition-all`}
                      >
                        <FaGamepad />
                      </motion.a>
                      {user && user.isAdmin && (
                        <motion.a 
                          href="/admin/create" 
                          whileHover={{ scale: 1.1, y: -5 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:opacity-90 transition-all`}
                        >
                          <FaPlus />
                        </motion.a>
                      )}
                      <motion.a 
                        href="/dashboard" 
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:opacity-90 transition-all`}
                      >
                        <FaTrophy />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Animated Cards */}
      <section className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-red/5 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand-blue/5 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>How Rahoot Works</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-brand-red to-brand-orange rounded-full mx-auto mb-6"></div>
              <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Elevate your quiz experience with our interactive gaming platform
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-6 shadow-lg transform transition-all border ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative overflow-hidden`}
              >
                {/* Gradient accent corner */}
                <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-brand-red to-brand-orange opacity-10"></div>
                
                <div className={`mb-5 inline-flex p-4 rounded-2xl ${
                  index === 0 ? 'bg-gradient-to-br from-brand-red to-brand-orange' : 
                  index === 1 ? 'bg-gradient-to-br from-brand-blue to-cyan-600' : 
                  index === 2 ? 'bg-gradient-to-br from-brand-purple to-purple-700' : 
                  'bg-gradient-to-br from-brand-yellow to-amber-500'
                } text-white relative overflow-hidden shadow-lg`}>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-white opacity-30 blur-md transform -rotate-12 translate-x-full animate-slide-slow"></div>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-70"></div>
          
          <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-brand-red via-brand-orange to-transparent opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-brand-blue via-brand-cyan to-transparent opacity-10 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quiz Game Modes</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-brand-blue to-brand-cyan rounded-full mx-auto mb-6"></div>
              <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Choose the perfect setup for your next quiz session
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative`}
            >
              <div className="h-3 bg-gradient-to-r from-brand-red via-brand-orange to-brand-red"></div>
              <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
                {/* Subtle pattern */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-t from-brand-red/10 via-brand-orange/5 to-transparent blur-2xl"></div>
                
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-red/30 to-transparent opacity-60"></div>
                    <FaUsers className="h-6 w-6 relative z-10" />
                  </div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>For Educators</h3>
                </div>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Engage your students with interactive quizzes that make learning fun. Get instant feedback on their performance.
                </p>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                    POPULAR
                  </span>
                  <motion.a 
                    href="/dashboard" 
                    whileHover={{ x: 5 }}
                    className="text-brand-red font-medium flex items-center group"
                  >
                    Get Started
                    <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative`}
            >
              <div className="h-3 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-blue"></div>
              <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
                {/* Subtle blue pattern */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-t from-brand-blue/10 via-brand-cyan/5 to-transparent blur-2xl"></div>
                
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/30 to-transparent opacity-60"></div>
                    <FaHeadset className="h-6 w-6 relative z-10" />
                  </div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>For Teams</h3>
                </div>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Make team-building fun and interactive. Create custom quizzes for training or just for entertainment.
                </p>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                    TEAM-BASED
                  </span>
                  <motion.a 
                    href="/dashboard" 
                    whileHover={{ x: 5 }}
                    className="text-brand-blue font-medium flex items-center group"
                  >
                    Explore
                    <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative`}
            >
              <div className="h-3 bg-gradient-to-r from-brand-yellow via-amber-500 to-brand-yellow"></div>
              <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
                {/* Subtle yellow pattern */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-t from-brand-yellow/10 via-amber-500/5 to-transparent blur-2xl"></div>
                
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-yellow/30 to-transparent opacity-60"></div>
                    <FaAward className="h-6 w-6 relative z-10" />
                  </div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>For Friends</h3>
                </div>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Challenge your friends with trivia on any topic. Perfect for parties, game nights, or virtual hangouts.
                </p>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                    COMPETITIVE
                  </span>
                  <motion.a 
                    href="/dashboard" 
                    whileHover={{ x: 5 }}
                    className="text-brand-yellow font-medium flex items-center group"
                  >
                    Play Now
                    <FaArrowRight className="ml-2 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden z-0">
          {/* Geometric Background Patterns */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red via-transparent to-brand-blue"></div>
          <div className="absolute top-1/4 right-0 w-40 h-40 rounded-full bg-brand-red/5 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-0 w-40 h-40 rounded-full bg-brand-blue/5 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Experience the <span className="text-brand-red">Power</span> of Interactive Quizzes
              </h2>
              
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Our platform brings learning to life with engaging quizzes that captivate and challenge participants. See why educators and trainers trust Rahoot.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  { icon: <FaCheck className="h-4 w-4" />, text: "Visually engaging question formats" },
                  { icon: <FaCheck className="h-4 w-4" />, text: "Real-time leaderboards and competition" },
                  { icon: <FaCheck className="h-4 w-4" />, text: "Detailed analytics and insights" },
                  { icon: <FaCheck className="h-4 w-4" />, text: "Accessible anywhere, on any device" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <div className={`mr-3 h-6 w-6 flex items-center justify-center rounded-full ${
                      index % 2 === 0 ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'
                    }`}>
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaGamepad className="mr-2" />
                Try Demo Game
              </motion.a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              {/* Demo Quiz Preview */}
              <div className="relative w-full max-w-md">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-lg bg-brand-red/20 animate-float"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-lg bg-brand-blue/20 animate-float" style={{animationDelay: '1s'}}></div>
                
                {/* Main quiz window */}
                <div className={`rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {/* Quiz header */}
                  <div className="bg-gradient-to-r from-brand-red via-brand-orange to-brand-red p-4 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold flex items-center">
                        <FaFireAlt className="mr-2" /> Rahoot Quiz
                      </h3>
                      <div className="px-2 py-1 bg-white/20 rounded-full text-xs">Question 3/10</div>
                    </div>
                  </div>
                  
                  {/* Quiz question */}
                  <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className="text-center mb-6">
                      <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>What is the capital of France?</h4>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-brand-blue"
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 5, repeat: Infinity }}
                        ></motion.div>
                      </div>
                    </div>
                    
                    {/* Answer options */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.03 }}
                        className="bg-brand-red text-white p-3 rounded-lg cursor-pointer font-medium"
                      >
                        Berlin
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.03 }}
                        className="bg-brand-blue text-white p-3 rounded-lg cursor-pointer font-medium"
                      >
                        Madrid
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.03 }}
                        className="bg-brand-yellow text-gray-800 p-3 rounded-lg cursor-pointer font-medium"
                      >
                        Paris
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.03 }}
                        className="bg-brand-green text-white p-3 rounded-lg cursor-pointer font-medium"
                      >
                        Rome
                      </motion.div>
                    </div>
                    
                    {/* Player info */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold mr-2">
                          P
                        </div>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Player1</span>
                      </div>
                      <div className="flex items-center">
                        <FaTrophy className="text-brand-yellow mr-2" />
                        <span className="font-bold text-lg">720</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
        {/* Background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-blue opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-green to-brand-red opacity-50"></div>
          
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-brand-red to-brand-orange opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan opacity-10 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${darkMode ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-red/10 text-brand-red'}`}>
              <FaCrown className="mr-2" />
              Ready to Challenge Your Friends?
            </div>
            
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Your First Quiz Today
            </h2>
            
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of educators, team leaders, and quiz enthusiasts who are making learning interactive and fun with Rahoot!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a 
                href={user ? "/dashboard" : "#"} 
                onClick={() => !user && toast.error('Please log in to continue', {
                  icon: '🔒',
                  style: { borderRadius: '10px', background: '#333', color: '#fff' }
                })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-lg bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold rounded-xl transform transition-all shadow-lg shadow-brand-red/10"
              >
                <FaGamepad className="mr-2" />
                Get Started Now
              </motion.a>
              
              <motion.a 
                href="#features" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`btn-lg ${darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-800'} font-bold rounded-xl shadow-lg`}
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Redesigned Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-5 h-16">
            <motion.a 
              href="/"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className={`p-1.5 rounded-full ${router.pathname === '/' ? 'bg-brand-red/10 text-brand-red' : 'text-gray-500'}`}>
                <FaHome className="h-5 w-5" />
              </div>
              <span className={`mt-1 font-medium ${router.pathname === '/' ? 'text-brand-red' : 'text-gray-500'}`}>Home</span>
            </motion.a>
            
            <motion.a 
              href="/dashboard"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className={`p-1.5 rounded-full ${router.pathname === '/dashboard' ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-500'}`}>
                <FaGamepad className="h-5 w-5" />
              </div>
              <span className={`mt-1 font-medium ${router.pathname === '/dashboard' ? 'text-brand-blue' : 'text-gray-500'}`}>Play</span>
            </motion.a>
            
            <motion.a 
              href="/join"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative -top-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red to-brand-orange rounded-full opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-brand-red to-brand-orange w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-brand-red/20">
                  <FaPlay className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500 -mt-3">Join</span>
            </motion.a>
            
            <motion.a 
              href="/leaderboard"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className={`p-1.5 rounded-full ${router.pathname === '/leaderboard' ? 'bg-brand-yellow/10 text-brand-yellow' : 'text-gray-500'}`}>
                <FaTrophy className="h-5 w-5" />
              </div>
              <span className={`mt-1 font-medium ${router.pathname === '/leaderboard' ? 'text-brand-yellow' : 'text-gray-500'}`}>Ranks</span>
            </motion.a>
            
            <motion.a 
              href="/profile"
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div className={`p-1.5 rounded-full ${router.pathname === '/profile' ? 'bg-brand-green/10 text-brand-green' : 'text-gray-500'}`}>
                <FaUsers className="h-5 w-5" />
              </div>
              <span className={`mt-1 font-medium ${router.pathname === '/profile' ? 'text-brand-green' : 'text-gray-500'}`}>Profile</span>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className={`py-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-brand-red to-brand-orange rounded-lg p-2 mr-3">
                <FaFireAlt className="h-6 w-6 text-white" />
              </div>
              <span className="font-display font-bold text-3xl">
                <span className="text-brand-red">Ra</span>
                <span className="text-brand-blue">hoot</span>
              </span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaGamepad className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaUsers className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTrophy className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaQuestionCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} Rahoot. All rights reserved.
              </p>
              
              <div className="flex space-x-8 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
