import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaPlus, FaTrash, FaImage, FaSave, FaArrowLeft, FaCheck, FaClock, FaEye, FaAngleLeft, FaAngleRight, FaQuestionCircle } from 'react-icons/fa';
import { createQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';


export default function CreateQuiz() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([
    {
      question: '',
      answers: ['', '', '', ''],
      solution: 0,
      image: '',
      time: 15,
      cooldown: 5,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Quiz Info, 1 = Questions
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        answers: ['', '', '', ''],
        solution: 0,
        image: '',
        time: 15,
        cooldown: 5,
      }
    ]);
    // Switch to the new question
    setCurrentQuestion(questions.length);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      
      // Adjust currentQuestion if necessary
      if (currentQuestion >= newQuestions.length) {
        setCurrentQuestion(newQuestions.length - 1);
      }
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
  };

  const handleAnswerChange = (questionIndex, answerIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSaveQuiz = async () => {
    if (!title) {
      toast.error('Please enter a quiz title', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    if (!subject) {
      toast.error('Please enter a subject', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    const invalidQuestions = questions.some(q => 
      !q.question || q.answers.some(a => !a) || q.time <= 0 || q.cooldown <= 0
    );

    if (invalidQuestions) {
      toast.error('Please fill in all question fields', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    setLoading(true);

    try {
      const newQuiz = await createQuiz({
        title,
        subject,
        questions,
        createdBy: user.id,
      });
      
      toast.success('Quiz created successfully!', {
        icon: '🎉',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      router.push('/admin');
    } catch (error) {
      toast.error('Failed to create quiz', {
        icon: '❌',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } finally {
      setLoading(false);
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

  if (!user || !isAdmin) {
    return (
      <div className="pt-28 text-center py-10">
        <div className="card max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="inline-block p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500">
              <FaExclamationCircle className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Access Denied</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin')}
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              aria-label="Back to dashboard"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold">Create New Quiz</h1>
          </div>
          
          <button
            onClick={handleSaveQuiz}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Quiz
              </>
            )}
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div 
              className={`flex items-center justify-center h-10 w-10 rounded-full ${
                currentStep === 0 ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
              } text-lg font-bold`}
            >
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              currentStep > 0 ? 'bg-brand-red' : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
            <div 
              className={`flex items-center justify-center h-10 w-10 rounded-full ${
                currentStep === 1 ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
              } text-lg font-bold`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${currentStep === 0 ? 'text-brand-red font-bold' : 'text-gray-500'}`}>Quiz Information</span>
            <span className={`text-sm ${currentStep === 1 ? 'text-brand-red font-bold' : 'text-gray-500'}`}>Questions</span>
          </div>
        </div>

        {currentStep === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            <h2 className="text-xl font-bold mb-6">Quiz Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title for your quiz"
                  className="input"
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
                  placeholder="Enter the quiz subject"
                  className="input"
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setCurrentStep(1)} 
                  className="btn-primary"
                  disabled={!title || !subject}
                >
                  Continue to Questions
                  <FaAngleRight className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentStep(0)}
                className="btn bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FaAngleLeft className="mr-2" />
                Back to Quiz Info
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevQuestion}
                  disabled={currentQuestion === 0}
                  className="btn bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaAngleLeft />
                </button>
                <span className="text-sm font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <button
                  onClick={goToNextQuestion}
                  className="btn bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FaAngleRight />
                </button>
              </div>
              
              <button
                onClick={handleAddQuestion}
                className="btn btn-secondary"
              >
                <FaPlus className="mr-2" />
                Add Question
              </button>
            </div>
            
            <motion.div 
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <div className="bg-brand-red text-white h-8 w-8 rounded-full flex items-center justify-center mr-2">
                    {currentQuestion + 1}
                  </div>
                  Question {currentQuestion + 1}
                </h2>
                
                {questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(currentQuestion)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Remove question"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  value={questions[currentQuestion].question}
                  onChange={(e) => handleQuestionChange(currentQuestion, 'question', e.target.value)}
                  placeholder="Enter your question"
                  className="input"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL (optional)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={questions[currentQuestion].image}
                    onChange={(e) => handleQuestionChange(currentQuestion, 'image', e.target.value)}
                    placeholder="Enter image URL"
                    className="input rounded-r-none"
                  />
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 border-2 border-l-0 border-gray-300 dark:border-gray-700 rounded-r-xl flex items-center">
                    <FaImage className="text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                {questions[currentQuestion].image && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Image Preview:</p>
                    <div className="flex justify-center">
                      <img src={questions[currentQuestion].image} alt="Preview" className="max-h-40 rounded-lg" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Answer Options
                  </label>
                  <span className="text-sm text-gray-500">Select the correct answer</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestion].answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center space-x-3">
                      <div>
                        <input
                          type="radio"
                          id={`question-${currentQuestion}-answer-${answerIndex}`}
                          name={`question-${currentQuestion}-correct`}
                          checked={questions[currentQuestion].solution === answerIndex}
                          onChange={() => handleQuestionChange(currentQuestion, 'solution', answerIndex)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`question-${currentQuestion}-answer-${answerIndex}`}
                          className={`flex items-center justify-center h-8 w-8 rounded-full cursor-pointer ${
                            questions[currentQuestion].solution === answerIndex 
                              ? 'bg-brand-green text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
                          }`}
                        >
                          {questions[currentQuestion].solution === answerIndex ? (
                            <FaCheck className="h-4 w-4" />
                          ) : (
                            <span>{answerIndex + 1}</span>
                          )}
                        </label>
                      </div>
                      
                      <div className={`flex-1 rounded-xl overflow-hidden border-2 ${
                        questions[currentQuestion].solution === answerIndex 
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
                          className="w-full p-2 border-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaClock className="mr-1" />
                    Answer Time (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={questions[currentQuestion].time}
                    onChange={(e) => handleQuestionChange(currentQuestion, 'time', parseInt(e.target.value) || 15)}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    How long players have to answer the question
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaEye className="mr-1" />
                    Question Display Time (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={questions[currentQuestion].cooldown}
                    onChange={(e) => handleQuestionChange(currentQuestion, 'cooldown', parseInt(e.target.value) || 5)}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    How long the question is shown before answers appear
                  </p>
                </div>
              </div>
            </motion.div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveQuiz}
                disabled={loading}
                className="btn-primary btn-lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Quiz...
                  </span>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}