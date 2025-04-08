import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { FaPlay, FaQuestionCircle, FaChartBar } from 'react-icons/fa';
import { joinQuiz } from '@/lib/api'; // Add this import
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [quizCode, setQuizCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    if (!quizCode) {
      toast.error('Please enter a quiz code');
      return;
    }
    
    if (!user) {
      toast.error('Please log in to join a quiz');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Attempting to join quiz with code: ${quizCode}`);
      const quiz = await joinQuiz(quizCode);
      console.log('Quiz join response:', quiz);
      
      if (quiz && quiz.id) {
        router.push(`/play/${quiz.id}`);
      } else {
        toast.error('Invalid quiz code or quiz not found');
      }
    } catch (error) {
      console.error('Error joining quiz:', error);
      toast.error('Invalid quiz code or quiz not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Learn Together, Play Together
              </h1>
              <p className="text-lg mb-6">
                Create engaging quizzes or join existing ones. Perfect for classrooms, team building, or just having fun!
              </p>
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/dashboard" 
                    className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow-md transition-all flex items-center justify-center"
                  >
                    <FaChartBar className="mr-2" />
                    Dashboard
                  </a>
                  {user.isAdmin && (
                    <a 
                      href="/admin/create" 
                      className="bg-indigo-800 text-white hover:bg-indigo-900 px-6 py-3 rounded-lg font-medium shadow-md transition-all flex items-center justify-center"
                    >
                      <FaQuestionCircle className="mr-2" />
                      Create Quiz
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-lg font-medium">Login to create and join quizzes!</p>
              )}
            </div>
            <div className="md:w-1/2 md:pl-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Join a Quiz</h2>
                <form onSubmit={handleJoinQuiz}>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Enter Quiz Code"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      value={quizCode}
                      onChange={(e) => setQuizCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                    disabled={loading || !user}
                  >
                    {loading ? 'Joining...' : (
                      <>
                        <FaPlay className="mr-2" />
                        Join Quiz
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">
              <FaPlay />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Join Quizzes</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter a quiz code to join real-time interactive quiz sessions with your friends or classmates.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">
              <FaQuestionCircle />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Create Quizzes</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create your own quizzes with custom questions, timers, and images. Share with your audience in seconds.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">
              <FaChartBar />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Track Performance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View detailed stats and leaderboards to see how you compare to others or analyze participants' performance.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">How Rahoot Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Sign In</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create an account or sign in with Google to access all features
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Create or Join</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your own quizzes or join existing ones with a 6-digit code
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Play & Compete</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Answer questions quickly to score more points and climb the leaderboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}