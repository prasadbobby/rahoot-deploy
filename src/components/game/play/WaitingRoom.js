// src/components/game/play/WaitingRoom.js
export default function WaitingRoom({ quiz }) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Waiting for Game to Start</h2>
          
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-200 mb-1">Quiz Details</h3>
            <p className="text-indigo-700 dark:text-indigo-300">{quiz.title}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{quiz.subject}</p>
          </div>
          
          <div className="flex justify-center">
            <div className="animate-bounce bg-indigo-600 p-2 w-10 h-10 ring-1 ring-indigo-300 dark:ring-indigo-700 shadow-lg rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            The host will start the game soon
          </p>
        </div>
      </div>
    );
  }