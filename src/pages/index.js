import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { joinQuiz } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FaPlay, FaQuestionCircle, FaTrophy, FaPlus, 
  FaMedal, FaUsers, FaChartBar, FaLock, FaArrowRight
} from 'react-icons/fa';

export default function Home() {
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

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
      icon: <FaPlay className="h-6 w-6" />,
      title: "Instant Quizzes",
      description: "Join quizzes in seconds with just a 6-digit code. No downloads required."
    },
    {
      icon: <FaQuestionCircle className="h-6 w-6" />,
      title: "Create & Customize",
      description: "Build your own quizzes with custom questions, timers, images, and more."
    },
    {
      icon: <FaChartBar className="h-6 w-6" />,
      title: "Real-time Results",
      description: "See live leaderboards and detailed analytics as participants answer."
    },
    {
      icon: <FaUsers className="h-6 w-6" />,
      title: "Multiplayer Fun",
      description: "Compete with friends, classmates or colleagues in real-time."
    }
  ];

  return (
    <div className="pt-20 md:pt-24">
      {/* Hero Section with Animated Elements */}
      <section className="relative overflow-hidden">
        {/* Abstract Shapes Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-brand-red/20 animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-brand-blue/20 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-brand-yellow/20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Make Learning <br />
                <span className="text-gradient-animated">Interactive & Fun</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
                Create engaging quizzes or join existing ones in seconds. Perfect for classrooms, team building, or just having fun with friends!
              </p>
              
              {user ? (
                <div className="flex flex-wrap gap-4">
                <a 
                  href="/dashboard" 
                  className="btn-primary btn-lg group"
                >
                  Dashboard
                  <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </a>
                {user.isAdmin && (
                  <a 
                    href="/admin/create" 
                    className="btn-secondary btn-lg group"
                  >
                    <FaPlus className="mr-2" />
                    Create Quiz
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-brand-red/10 text-brand-red rounded-lg border border-brand-red/20 mb-6">
                <FaLock className="flex-shrink-0" />
                <p className="text-sm">Login to create and join quizzes!</p>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Quiz Join Card with Floating Effect */}
            <div className="relative z-10 animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow rounded-3xl blur-lg opacity-50 transform -rotate-3"></div>
              <div className="card rounded-3xl p-8 transform rotate-3 overflow-hidden">
                {/* Card Pattern Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className={`${Math.random() > 0.9 ? 'bg-brand-blue' : 'bg-brand-red'} opacity-${Math.floor(Math.random() * 50)} rounded-full`}></div>
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-6 text-center text-gradient">
                  Join a Quiz
                </h2>
                
                <form onSubmit={handleJoinQuiz}>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="input text-center text-2xl tracking-widest font-medium"
                      value={quizCode}
                      onChange={(e) => setQuizCode(e.target.value.slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-lg"
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
                        <FaPlay className="mr-2" />
                        Join Quiz
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-5 -right-10 w-20 h-20 bg-brand-yellow rounded-lg transform rotate-12 z-0 hidden md:block"></div>
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-brand-blue rounded-full z-0 hidden md:block animate-pulse-slow"></div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 bg-white dark:bg-brand-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Rahoot Works</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Elevate your quiz experience with our intuitive platform
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
              className="card card-hover"
            >
              <div className="mb-5 inline-flex p-3 rounded-xl bg-gradient-to-br from-brand-red to-brand-blue text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Use Cases Section */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-br from-brand-red to-rose-500 text-white p-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-red mr-4">
                <FaUsers className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">For Educators</h3>
            </div>
            <p className="mb-6 opacity-90">
              Engage your students with interactive quizzes that make learning fun. Get instant feedback on their performance.
            </p>
            <a href="/dashboard" className="inline-flex items-center text-white font-medium group">
              Get Started 
              <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-br from-brand-blue to-cyan-600 text-white p-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-blue mr-4">
                <FaTrophy className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">For Teams</h3>
            </div>
            <p className="mb-6 opacity-90">
              Make team-building fun and interactive. Create custom quizzes for training or just for entertainment.
            </p>
            <a href="/dashboard" className="inline-flex items-center text-white font-medium group">
              Explore Features
              <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-br from-brand-yellow to-amber-500 text-gray-900 p-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-600 mr-4">
                <FaMedal className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">For Friends</h3>
            </div>
            <p className="mb-6 opacity-90">
              Challenge your friends with trivia on any topic. Perfect for parties, game nights, or virtual hangouts.
            </p>
            <a href="/dashboard" className="inline-flex items-center text-gray-900 font-medium group">
              Start Playing
              <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-16 bg-white dark:bg-brand-dark-card">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block p-2 bg-brand-red/10 text-brand-red rounded-full font-medium text-sm mb-4">
          Ready to start?
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Create Your First Quiz Today
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of educators, team leaders, and quiz enthusiasts who are making learning interactive and fun with Rahoot!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href={user ? "/dashboard" : "#"} 
            onClick={() => !user && toast.error('Please log in to continue', {
              icon: '🔒',
              style: { borderRadius: '10px', background: '#333', color: '#fff' }
            })}
            className="btn-primary btn-lg"
          >
            Get Started for Free
          </a>
          <a href="#features" className="btn-ghost btn-lg text-gray-700 dark:text-white">
            Learn More
          </a>
        </div>
      </div>
    </section>
  </div>
);
}