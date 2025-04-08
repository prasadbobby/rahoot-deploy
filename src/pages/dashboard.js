import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { FaTrophy, FaPlay, FaHistory } from 'react-icons/fa';
import { fetchUserResults, fetchQuizzes, joinQuiz } from '@/lib/api'; // Add joinQuiz import here
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
    const [userResults, setUserResults] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState(''); // Add this state
    const [joiningQuiz, setJoiningQuiz] = useState(false); // Add this state
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        async function loadData() {
            if (!user && !authLoading) {
                router.push('/');
                return;
            }

            if (user) {
                try {
                    const [resultsData, quizzesData] = await Promise.all([
                        fetchUserResults(user.id),
                        fetchQuizzes()
                    ]);
                    setUserResults(resultsData);
                    setQuizzes(quizzesData);
                } catch (error) {
                    toast.error('Failed to load dashboard data');
                } finally {
                    setLoading(false);
                }
            }
        }

        loadData();
    }, [user, authLoading, router]);

    const handleJoinQuiz = async () => {
        try {
            if (!joinCode || joinCode.trim() === '') {
                toast.error('Please enter a valid quiz code');
                return;
            }

            setJoiningQuiz(true);
            console.log(`Attempting to join quiz with code: ${joinCode}`);

            const quiz = await joinQuiz(joinCode);
            console.log('Quiz join response:', quiz);

            if (quiz && quiz.id) {
                router.push(`/play/${quiz.id}`);
            } else {
                toast.error('Failed to get quiz details');
            }
        } catch (error) {
            console.error('Error joining quiz:', error);
            toast.error('Failed to join quiz. Please check the code and try again.');
        } finally {
            setJoiningQuiz(false);
        }
    };


    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Recent Results */}
                <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center mb-6">
                        <FaHistory className="text-indigo-600 dark:text-indigo-400 text-2xl mr-2" />
                        <h2 className="text-2xl font-bold dark:text-white">Your Recent Results</h2>
                    </div>

                    {userResults.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>You haven't completed any quizzes yet.</p>
                            <p>Join a quiz to see your results here!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userResults.map((result) => (
                                <div key={result.id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{result.quizTitle}</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{result.quizSubject}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(result.completedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-xl dark:text-white">
                                                {result.score} / {result.maxScore}
                                            </div>
                                            <div className="text-indigo-600 dark:text-indigo-400">
                                                {Math.round((result.score / result.maxScore) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="w-full md:w-1/3 space-y-6">
                    {/* Join Quiz */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Join a Quiz</h2>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Enter Quiz Code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                onClick={handleJoinQuiz}
                                disabled={joiningQuiz}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                            >
                                {joiningQuiz ? (
                                    <span>Joining...</span>
                                ) : (
                                    <>
                                        <FaPlay className="mr-2" />
                                        Join Quiz
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Available Quizzes */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Available Quizzes</h2>
                        {quizzes.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No quizzes available</p>
                        ) : (
                            <div className="space-y-3">
                                {quizzes.slice(0, 5).map((quiz) => (
                                    <div key={quiz.id} className="border dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <h3 className="font-bold dark:text-white">{quiz.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{quiz.subject}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Code: {quiz.code}</span>
                                            <button
                                                onClick={() => handleJoinQuiz(quiz.code)}
                                                className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded text-sm font-medium"
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <FaTrophy className="text-yellow-500 text-2xl mr-2" />
                            <h2 className="text-xl font-bold dark:text-white">Your Achievements</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-lg ${userResults.length > 0 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'} text-center`}>
                                <div className={`font-bold ${userResults.length > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                    First Quiz
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${userResults.length >= 5 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'} text-center`}>
                                <div className={`font-bold ${userResults.length >= 5 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                    Quiz Explorer
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${userResults.some(r => (r.score / r.maxScore) === 1) ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'} text-center`}>
                                <div className={`font-bold ${userResults.some(r => (r.score / r.maxScore) === 1) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                    Perfect Score
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${userResults.length >= 10 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'} text-center`}>
                                <div className={`font-bold ${userResults.length >= 10 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                    Quiz Master
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}