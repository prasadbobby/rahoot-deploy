// src/components/game/host/FinalResults.js
import { useEffect, useState } from 'react';
import { FaTrophy, FaMedal, FaAward, FaDownload } from 'react-icons/fa';
import { fetchResults } from '@/lib/api';
import toast from 'react-hot-toast';

export default function FinalResults({ players, quiz, onReset }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const topPlayers = players.slice(0, 3);

  useEffect(() => {
    async function loadResults() {
      try {
        const resultsData = await fetchResults(quiz.id);
        setResults(resultsData);
      } catch (error) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    
    loadResults();
  }, [quiz.id]);

  const exportResults = () => {
    const csv = [
      ['Username', 'Score', 'Completed At'],
      ...results.map(result => [
        result.username,
        result.score,
        new Date(result.completedAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title}-results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 text-center dark:text-white">Game Over!</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        {quiz.title} - {quiz.subject}
      </p>
      
      {topPlayers.length > 0 ? (
        <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-12">
          {topPlayers[1] && (
            <div className="flex flex-col items-center">
              <FaMedal className="text-gray-400 text-4xl mb-2" />
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg w-full p-4 text-center">
                <div className="font-bold text-xl dark:text-white mb-1">2nd Place</div>
                <div className="text-gray-600 dark:text-gray-400 mb-2">{topPlayers[1].username}</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {topPlayers[1].points.toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {topPlayers[0] && (
            <div className="flex flex-col items-center">
              <FaTrophy className="text-yellow-500 text-5xl mb-2" />
              <div className="bg-indigo-600 text-white rounded-t-lg w-full p-6 text-center">
                <div className="font-bold text-2xl mb-1">1st Place</div>
                <div className="text-indigo-100 mb-3">{topPlayers[0].username}</div>
                <div className="text-3xl font-bold">
                  {topPlayers[0].points.toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {topPlayers[2] && (
            <div className="flex flex-col items-center">
              <FaAward className="text-yellow-700 text-4xl mb-2" />
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg w-full p-4 text-center">
                <div className="font-bold text-xl dark:text-white mb-1">3rd Place</div>
                <div className="text-gray-600 dark:text-gray-400 mb-2">{topPlayers[2].username}</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {topPlayers[2].points.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 mb-8 text-gray-500 dark:text-gray-400">
          No players in this game
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          End Game
        </button>
        
        <button
          onClick={exportResults}
          disabled={loading || results.length === 0}
          className={`px-8 py-3 rounded-lg font-medium flex items-center justify-center ${
            loading || results.length === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <FaDownload className="mr-2" />
          Export Results
        </button>
      </div>
    </div>
  );
}