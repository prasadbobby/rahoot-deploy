// src/components/game/play/GameOver.js
import { FaTrophy, FaArrowRight } from 'react-icons/fa';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function GameOver({ subject, topPlayers, playerPoints, totalQuestions, onReturn }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const isInTopThree = topPlayers.some(player => player.id === user?.id);

  return (
    <div className="max-w-lg mx-auto relative">
      {showConfetti && <Confetti />}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <h2 className="text-3xl font-bold mb-2 dark:text-white">Game Over!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{subject}</p>
        
        <div className="mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4 mb-6">
            <div className="text-lg font-medium text-indigo-800 dark:text-indigo-200">Your Score</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(playerPoints)}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Possible</div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">
                {totalQuestions * 1000}
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">
                {Math.round((playerPoints / (totalQuestions * 1000)) * 100)}%
              </div>
            </div>
          </div>
        </div>
        
        {topPlayers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center justify-center">
              <FaTrophy className="text-yellow-500 mr-2" />
              Top Players
            </h3>
            
            <div className="space-y-3">
              {topPlayers.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex items-center p-3 rounded-lg ${
                    player.id === user?.id
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-grow font-medium dark:text-white">
                    {player.username} {player.id === user?.id && '(You)'}
                  </div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(player.points)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={onReturn}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center mx-auto"
        >
          Return to Dashboard
          <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
}