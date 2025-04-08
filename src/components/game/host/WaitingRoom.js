// src/components/game/host/WaitingRoom.js
import { useState, useEffect } from 'react';
import { FaUsers, FaPlay, FaTrash } from 'react-icons/fa';

export default function WaitingRoom({ players, quizCode, onStart }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(quizCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Waiting for Players</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Share this code with players to join the game
          </p>
          
          <div className="flex">
            <div className="bg-indigo-600 text-white text-3xl font-bold py-4 px-8 rounded-l-lg flex-grow text-center">
              {quizCode}
            </div>
            <button 
              onClick={copyCodeToClipboard}
              className="bg-indigo-700 hover:bg-indigo-800 text-white py-4 px-4 rounded-r-lg"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          onClick={onStart}
          disabled={players.length === 0}
          className={`w-full py-4 rounded-lg font-bold flex items-center justify-center ${
            players.length === 0 
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <FaPlay className="mr-2" />
          Start Game ({players.length} {players.length === 1 ? 'player' : 'players'})
        </button>
      </div>
      
      <div className="md:w-1/2">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-full">
          <div className="flex items-center mb-4">
            <FaUsers className="text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-xl font-bold dark:text-white">Players ({players.length})</h3>
          </div>
          
          {players.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No players have joined yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {players.map((player) => (
                <div 
                  key={player.id} 
                  className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg"
                >
                  <span className="font-medium dark:text-white">{player.username}</span>
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => socket.emit('manager:kickPlayer', player.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}