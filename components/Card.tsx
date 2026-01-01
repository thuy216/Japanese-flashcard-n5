
import React, { useState, useEffect } from 'react';
import { KanaChar, AlphabetType } from '../types';

interface CardProps {
  data: KanaChar;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  total: number;
}

const Card: React.FC<CardProps> = ({ data, onNext, onPrev, currentIndex, total }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [data]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(data.char);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.5; // Slower speed
    window.speechSynthesis.speak(utterance);
  };

  const isLastCard = currentIndex === total - 1;

  // Dynamic font size calculation
  const getFontSizeClass = (text: string) => {
    if (text.length > 5) return 'text-[32px]';
    if (text.length > 3) return 'text-[50px]';
    if (text.length > 1) return 'text-[80px]';
    return 'text-[120px]';
  };

  const getRomajiLabel = () => {
    if (data.type === AlphabetType.KANJI) return "On / Kun";
    if (data.type === AlphabetType.GRAMMAR) return "Cách đọc";
    return "Romaji";
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <div
        className={`card-flip-container w-full h-[320px] cursor-pointer ${isFlipped ? 'card-flipped' : ''} mb-6`}
        onClick={handleFlip}
      >
        <div className="card-flip-inner shadow-xl rounded-3xl relative">

          {/* Front Face - Added flex properties explicitly */}
          <div className="card-front bg-white border border-orange-100 flex flex-col items-center justify-center p-4 overflow-hidden group">
            <button
              onClick={handlePlayAudio}
              className="absolute top-4 right-4 p-2 rounded-full bg-orange-100/50 text-orange-500 hover:bg-orange-200 hover:scale-110 transition-all z-10"
              title="Phát âm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <span className={`${getFontSizeClass(data.char)} font-bold text-gray-800 leading-none flex-1 flex items-center justify-center`}>
              {data.char}
            </span>
            <p className="absolute bottom-4 text-gray-300 text-[10px] uppercase tracking-widest font-bold w-full text-center">Chạm để lật</p>
          </div>

          {/* Back Face - Added flex properties explicitly */}
          <div className="card-back bg-orange-50 border border-orange-200 flex flex-col items-center p-4">
            <button
              onClick={handlePlayAudio}
              className="absolute top-4 right-4 p-2 rounded-full bg-orange-200/50 text-orange-600 hover:bg-orange-300 hover:scale-110 transition-all z-10"
              title="Phát âm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <span className="text-xl text-orange-400 font-bold mb-2 uppercase tracking-widest mt-2">{getRomajiLabel()}</span>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <span className={`${data.romaji.length > 15 ? 'text-2xl' : data.romaji.length > 10 ? 'text-3xl' : 'text-4xl'} font-bold text-gray-800 serif-font leading-tight mb-2 text-center`}>
                {data.romaji}
              </span>

              {/* Meaning Section */}
              {data.meaning && (
                <div className="mt-2 bg-orange-100/60 px-4 py-2 rounded-xl">
                  <span className="text-lg text-orange-800 font-bold font-sans text-center">
                    {data.meaning}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center justify-center space-x-2 text-orange-800 bg-orange-200/50 px-4 py-1.5 rounded-full absolute bottom-4 left-1/2 transform -translate-x-1/2 w-max">
              <span className="text-[9px] font-bold uppercase tracking-widest">Nhấn để xem lại chữ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          disabled={currentIndex === 0}
          className="p-3.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className={`px-8 py-3.5 rounded-full font-bold shadow-md transition-all uppercase tracking-[0.15em] text-xs flex items-center ${isLastCard ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-black text-white'}`}
        >
          {isLastCard ? 'Hoàn thành' : 'Tiếp theo'}
          {!isLastCard && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Card;
