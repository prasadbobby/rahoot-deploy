import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchQuiz, updateQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaTrash, FaImage, FaSave, FaArrowLeft, FaCheck, 
  FaClock, FaEye, FaAngleLeft, FaAngleRight, FaQuestionCircle,
  FaEdit, FaPencilAlt
} from 'react-icons/fa';

export default function EditQuiz() {
  const { user, loading: authLoading } = useAuth();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      if (!id) return;
      
      try {
        const quiz = await fetchQuiz(id);
        setTitle(quiz.title);
        setSubject(quiz.subject);
        setQuestions(quiz.questions || []);
        setInitialLoad(false);
      } catch (error) {
        toast.error('Failed to load quiz');
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadQuiz();
    }
  }, [id, router]);

  // Track changes to enable the save button
  useEffect(() => {
    if (!initialLoad) {
      setUnsavedChanges(true);
    }
  }, [title, subject, questions, initialLoad]);

  const handleAddQuestion = () => {
    const newQuestion = {
      question: '',
      answers: ['', '', '', ''],
      solution: 0,
      image: '',
      time: 15,
      cooldown: 5,
    };
    
    setQuestions([...questions, newQuestion]);
    // Switch to the new question
    setCurrentQuestion(questions.length);
    setUnsavedChanges(true);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      
      // Adjust currentQuestion if necessary
      if (currentQuestion >= newQuestions.length) {
        setCurrentQuestion(newQuestions.length - 1);
      }
      setUnsavedChanges(true);
    } else {
      toast.error('You need at least one question', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
    setUnsavedChanges(true);
  };

  const handleAnswerChange = (questionIndex, answerIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex] = value;
    setQuestions(updatedQuestions);
    setUnsavedChanges(true);
  };

  const handleUpdateQuiz = async () => {
    if (!title) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (!subject) {
      toast.error('Please enter a subject');
      return;
    }

    const invalidQuestions = questions.some(q => 
      !q.question || q.answers.some(a => !a) || q.time <= 0 || q.cooldown <= 0
    );

    if (invalidQuestions) {
      toast.error('Please fill in all question fields');
      return;
    }

    setSaving(true);

    try {
      await updateQuiz(id, {
        title,
        subject,
        questions,
      });
      
      setUnsavedChanges(false);
      toast.success('Quiz updated successfully!');
      router.push('/admin');
    } catch (error) {
      toast.error('Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleAddQuestion();
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const answerColors = [
    'bg-brand-red text-white',
    'bg-brand-blue text-white',
    'bg-brand-yellow text-gray-900',
    'bg-brand-green text-white'
  ];

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1A0029] pt-24 flex justify-center items-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-t-brand-red border-r-brand-blue border-b-brand-green border-l-brand-yellow animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white dark:bg-[#1A0029] flex items-center justify-center text-brand-red">
              <FaEdit className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A0029] pt-16 pb-16">
      {/* Fixed Header/Toolbar */}
      <div className="fixed top-16 inset-x-0 z-30 backdrop-blur-md bg-white/95 dark:bg-[#1A0029]/95 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    Edit: {title}
                  </h1>
                  <span className="ml-2 px-2 py-1 text-xs rounded-md bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue">
                    {subject}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center ml-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdateQuiz}
                disabled={saving || !unsavedChanges}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
                  unsavedChanges 
                    ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Quiz Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
            <FaPencilAlt className="mr-2 text-brand-blue" />
            Quiz Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-800 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-800 dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>
        
        {/* Question Navigation */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestion === 0}
              className={`p-2 rounded-md transition-colors ${
                currentQuestion === 0
                  ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FaAngleLeft className="h-5 w-5" />
            </button>
            
            <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            
            <button
              onClick={goToNextQuestion}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaAngleRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleRemoveQuestion(currentQuestion)}
              disabled={questions.length <= 1}
              className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                questions.length <= 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
              }`}
            >
              <FaTrash className="mr-1 h-4 w-4" />
              Remove
            </button>
            
            <button
              onClick={handleAddQuestion}
              className="flex items-center px-3 py-2 rounded-md font-medium bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/20 dark:hover:bg-brand-blue/30 transition-colors"
            >
              <FaPlus className="mr-1 h-4 w-4" />
              Add Question
            </button>
          </div>
        </div>
        
        {/* Question Editor */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden"
        >
          {/* Question Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-6 py-4">
            <div className="flex items-center">
              <div className="bg-brand-red text-white h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3">
                {currentQuestion + 1}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Question Editor</h3>
            </div>
          </div>
          
          <div className="p-6">
            {/* Question Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question Text
              </label>
              <input
                type="text"
                value={questions[currentQuestion]?.question || ''}
                onChange={(e) => handleQuestionChange(currentQuestion, 'question', e.target.value)}
                placeholder="Enter your question"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-800 dark:text-white transition-colors"
              />
            </div>
            
            {/* Image URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL (optional)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={questions[currentQuestion]?.image || ''}
                  onChange={(e) => handleQuestionChange(currentQuestion, 'image', e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-800 dark:text-white transition-colors"
                />
                <div className="px-4 py-2 rounded-r-lg bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-700 flex items-center">
                  <FaImage className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              {questions[currentQuestion]?.image && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Image Preview:</p>
                  <div className="flex justify-center">
                    <img 
                      src={questions[currentQuestion].image} 
                      alt="Preview" 
                      className="max-h-40 rounded-lg object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x200/gray/white?text=Invalid+Image';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Answer Options */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer Options
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  Select the correct answer
                </div>
              </div>
              
              <div className="space-y-4">
                {questions[currentQuestion]?.answers.map((answer, answerIndex) => (
                  <div key={answerIndex} className="flex items-center space-x-3">
                    {/* Correct Answer Radio Button */}
                    <div className="flex-shrink-0">
                      <input
                        type="radio"
                        id={`question-${currentQuestion}-answer-${answerIndex}`}
                        name={`question-${currentQuestion}-correct`}
                        checked={questions[currentQuestion]?.solution === answerIndex}
                        onChange={() => handleQuestionChange(currentQuestion, 'solution', answerIndex)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`question-${currentQuestion}-answer-${answerIndex}`}
                        className={`flex items-center justify-center h-8 w-8 rounded-full cursor-pointer ${
                          questions[currentQuestion]?.solution === answerIndex 
                            ? 'bg-brand-green text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
                        }`}
                      >
                        {questions[currentQuestion]?.solution === answerIndex ? (
                          <FaCheck className="h-4 w-4" />
                        ) : (
                          <span>{answerIndex + 1}</span>
                        )}
                      </label>
                    </div>
                    
                    {/* Answer Input */}
                    <div className={`flex-1 rounded-xl overflow-hidden border-2 ${
                      questions[currentQuestion]?.solution === answerIndex 
                        ? 'border-brand-green' 
                        : 'border-gray-300 dark:border-gray-700'
                    }`}>
                      <div className={`py-1 px-3 text-sm ${answerColors[answerIndex]}`}>
                        Option {answerIndex + 1}
                      </div>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => handleAnswerChange(currentQuestion, answerIndex, e.target.value)}
                        placeholder={`Enter answer option ${answerIndex + 1}`}
                        className="w-full p-2 border-0 focus:ring-0 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Timer Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FaClock className="mr-1 text-brand-red" />
                  Answer Time (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={questions[currentQuestion]?.time || 15}
                  onChange={(e) => handleQuestionChange(currentQuestion, 'time', parseInt(e.target.value) || 15)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-800 dark:text-white transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  How long players have to answer the question
                </p>
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FaEye className="mr-1 text-brand-blue" />
                  Question Display Time (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={questions[currentQuestion]?.cooldown || 5}
                  onChange={(e) => handleQuestionChange(currentQuestion, 'cooldown', parseInt(e.target.value) || 5)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-800 dark:text-white transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  How long the question is shown before answers appear
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Save/Navigation Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 rounded-md font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpdateQuiz}
            disabled={saving || !unsavedChanges}
            className={`px-6 py-2 rounded-md font-medium ${
              unsavedChanges 
                ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 inline-block h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Quiz...
              </>
            ) : (
              <>
                <FaSave className="mr-2 inline-block" />
                Save Quiz
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}