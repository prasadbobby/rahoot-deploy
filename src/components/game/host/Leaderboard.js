// src/components/game/host/Leaderboard.js
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

export default function Leaderboard({ players, onNext }) {
  const topPlayers = players.slice(0, 10);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">Leaderboard</h2>
      
      <div className="mb-8">
        {topPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className="flex items-center p-4 mb-2 rounded-lg bg-white dark:bg-gray-700 shadow"
          >
            <div className="flex items-center justify-center w-10 h-10 mr-4">
              {index === 0 ? (
                <FaTrophy className="text-yellow-500 text-2xl" />
              ) : index === 1 ? (
                <FaMedal className="text-gray-400 text-2xl" />
              ) : index === 2 ? (
                <FaAward className="text-yellow-700 text-2xl" />
              ) : (
                <div className="bg-indigo-100 dark:bg-indigo-900 w-8 h-8 rounded-full flex items-center justify-center text-indigo-800 dark:text-indigo-200 font-bold">
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold dark:text-white">{player.username}</h3>
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {player.points.toLocaleString()}
            </div>
          </div>
        ))}
        
        {topPlayers.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No players have scored yet
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}