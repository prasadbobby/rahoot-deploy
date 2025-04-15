import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchQuizzes, deleteQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaPlay, FaSearch, FaFilter, 
  FaSortAmountDown, FaCalendarAlt, FaQuestionCircle, FaTag,
  FaTachometerAlt, FaCog, FaExclamationCircle, FaListUl, FaTh,
  FaEllipsisH, FaExternalLinkAlt
} from 'react-icons/fa';
import AdminGuard from '@/components/guards/AdminGuard';
import AppLayout from '@/components/layout/AppLayout';


export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      if (!authLoading && (!user || !isAdmin)) {
        router.push('/');
        return;
      }

      if (user && isAdmin) {
        try {
          const data = await fetchQuizzes();
          setQuizzes(data);
          setFilteredQuizzes(data);
        } catch (error) {
          toast.error('Failed to load quizzes');
        } finally {
          setLoading(false);
        }
      }
    }

    loadData();
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    let result = [...quizzes];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'questionCount') {
        return sortOrder === 'asc'
          ? a.questionCount - b.questionCount
          : b.questionCount - a.questionCount;
      }
      return 0;
    });
    
    setFilteredQuizzes(result);
  }, [quizzes, searchTerm, sortBy, sortOrder]);

  const handleDeleteQuiz = async (id) => {
    try {
      await deleteQuiz(id);
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      toast.success('Quiz deleted successfully', {
        icon: '🗑️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete quiz', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    }
  };

  const handleEditQuiz = (id) => {
    router.push(`/admin/edit/${id}`);
  };

  const handleHostQuiz = (id) => {
    router.push(`/admin/host/${id}`);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
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

  return (
    <AppLayout>
    <AdminGuard>
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Quiz Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create, edit, and host interactive quizzes</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/admin/create')}
              className="btn-primary"
            >
              <FaPlus className="mr-2" />
              Create Quiz
            </button>
          </div>
        </div>
        
        {/* Filter Bar */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quizzes..."
                className="input pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input pr-10 py-2"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="title">Title</option>
                  <option value="questionCount">Question Count</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <FaFilter size={14} />
                </div>
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-2"
                aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
              >
                <FaSortAmountDown className={`h-5 w-5 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                  aria-label="Grid view"
                >
                  <FaTh className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                  aria-label="List view"
                >
                  <FaListUl className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quizzes Display */}
        {filteredQuizzes.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="mb-4">
              <FaExclamationCircle className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Quizzes Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? "No quizzes match your search" : "You haven't created any quizzes yet"}
            </p>
            <button
              onClick={() => router.push('/admin/create')}
              className="btn-primary mx-auto"
            >
              <FaPlus className="mr-2" />
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card card-hover overflow-hidden"
                  >
                    <div className="h-2 bg-gradient-to-r from-brand-red to-brand-blue"></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold mb-1 line-clamp-1">{quiz.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="badge badge-primary flex items-center">
                              <FaTag className="mr-1 text-xs" />
                              {quiz.subject}
                            </span>
                            <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center">
                              <FaQuestionCircle className="mr-1 text-xs" />
                              {quiz.questionCount}
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(quiz.id)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <FaEllipsisH className="text-gray-500" />
                          </button>
                          
                          {activeDropdown === quiz.id && (
                            <div className="absolute right-0 mt-2 w-48 dropdown-menu z-20">
                              <button
                                onClick={() => handleHostQuiz(quiz.id)}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <FaPlay className="mr-2 text-green-600" />
                                Host Quiz
                              </button>
                              <button
                                onClick={() => handleEditQuiz(quiz.id)}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <FaEdit className="mr-2 text-blue-600" />
                                Edit Quiz
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(quiz.id)}
                                className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                              >
                                <FaTrash className="mr-2" />
                                Delete Quiz
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-mono">
                          {quiz.code}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex border-t border-gray-100 dark:border-gray-700">
                      <button 
                        onClick={() => handleHostQuiz(quiz.id)}
                        className="flex-1 flex justify-center items-center py-3 text-brand-green hover:bg-brand-green/10 transition-colors"
                        aria-label={`Host ${quiz.title}`}
                      >
                        <FaPlay className="mr-1" />
                        Host
                      </button>
                      <button 
                        onClick={() => handleEditQuiz(quiz.id)}
                        className="flex-1 flex justify-center items-center py-3 text-brand-blue hover:bg-brand-blue/10 border-l border-r border-gray-100 dark:border-gray-700 transition-colors"
                        aria-label={`Edit ${quiz.title}`}
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(quiz.id)}
                        className="flex-1 flex justify-center items-center py-3 text-brand-red hover:bg-brand-red/10 transition-colors"
                        aria-label={`Delete ${quiz.title}`}
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quiz
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Questions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredQuizzes.map((quiz) => (
                        <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium">{quiz.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{quiz.subject}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-full font-mono text-sm">
                              {quiz.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {quiz.questionCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleHostQuiz(quiz.id)}
                                className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                              >
                                <FaPlay />
                              </button>
                              <button
                                onClick={() => handleEditQuiz(quiz.id)}
                                className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(quiz.id)}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="card bg-gradient-to-r from-brand-red to-brand-blue text-white">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-white/10 rounded-lg mr-4">
                <FaTachometerAlt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Quiz Overview</h3>
                <p className="text-white/80 text-sm">Current status of your quizzes</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {filteredQuizzes.length}
                </div>
                <div className="text-sm text-white/80">
                  Total Quizzes
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {filteredQuizzes.reduce((sum, quiz) => sum + (quiz.questionCount || 0), 0)}
                </div>
                <div className="text-sm text-white/80">
                  Total Questions
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={() => router.push('/admin/create')}
                className="btn btn-lg bg-white text-brand-red hover:bg-white/90"
              >
                <FaPlus className="mr-2" />
                Create New Quiz
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="card h-full flex flex-col">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FaCog className="mr-2 text-brand-blue" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                <div className="card bg-gradient-to-br from-brand-blue/5 to-brand-blue/10 border border-brand-blue/20 hover:border-brand-blue/30 p-5 transition-all">
                  <h4 className="text-lg font-semibold mb-2 text-brand-blue">Host a Quiz</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a quiz to host for your participants
                  </p>
                  <div className="mt-auto">
                    <select className="input mb-3">
                      <option value="">Select a quiz...</option>
                      {filteredQuizzes.slice(0, 5).map(quiz => (
                        <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                      ))}
                    </select>
                    <button className="btn-secondary w-full">
                      <FaPlay className="mr-2" />
                      Start Hosting
                    </button>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-brand-yellow/5 to-brand-yellow/10 border border-brand-yellow/20 hover:border-brand-yellow/30 p-5 transition-all">
                  <h4 className="text-lg font-semibold mb-2 text-brand-yellow">Recent Results</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View recent quiz session results
                  </p>
                  <ul className="space-y-2 text-sm mb-3">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">HTML Basics</span>
                      <span>3 players</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">JavaScript Quiz</span>
                      <span>5 players</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">CSS Trivia</span>
                      <span>2 players</span>
                    </li>
                  </ul>
                  <button className="btn bg-brand-yellow text-gray-800 w-full">
                    <FaExternalLinkAlt className="mr-2" />
                    View All Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-md w-full"
            >
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30">
                  <FaTrash className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="mt-3 text-xl font-medium">Confirm Deletion</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Are you sure you want to delete this quiz? This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuiz(deleteConfirm)}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </AdminGuard>
    </AppLayout>
  );
}