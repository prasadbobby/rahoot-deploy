// src/components/game/host/Question.js
import { useState, useEffect } from 'react';
import { FaUsers, FaCheck } from 'react-icons/fa';

export default function Question({ 
  question, 
  questionNumber, 
  totalQuestions, 
  playerCount, 
  answeredCount,
  onShowResults 
}) {
  const [timeLeft, setTimeLeft] = useState(question.time);
  const [showingQuestion, setShowingQuestion] = useState(true);

  useEffect(() => {
    if (showingQuestion) {
      const timer = setTimeout(() => {
        setShowingQuestion(false);
      }, question.cooldown * 1000);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onShowResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [question, showingQuestion, onShowResults]);

  useEffect(() => {
    if (answeredCount === playerCount && playerCount > 0 && !showingQuestion) {
      onShowResults();
    }
  }, [answeredCount, playerCount, showingQuestion, onShowResults]);

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-gray-600 dark:text-gray-400 mb-2">
          Question {questionNumber} of {totalQuestions}
        </div>
        <h2 className="text-3xl font-bold mb-6 dark:text-white">
          {question.question}
        </h2>
      </div>

      {showingQuestion ? (
        <div>
          {question.image && (
            <div className="flex justify-center mb-8">
              <img 
                src={question.image} 
                alt="Question" 
                className="max-h-80 rounded-lg shadow-md" 
              />
            </div>
          )}
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full">
            <div 
              className="bg-indigo-600 h-4 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(question.cooldown * 100) / question.cooldown}%`,
                animation: `countdown ${question.cooldown}s linear forwards`
              }}
            ></div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {question.answers.map((answer, index) => (
              <div 
                key={index}
                className={`p-6 rounded-lg text-center text-lg font-medium ${
                  index === 0 ? 'bg-red-500 text-white' :
                  index === 1 ? 'bg-blue-500 text-white' :
                  index === 2 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                {answer}
                {index === question.solution && (
                  <div className="flex justify-center mt-2">
                    <FaCheck className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold dark:text-white">
              {timeLeft} seconds left
            </div>
            <div className="flex items-center text-lg font-medium dark:text-white">
              <FaUsers className="mr-2 text-indigo-600 dark:text-indigo-400" />
              {answeredCount} / {playerCount} answered
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full mt-4">
            <div 
              className="bg-indigo-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft * 100) / question.time}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}