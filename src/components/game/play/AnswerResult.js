// src/components/game/play/AnswerResult.js
import { FaCheck, FaTimes, FaTrophy } from 'react-icons/fa';

export default function AnswerResult({ 
  correct, 
  message, 
  points, 
  totalPoints, 
  rank, 
  aheadPlayer 
}) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <div className="mb-6">
          {correct ? (
            <div className="mx-auto bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <FaCheck className="text-green-600 text-4xl" />
            </div>
          ) : (
            <div className="mx-auto bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <FaTimes className="text-red-600 text-4xl" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold dark:text-white">
            {message}
          </h2>
          
          {correct && (
            <div className="mt-4 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 inline-block px-6 py-2 rounded-full font-bold text-xl">
              +{Math.round(points)} points
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <FaTrophy className="text-yellow-500 mr-2" />
            <span className="text-lg font-medium dark:text-white">Your Rank: {rank}</span>
          </div>
          
          <div className="text-gray-600 dark:text-gray-400">
            {aheadPlayer ? `${aheadPlayer} is ahead of you` : 'You are in the lead!'}
          </div>
        </div>
        
        <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round(totalPoints)}
          </div>
        </div>
      </div>
    </div>
  );
}