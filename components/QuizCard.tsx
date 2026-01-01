
import React from 'react';
import { KanaChar, QuizQuestion } from '../types';

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (option: KanaChar) => void;
  questionIndex: number;
  totalQuestions: number;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, questionIndex, totalQuestions }) => {
  
  const handleOptionClick = (option: KanaChar) => {
    onAnswer(option);
  };

  const getFontSizeClass = (text: string) => {
    if (text.length > 5) return 'text-[32px]';
    if (text.length > 3) return 'text-[40px]';
    if (text.length > 1) return 'text-[60px]';
    return 'text-[100px]';
  };

  // Determine what text to show on the button (Meaning for Vocab/Kanji, Romaji for Basic Kana)
  const getDisplayText = (item: KanaChar) => {
    if (item.meaning) {
      return item.meaning;
    }
    return item.romaji;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto animate-in zoom-in-95 duration-300">
      {/* Question Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl border border-orange-100 p-8 mb-6 flex flex-col items-center justify-center min-h-[200px]">
        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-2">
          Câu hỏi {questionIndex + 1} / {totalQuestions}
        </span>
        <span className={`${getFontSizeClass(question.target.char)} font-bold text-gray-800 leading-none`}>
          {question.target.char}
        </span>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            className="p-4 rounded-xl border-b-4 font-bold text-sm md:text-base transition-all active:scale-95 min-h-[80px] flex items-center justify-center text-center bg-white hover:bg-orange-50 border-gray-200 text-gray-700 shadow-sm"
          >
            {getDisplayText(option)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizCard;
