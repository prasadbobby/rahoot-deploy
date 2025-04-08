// src/components/game/play/AnswerQuestion.js
import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

export default function AnswerQuestion({ question, answers, image, time, onSelectAnswer }) {
  const [timeLeft, setTimeLeft] = useState(time);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSelectAnswer = (index) => {
    if (selectedAnswer !== null) return; // Can only answer once
    setSelectedAnswer(index);
    onSelectAnswer(index);
  };

  const colors = [
    'bg-red-500 hover:bg-red-600',
    'bg-blue-500 hover:bg-blue-600',
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-green-500 hover:bg-green-600'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 dark:text-white text-center">
            {question}
          </h2>
          
          {image && (
            <div className="flex justify-center mb-4">
              <img 
                src={image} 
                alt="Question" 
                className="max-h-48 rounded-lg shadow-md" 
              />
            </div>
          )}
          
          <div className="flex justify-center items-center mb-6">
            <FaClock className="text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-xl font-bold dark:text-white">{timeLeft}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 md:p-6 rounded-lg text-white font-medium text-lg transition-all ${
                colors[index % colors.length]
              } ${
                selectedAnswer === index ? 'ring-4 ring-yellow-400 transform scale-105' : ''
              } ${
                selectedAnswer !== null && selectedAnswer !== index ? 'opacity-70' : ''
              }`}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}