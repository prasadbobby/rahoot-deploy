// src/components/game/host/Results.js
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { FaCheck } from 'react-icons/fa';

export default function Results({ question, questionNumber, onNext }) {
  const { socket } = useSocket();
  const [responses, setResponses] = useState({});
  
  useEffect(() => {
    function calculatePercentages(responses) {
      const total = Object.values(responses).reduce((sum, count) => sum + count, 0);
      
      if (total === 0) return {};
      
      const percentages = {};
      for (const [key, value] of Object.entries(responses)) {
        percentages[key] = Math.round((value / total) * 100);
      }
      
      return percentages;
    }
    
    socket.on('game:status', (status) => {
      if (status.name === 'SHOW_RESPONSES') {
        setResponses(status.data.responses || {});
      }
    });
    
    return () => {
      socket.off('game:status');
    };
  }, [socket]);

  const percentages = {};
  const total = Object.values(responses).reduce((sum, count) => sum + count, 0);
  
  if (total > 0) {
    for (const [key, value] of Object.entries(responses)) {
      percentages[key] = Math.round((value / total) * 100);
    }
  }

  return (
    <div>
      <div className="text-center mb-10">
        <div className="text-gray-600 dark:text-gray-400 mb-2">
          Question {questionNumber} Results
        </div>
        <h2 className="text-3xl font-bold mb-6 dark:text-white">
          {question.question}
        </h2>
        
        {question.image && (
          <div className="flex justify-center mb-6">
            <img 
              src={question.image} 
              alt="Question" 
              className="max-h-60 rounded-lg shadow-md" 
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        {question.answers.map((answer, index) => {
          const count = responses[index] || 0;
          const percent = percentages[index] || 0;
          
          return (
            <div key={index} className="flex flex-col">
              <div className={`p-4 rounded-t-lg text-center text-lg font-medium flex items-center justify-between ${
                index === 0 ? 'bg-red-500 text-white' :
                index === 1 ? 'bg-blue-500 text-white' :
                index === 2 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
              }`}>
                <span>{answer}</span>
                {index === question.solution && <FaCheck />}
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-b-lg p-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded">
                  <div
                    className="h-6 bg-indigo-600 rounded"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>{count} {count === 1 ? 'response' : 'responses'}</span>
                  <span>{percent}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          Show Leaderboard
        </button>
      </div>
    </div>
  );
}