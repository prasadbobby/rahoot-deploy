// src/pages/admin/create.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaPlus, FaTrash, FaImage, FaCheck, FaSave } from 'react-icons/fa';
import { createQuiz } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

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
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast.error('You need at least one question');
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

    setLoading(true);

    try {
      const newQuiz = await createQuiz({
        title,
        subject,
        questions,
        createdBy: user.id,
      });
      
      toast.success('Quiz created successfully!');
      router.push('/admin');
    } catch (error) {
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 font-bold">You don't have permission to access this page</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Create New Quiz</h1>
        <button
          onClick={handleSaveQuiz}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
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
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Question {questionIndex + 1}</h2>
            <button
              onClick={() => handleRemoveQuestion(questionIndex)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <FaTrash />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question Text
            </label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
              placeholder="Enter question"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL (optional)
            </label>
            <div className="flex">
              <input
                type="text"
                value={question.image}
                onChange={(e) => handleQuestionChange(questionIndex, 'image', e.target.value)}
                placeholder="Enter image URL"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-l focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="bg-gray-100 dark:bg-gray-600 p-2 border border-gray-300 dark:border-gray-600 rounded-r">
                <FaImage className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="flex items-center">
                <input
                  type="radio"
                  id={`question-${questionIndex}-answer-${answerIndex}`}
                  name={`question-${questionIndex}-correct`}
                  checked={question.solution === answerIndex}
                  onChange={() => handleQuestionChange(questionIndex, 'solution', answerIndex)}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                  placeholder={`Answer ${answerIndex + 1}`}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                    question.solution === answerIndex
                      ? 'border-green-500 dark:border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Answer Time (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={question.time}
                onChange={(e) => handleQuestionChange(questionIndex, 'time', parseInt(e.target.value) || 15)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question Display Time (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={question.cooldown}
                onChange={(e) => handleQuestionChange(questionIndex, 'cooldown', parseInt(e.target.value) || 5)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              </div>
            </div>
          </div>
        ))}
  
        <div className="flex justify-center mb-8">
          <button
            onClick={handleAddQuestion}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Question
          </button>
        </div>
      </div>
    );
  }