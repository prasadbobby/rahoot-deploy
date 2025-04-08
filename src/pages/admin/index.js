// src/pages/admin/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaPlus, FaEdit, FaTrash, FaPlay, FaSearch, FaFilter, FaSortAmountDown, FaEye } from 'react-icons/fa';
import { fetchQuizzes, deleteQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      if (!authLoading && (!user || !isAdmin())) {
        router.push('/');
        return;
      }

      if (user && isAdmin()) {
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
      toast.success('Quiz deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const handleEditQuiz = (id) => {
    router.push(`/admin/edit/${id}`);
  };

  const handleHostQuiz = (id) => {
    router.push(`/admin/host/${id}`);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3 dark:text-white">Quiz Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Create, edit, and host interactive quizzes for your audience</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quizzes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto mt-3 md:mt-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="questionCount">Question Count</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                <FaFilter size={14} />
              </div>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FaSortAmountDown className={`text-gray-700 dark:text-gray-200 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={() => router.push('/admin/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Quiz
            </button>
          </div>
        </div>
        
        {filteredQuizzes.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-10 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m0 16v1m-8-8h1m15.1 0h1M5.05 5.05l.707.707M18.243 18.243l.707.707M6.344 17A8 8 0 1 1 17.658 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">No Quizzes Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? "No quizzes match your search" : "You haven't created any quizzes yet"}
            </p>
            <button
              onClick={() => router.push('/admin/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold mb-1 dark:text-white line-clamp-1">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{quiz.subject}</p>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm px-2 py-1 rounded">
                      {quiz.code}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {quiz.questionCount} questions
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex border-t border-gray-200 dark:border-gray-600">
                  <button 
                    onClick={() => handleHostQuiz(quiz.id)}
                    className="flex-grow py-3 flex justify-center items-center text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                  >
                    <FaPlay className="mr-1" />
                    Host
                  </button>
                  <button 
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="flex-grow py-3 flex justify-center items-center text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 border-l border-r border-gray-200 dark:border-gray-600"
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(quiz.id)}
                    className="flex-grow py-3 flex justify-center items-center text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuiz(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}