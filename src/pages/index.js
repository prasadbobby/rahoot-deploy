import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { joinQuiz } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FaPlay, FaQuestionCircle, FaTrophy, FaPlus, 
  FaMedal, FaUsers, FaChartBar, FaLock, FaArrowRight,
  FaBolt, FaGamepad, FaFireAlt, FaCrown, FaLightbulb,
  FaRocket, FaAward, FaHeadset, FaGem
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
      icon: <FaTrophy className="h-6 w-6" />,
      title: "Compete & Win",
      description: "Compete with friends, classmates or colleagues for the top spot."
    }
  ];

  return (
    <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section with Game UI Aesthetic */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-20 left-10 w-64 h-64 rounded-full ${darkMode ? 'bg-brand-red/5' : 'bg-brand-red/10'} blur-3xl animate-float`}></div>
          <div className={`absolute bottom-20 right-10 w-80 h-80 rounded-full ${darkMode ? 'bg-brand-blue/5' : 'bg-brand-blue/10'} blur-3xl animate-float`} style={{animationDelay: '1s'}}></div>
          <div className={`absolute top-1/3 right-1/4 w-40 h-40 rounded-full ${darkMode ? 'bg-brand-yellow/5' : 'bg-brand-yellow/10'} blur-3xl animate-float`} style={{animationDelay: '2s'}}></div>
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
                  Interactive Learning Platform
                </div>
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-bold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Learning Made <br />
                <span className="text-brand-red">Fun & Interactive</span>
              </h1>
              
              <p className={`text-lg md:text-xl mb-8 max-w-lg mx-auto lg:mx-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Create engaging quizzes or join existing ones in seconds. Perfect for classrooms, team building, or just having fun with friends!
              </p>
              
              {user ? (
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <a 
                    href="/dashboard" 
                    className={`btn-lg bg-brand-red text-white font-bold rounded-xl shadow-lg hover:shadow-brand-red/20 transform transition-all hover:-translate-y-1 ${darkMode ? 'shadow-brand-red/10' : 'shadow-brand-red/30'}`}
                  >
                    <span className="flex items-center">
                      <FaGamepad className="mr-2" />
                      Start Playing
                    </span>
                  </a>
                  
                  {user.isAdmin && (
                    <a 
                      href="/admin/create" 
                      className={`btn-lg ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'} font-bold rounded-xl shadow-lg transform transition-all hover:-translate-y-1`}
                    >
                      <span className="flex items-center">
                        <FaPlus className="mr-2" />
                        Create Quiz
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <div className={`inline-flex items-center p-4 rounded-xl border ${darkMode ? 'bg-red-900/10 border-red-900/20 text-red-400' : 'bg-red-50 border-red-100 text-red-500'}`}>
                  <FaLock className="mr-3 flex-shrink-0" />
                  <p>Login to create and join interactive quizzes!</p>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Game-style Join Card */}
              <div className={`relative max-w-md mx-auto overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl ${darkMode ? 'shadow-black/30' : 'shadow-gray-300/80'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {/* Card Header */}
                <div className="bg-gradient-to-r from-brand-red to-brand-blue p-5 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center">
                      <FaGamepad className="mr-2" />
                      Join a Game
                    </h2>
                    <div className="flex items-center text-xs bg-white/20 rounded-full px-3 py-1">
                      <span className="animate-pulse mr-1.5 h-2 w-2 bg-green-400 rounded-full"></span>
                      LIVE
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6">
                  <div className="text-center mb-6">
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
                      <button
                        type="submit"
                        className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-brand-red text-white transition-all hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-red/10 hover:shadow-brand-red/20"
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
                      </button>
                    </form>
                  </div>
                  
                  {/* Quick Access Buttons */}
                  <div className={`text-center pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`mb-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</p>
                    <div className="flex justify-center space-x-3">
                      <a href="/dashboard" className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:opacity-90`}>
                        <FaGamepad />
                      </a>
                      {user && user.isAdmin && (
                        <a href="/admin/create" className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:opacity-90`}>
                          <FaPlus />
                        </a>
                      )}
                      <a href="/dashboard" className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:opacity-90`}>
                        <FaTrophy />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Game Cards */}
      <section className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>How Rahoot Works</h2>
            <div className="h-1 w-20 bg-brand-red rounded-full mx-auto mb-6"></div>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Elevate your quiz experience with our interactive gaming platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-6 shadow-lg transform transition-all hover:-translate-y-2 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className={`mb-5 inline-flex p-4 rounded-2xl ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-purple-500' : 'bg-amber-500'} text-white`}>
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
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quiz Game Modes</h2>
            <div className="h-1 w-20 bg-brand-blue rounded-full mx-auto mb-6"></div>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the perfect setup for your next quiz session
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="h-3 bg-brand-red"></div>
              <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                    <FaUsers className="h-6 w-6" />
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
                  <a href="/dashboard" className="text-brand-red font-medium flex items-center">
                    Get Started
                    <FaArrowRight className="ml-2 text-sm" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="h-3 bg-brand-blue"></div>
              <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <FaHeadset className="h-6 w-6" />
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
                  <a href="/dashboard" className="text-brand-blue font-medium flex items-center">
                    Explore
                    <FaArrowRight className="ml-2 text-sm" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className={`rounded-2xl overflow-hidden shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="h-3 bg-brand-yellow"></div>
              <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl mr-4 flex items-center justify-center ${darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
                    <FaAward className="h-6 w-6" />
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
                  <a href="/dashboard" className="text-brand-yellow font-medium flex items-center">
                    Play Now
                    <FaArrowRight className="ml-2 text-sm" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section with Game Button */}
      <section className={`py-20 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-100'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            <a 
              href={user ? "/dashboard" : "#"} 
              onClick={() => !user && toast.error('Please log in to continue', {
                icon: '🔒',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
              })}
              className="btn-lg bg-brand-red text-white font-bold rounded-xl transform transition-all hover:-translate-y-1 shadow-lg shadow-brand-red/20"
            >
              <FaGamepad className="mr-2" />
              Get Started Now
            </a>
            <a 
              href="#features" 
              className={`btn-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} font-bold rounded-xl`}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Game-Themed Footer */}
      <footer className={`py-8 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-brand-red rounded-lg p-2 mr-2">
                <FaGamepad className="h-5 w-5 text-white" />
              </div>
              <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Rahoot
              </span>
            </div>
            
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © {new Date().getFullYear()} Rahoot. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}