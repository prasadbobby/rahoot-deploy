// src/components/game/play/QuestionPreview.js
import { ANSWERS_COLORS, ANSWERS_ICONS } from '@/constants';

export default function QuestionPreview({ totalAnswers, questionNumber }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-8 dark:text-white">
          Question {questionNumber}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {[...Array(totalAnswers)].map((_, index) => {
            // Get the icon component from the array
            const IconComponent = ANSWERS_ICONS[index];
            
            return (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center shadow-lg ${
                  index === 0 ? 'bg-red-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              >
                {IconComponent && <IconComponent className="h-12 w-12 text-white" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}