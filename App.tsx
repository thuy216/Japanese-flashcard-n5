
import React, { useState, useCallback, useMemo } from 'react';
import { KANA_DATA } from './constants';
import { AppState, KanaChar, KanaGroup, QuizQuestion, QuizResult } from './types';
import Card from './components/Card';
import QuizCard from './components/QuizCard';

// Define Quiz Modes
enum QuizMode {
  HIRAGANA_ONLY = 'HIRAGANA_ONLY',
  KATAKANA_ONLY = 'KATAKANA_ONLY',
  VOCAB_ONLY = 'VOCAB_ONLY',
  KANJI_GRAMMAR = 'KANJI_GRAMMAR',
  FULL_MIX = 'FULL_MIX'
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [activeGroup, setActiveGroup] = useState<KanaGroup>(KanaGroup.HIRAGANA_BASIC);
  const [activeQuizMode, setActiveQuizMode] = useState<string>('');
  
  // Study Mode State (Random vs Ordered)
  const [isOrderedStudy, setIsOrderedStudy] = useState(false);

  // Flashcard State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledDeck, setShuffledDeck] = useState<KanaChar[]>([]);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  
  const [isFinished, setIsFinished] = useState(false);

  // Helper: Shuffle Array
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // --- Flashcard Logic ---

  const selectStudyMode = (ordered: boolean) => {
    setIsOrderedStudy(ordered);
    setAppState(AppState.CATEGORY_SELECT);
  };

  const startStudy = useCallback((group: KanaGroup) => {
    let deck = [...KANA_DATA[group]];
    
    // ONLY shuffle if NOT ordered mode
    if (!isOrderedStudy) {
      deck = shuffleArray(deck);
    }
    
    setActiveGroup(group);
    setShuffledDeck(deck);
    setCurrentIndex(0);
    setIsFinished(false);
    setAppState(AppState.STUDY);
  }, [shuffleArray, isOrderedStudy]);

  const handleNextCard = useCallback(() => {
    if (currentIndex < shuffledDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, shuffledDeck.length]);

  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const restartCurrentGroup = useCallback(() => {
    let deck = [...KANA_DATA[activeGroup]];
    if (!isOrderedStudy) {
      deck = shuffleArray(deck);
    }
    setShuffledDeck(deck);
    setCurrentIndex(0);
    setIsFinished(false);
  }, [activeGroup, shuffleArray, isOrderedStudy]);

  // --- Quiz Logic ---

  const startQuiz = useCallback((mode: QuizMode) => {
    const TARGET_QUESTIONS = 30;
    let sessionTargets: KanaChar[] = [];
    let title = '';

    // Strategy 1: Pool & Pick (For specific categories)
    // Strategy 2: Balanced Mix (For Full Mix)

    if (mode === QuizMode.FULL_MIX) {
      title = 'Thi thử N5 Tổng hợp';
      // Balanced Logic for 30 questions
      const quizDistribution = [
        {
          groups: [KanaGroup.HIRAGANA_BASIC, KanaGroup.HIRAGANA_DAKUTEN, KanaGroup.HIRAGANA_YOON, KanaGroup.SPECIAL_SOUNDS],
          count: 6 // 6 Hiragana
        },
        {
          groups: [KanaGroup.KATAKANA_BASIC, KanaGroup.KATAKANA_DAKUTEN],
          count: 6 // 6 Katakana
        },
        {
          groups: [KanaGroup.N5_KANJI_BASIC, KanaGroup.N5_KANJI_TIME_DIR, KanaGroup.N5_KANJI_SCHOOL_LIFE],
          count: 6 // 6 Kanji
        },
        {
          groups: [KanaGroup.NUMBERS, KanaGroup.DATES, KanaGroup.N5_COUNTERS, KanaGroup.N5_FAMILY_COLORS, KanaGroup.N5_GREETINGS, KanaGroup.N5_PRONOUNS, KanaGroup.N5_ADJECTIVES, KanaGroup.N5_VERBS],
          count: 8 // 8 Vocabulary
        },
        {
          groups: [KanaGroup.N5_PARTICLES],
          count: 4 // 4 Grammar
        }
      ];

      quizDistribution.forEach(category => {
        const categoryItems = category.groups.flatMap(g => KANA_DATA[g] || []);
        const selected = shuffleArray(categoryItems).slice(0, category.count);
        sessionTargets = [...sessionTargets, ...selected];
      });

    } else {
      // Specific Modes Logic
      let targetGroups: KanaGroup[] = [];

      switch (mode) {
        case QuizMode.HIRAGANA_ONLY:
          title = 'Kiểm tra Hiragana';
          targetGroups = [KanaGroup.HIRAGANA_BASIC, KanaGroup.HIRAGANA_DAKUTEN, KanaGroup.HIRAGANA_YOON, KanaGroup.SPECIAL_SOUNDS];
          break;
        case QuizMode.KATAKANA_ONLY:
          title = 'Kiểm tra Katakana';
          targetGroups = [KanaGroup.KATAKANA_BASIC, KanaGroup.KATAKANA_DAKUTEN];
          break;
        case QuizMode.VOCAB_ONLY:
          title = 'Kiểm tra Từ vựng';
          targetGroups = [
            KanaGroup.NUMBERS, KanaGroup.DATES, KanaGroup.N5_COUNTERS, 
            KanaGroup.N5_FAMILY_COLORS, KanaGroup.N5_GREETINGS, 
            KanaGroup.N5_PRONOUNS, KanaGroup.N5_ADJECTIVES, KanaGroup.N5_VERBS
          ];
          break;
        case QuizMode.KANJI_GRAMMAR:
          title = 'Kanji & Ngữ pháp';
          targetGroups = [KanaGroup.N5_KANJI_BASIC, KanaGroup.N5_KANJI_TIME_DIR, KanaGroup.N5_KANJI_SCHOOL_LIFE, KanaGroup.N5_PARTICLES];
          break;
      }

      // Collect all items from target groups
      const allPool = targetGroups.flatMap(g => KANA_DATA[g] || []);
      // Shuffle and take 30
      sessionTargets = shuffleArray(allPool).slice(0, TARGET_QUESTIONS);
    }

    // Shuffle the final list so categories are mixed within the quiz
    sessionTargets = shuffleArray(sessionTargets);

    // Generate Smart Distractors
    const questions: QuizQuestion[] = sessionTargets.map(target => {
      const sourcePool = KANA_DATA[target.group] || [];
      const potentialDistractors = sourcePool.filter(item => item.char !== target.char);
      // Pick 3 distractors from the same context
      const distractors = shuffleArray(potentialDistractors).slice(0, 3);
      const options = shuffleArray([target, ...distractors]);
      return { target, options };
    });

    setQuizQuestions(questions);
    setQuizResults([]);
    setCurrentIndex(0);
    setIsFinished(false);
    setActiveQuizMode(title);
    setAppState(AppState.QUIZ);
  }, [shuffleArray]);

  const handleQuizAnswer = (selectedOption: KanaChar) => {
    const currentQuestion = quizQuestions[currentIndex];
    const isCorrect = selectedOption.char === currentQuestion.target.char;
    
    setQuizResults(prev => [...prev, {
      question: currentQuestion,
      selectedOption: selectedOption,
      isCorrect: isCorrect
    }]);

    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setAppState(AppState.HOME);
  };

  const handleBack = () => {
    if (appState === AppState.STUDY) {
      setAppState(AppState.CATEGORY_SELECT);
    } else {
      setAppState(AppState.HOME);
    }
  };

  // --- Render Helpers ---

  const currentChar = useMemo(() => shuffledDeck[currentIndex], [shuffledDeck, currentIndex]);

  const getResultScore = () => {
    return quizResults.filter(r => r.isCorrect).length;
  };

  // --- HOME SCREEN ---
  if (appState === AppState.HOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-[#fdfbf7] py-10">
        <div className="animate-float mb-6 md:mb-10">
           <div className="flex space-x-2 justify-center mb-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">あ</div>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">ア</div>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-800 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">山</div>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tighter serif-font uppercase">KANA <br/> ZEN MASTER</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl">
          
          {/* QUIZ SECTION (Keep as is) */}
          <div className="sm:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl shadow-lg border border-indigo-100">
            <h3 className="text-sm font-black text-indigo-800 mb-4 uppercase tracking-[0.2em] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Chế độ Luyện Thi (30 Câu)
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => startQuiz(QuizMode.HIRAGANA_ONLY)} className="p-3 bg-white rounded-xl shadow-sm border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all text-left group">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bảng chữ cái</div>
                 <div className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">Hiragana Master</div>
               </button>

               <button onClick={() => startQuiz(QuizMode.KATAKANA_ONLY)} className="p-3 bg-white rounded-xl shadow-sm border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all text-left group">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bảng chữ cái</div>
                 <div className="font-bold text-gray-800 group-hover:text-blue-500 transition-colors">Katakana Master</div>
               </button>

               <button onClick={() => startQuiz(QuizMode.VOCAB_ONLY)} className="p-3 bg-white rounded-xl shadow-sm border border-green-100 hover:border-green-300 hover:shadow-md transition-all text-left group">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">N5 Cơ bản</div>
                 <div className="font-bold text-gray-800 group-hover:text-green-500 transition-colors">Từ vựng Tổng hợp</div>
               </button>

               <button onClick={() => startQuiz(QuizMode.KANJI_GRAMMAR)} className="p-3 bg-white rounded-xl shadow-sm border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left group">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">N5 Nâng cao</div>
                 <div className="font-bold text-gray-800 group-hover:text-purple-500 transition-colors">Kanji & Ngữ pháp</div>
               </button>

               <button onClick={() => startQuiz(QuizMode.FULL_MIX)} className="col-span-2 p-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-between group">
                 <div className="flex flex-col text-left">
                   <span className="font-black uppercase tracking-widest text-sm">Thi Thử N5</span>
                   <span className="text-[10px] opacity-80">Tổng hợp tất cả kiến thức (30 câu)</span>
                 </div>
                 <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                 </div>
               </button>
            </div>
          </div>

          {/* FLASHCARD SECTION START - SPLIT BUTTONS */}
          <div className="sm:col-span-2 mt-4 mb-2">
             <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center">Ôn tập Flashcard</h3>
          </div>

          <button onClick={() => selectStudyMode(true)} className="sm:col-span-2 p-5 bg-white border-2 border-orange-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-orange-300 transition-all group flex items-center justify-between">
             <div className="flex flex-col text-left">
                <span className="font-black text-gray-800 uppercase tracking-widest text-sm group-hover:text-orange-600 transition-colors">Ôn tập theo thứ tự (A-N)</span>
                <span className="text-[10px] text-gray-400 mt-1">Học bảng chữ cái và từ vựng theo danh sách chuẩn</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <span className="font-serif font-bold">A</span>
             </div>
          </button>

          <button onClick={() => selectStudyMode(false)} className="sm:col-span-2 p-5 bg-white border-2 border-blue-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group flex items-center justify-between">
             <div className="flex flex-col text-left">
                <span className="font-black text-gray-800 uppercase tracking-widest text-sm group-hover:text-blue-600 transition-colors">Ôn tập ngẫu nhiên</span>
                <span className="text-[10px] text-gray-400 mt-1">Xáo trộn thẻ để tăng khả năng phản xạ</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </div>
          </button>
          {/* FLASHCARD SECTION END */}

        </div>

        <div className="mt-8 text-[9px] text-gray-300 uppercase tracking-[0.3em] font-bold">Luyện tập mỗi ngày để thành công</div>
      </div>
    );
  }

  // --- CATEGORY SELECT SCREEN ---
  if (appState === AppState.CATEGORY_SELECT) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-4 text-center bg-[#fdfbf7] py-10 animate-in slide-in-from-right duration-300">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <button onClick={handleBack} className="self-start mb-6 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Quay lại</span>
          </button>

          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight mb-2 uppercase">Chọn bộ từ vựng</h1>
          <p className="text-sm text-gray-500 mb-8 font-medium">
             Chế độ: <span className={`font-bold ${isOrderedStudy ? 'text-orange-500' : 'text-blue-500'}`}>{isOrderedStudy ? 'Thứ tự (A-N)' : 'Ngẫu nhiên'}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
             {/* Hiragana */}
             <div className="bg-white p-4 rounded-2xl shadow-md border border-orange-50">
                <h3 className="text-sm font-bold text-orange-600 mb-2 uppercase">Hiragana</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => startStudy(KanaGroup.HIRAGANA_BASIC)} className="py-2 bg-orange-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all">Cơ Bản</button>
                  <button onClick={() => startStudy(KanaGroup.HIRAGANA_DAKUTEN)} className="py-2 bg-gray-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all">Âm Đục</button>
                  <button onClick={() => startStudy(KanaGroup.HIRAGANA_YOON)} className="col-span-2 py-2 bg-orange-400 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all">Âm Ghép</button>
                </div>
              </div>

              {/* Katakana */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-blue-50">
                <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase">Katakana</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => startStudy(KanaGroup.KATAKANA_BASIC)} className="py-2 bg-blue-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Cơ Bản</button>
                  <button onClick={() => startStudy(KanaGroup.KATAKANA_DAKUTEN)} className="py-2 bg-gray-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all">Âm Đục</button>
                  <button onClick={() => startStudy(KanaGroup.SPECIAL_SOUNDS)} className="col-span-2 py-2 bg-blue-400 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all">Đặc biệt</button>
                </div>
              </div>

              {/* N5 Essential Vocabulary */}
              <div className="sm:col-span-2 bg-white p-4 rounded-2xl shadow-md border-2 border-green-50 bg-gradient-to-r from-green-50/30 to-emerald-50/30">
                <h3 className="text-sm font-black text-emerald-800 mb-3 uppercase tracking-widest italic">Từ vựng N5 Cơ Bản</h3>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button onClick={() => startStudy(KanaGroup.N5_GREETINGS)} className="col-span-3 py-3 bg-teal-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow hover:bg-teal-600 transition-all">
                    Chào hỏi & Giao tiếp
                  </button>
                  <button onClick={() => startStudy(KanaGroup.NUMBERS)} className="py-2 bg-emerald-600 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Số Đếm</button>
                  <button onClick={() => startStudy(KanaGroup.DATES)} className="py-2 bg-emerald-600 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Ngày Tháng</button>
                  <button onClick={() => startStudy(KanaGroup.N5_COUNTERS)} className="py-2 bg-emerald-600 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Lượng từ</button>
                </div>
                 <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => startStudy(KanaGroup.N5_FAMILY_COLORS)} className="col-span-3 py-2 bg-emerald-500 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Gia đình & Màu sắc</button>
                  <button onClick={() => startStudy(KanaGroup.N5_ADJECTIVES)} className="py-2 bg-emerald-400 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-500 transition-all">Tính từ</button>
                  <button onClick={() => startStudy(KanaGroup.N5_VERBS)} className="col-span-2 py-2 bg-emerald-400 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-500 transition-all">Động từ</button>
                </div>
              </div>

              {/* Kanji & Grammar */}
               <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-md border border-purple-50 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-purple-600 mb-2 uppercase">Kanji N5</h3>
                    <div className="space-y-2">
                      <button onClick={() => startStudy(KanaGroup.N5_KANJI_BASIC)} className="w-full py-2 bg-purple-600 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow hover:bg-purple-700 transition-all">
                        Bộ Cơ Bản
                      </button>
                      <button onClick={() => startStudy(KanaGroup.N5_KANJI_TIME_DIR)} className="w-full py-2 bg-purple-500 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow hover:bg-purple-600 transition-all">
                        Thời gian
                      </button>
                      <button onClick={() => startStudy(KanaGroup.N5_KANJI_SCHOOL_LIFE)} className="w-full py-2 bg-purple-500 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow hover:bg-purple-600 transition-all">
                        Trường học
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-md border border-red-50 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-red-600 mb-2 uppercase">Ngữ pháp</h3>
                    <button onClick={() => startStudy(KanaGroup.N5_PARTICLES)} className="w-full h-full py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow hover:bg-red-600 transition-all flex items-center justify-center">
                      Trợ từ
                    </button>
                  </div>
               </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULT SCREEN (SHARED) ---
  if (isFinished) {
    const isQuiz = appState === AppState.QUIZ;
    const finalScore = isQuiz ? getResultScore() : 0;
    const totalQ = quizQuestions.length; // Dynamic based on what was actually generated
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-6 text-center bg-[#fdfbf7] animate-in fade-in duration-700 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center pt-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl ${isQuiz ? 'bg-indigo-500' : 'bg-green-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2 serif-font uppercase tracking-tighter">Hoàn thành!</h2>
          
          {isQuiz ? (
             <div className="mb-6 w-full">
               <p className="text-gray-500 text-xs mb-2">{activeQuizMode}</p>
               <div className="text-5xl font-black text-indigo-600 font-serif">{finalScore} / {totalQ}</div>
               <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-6">
                 {finalScore === totalQ ? 'Hoàn hảo! Bạn là cao thủ!' : finalScore >= (totalQ * 0.8) ? 'Rất tốt! Giữ vững phong độ' : 'Cần cố gắng thêm một chút'}
               </p>

               {/* Detailed Results List */}
               <div className="w-full text-left space-y-3 mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Chi tiết kết quả</h3>
                  {quizResults.map((result, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} flex items-start justify-between`}>
                      <div className="flex items-center space-x-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white ${result.isCorrect ? 'bg-green-400' : 'bg-red-400'}`}>
                            {idx + 1}
                         </div>
                         <div>
                            <div className="flex items-baseline space-x-2">
                               <span className="font-bold text-gray-800 text-lg">{result.question.target.char}</span>
                               <span className="text-xs text-gray-500">
                                  ({result.question.target.meaning || result.question.target.romaji})
                               </span>
                            </div>
                            {!result.isCorrect && (
                              <div className="text-[10px] mt-1">
                                <span className="text-red-500 font-bold block">Bạn chọn: {result.selectedOption.meaning || result.selectedOption.romaji}</span>
                              </div>
                            )}
                         </div>
                      </div>
                      {!result.isCorrect && (
                         <div className="text-right">
                           <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Đáp án</span>
                           <div className="text-green-600 font-bold text-sm">
                             {result.question.target.meaning || result.question.target.romaji}
                           </div>
                         </div>
                      )}
                      {result.isCorrect && (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                      )}
                    </div>
                  ))}
               </div>
             </div>
          ) : (
             <p className="text-gray-500 mb-10 text-xs">Bạn đã hoàn thành bộ chữ <strong>{activeGroup}</strong>.</p>
          )}
          
          <div className="flex flex-col space-y-3 w-full max-w-xs pb-10">
            <button 
              onClick={isQuiz ? restartQuiz : restartCurrentGroup} 
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
            >
              {isQuiz ? 'Về trang chủ' : (isOrderedStudy ? 'Học lại từ đầu' : 'Xáo trộn & Học lại')}
            </button>
            <button onClick={() => setAppState(AppState.HOME)} className="w-full py-3 text-gray-400 font-bold uppercase tracking-widest text-[9px]">
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDY/QUIZ CONTAINER ---
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 max-w-lg mx-auto w-full border-b border-gray-50 bg-[#fdfbf7]/90 sticky top-0 z-10 backdrop-blur-sm">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center text-center">
           <h2 className="text-[11px] font-black text-gray-800 tracking-tight serif-font uppercase">
             {appState === AppState.QUIZ ? activeQuizMode : activeGroup}
           </h2>
           <span className={`text-[9px] font-bold uppercase tracking-[0.2em] leading-none mt-1 ${appState === AppState.QUIZ ? 'text-indigo-500' : 'text-orange-500'}`}>
             {currentIndex + 1} / {appState === AppState.QUIZ ? quizQuestions.length : shuffledDeck.length}
           </span>
        </div>

        <div className="w-9"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start max-w-lg mx-auto w-full px-6 pt-6 pb-20">
        <div className="w-full max-w-sm mb-8">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ease-out ${appState === AppState.QUIZ ? 'bg-indigo-500' : 'bg-orange-400'}`}
              style={{ width: `${((currentIndex + 1) / (appState === AppState.QUIZ ? quizQuestions.length : shuffledDeck.length)) * 100}%` }}
            />
          </div>
        </div>

        {appState === AppState.QUIZ ? (
          <QuizCard 
             key={`quiz-${currentIndex}`}
             question={quizQuestions[currentIndex]}
             onAnswer={handleQuizAnswer}
             questionIndex={currentIndex}
             totalQuestions={quizQuestions.length}
          />
        ) : (
          <div key={`study-${activeGroup}-${currentIndex}`} className="w-full animate-in zoom-in-95 duration-500 flex flex-col items-center">
            <Card 
              data={currentChar} 
              onNext={handleNextCard} 
              onPrev={handlePrevCard} 
              currentIndex={currentIndex} 
              total={shuffledDeck.length} 
            />
          </div>
        )}
      </main>

      <footer className="text-center py-4 border-t border-gray-50 bg-white/50 backdrop-blur-sm mt-auto">
        <p className="text-[8px] text-gray-300 uppercase tracking-widest font-bold">Zen Master Kana</p>
      </footer>
    </div>
  );
};

export default App;
