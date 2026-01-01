
export enum AlphabetType {
  HIRAGANA = 'Hiragana',
  KATAKANA = 'Katakana',
  VOCABULARY = 'Vocabulary',
  KANJI = 'Kanji',
  GRAMMAR = 'Grammar',
  PHRASE = 'Mẫu câu / Chào hỏi'
}

export enum KanaGroup {
  HIRAGANA_BASIC = 'Hiragana Cơ Bản',
  HIRAGANA_DAKUTEN = 'Hiragana Âm Đục',
  HIRAGANA_YOON = 'Hiragana Âm Ghép',
  SPECIAL_SOUNDS = 'Âm Ngắt & Trường Âm',
  KATAKANA_BASIC = 'Katakana Cơ Bản',
  KATAKANA_DAKUTEN = 'Katakana Âm Đục',
  ALL_BASIC = 'Tất cả (Cơ bản)',
  NUMBERS = 'Số Đếm',
  DATES = 'Ngày & Tháng',
  N5_PRONOUNS = 'Đại từ & Chỉ thị',
  N5_ADJECTIVES = 'Tính từ N5',
  N5_VERBS = 'Động từ N5',
  N5_KANJI_BASIC = 'Kanji Sơ Cấp (N5)',
  N5_PARTICLES = 'Trợ từ & Ngữ pháp',
  // New Groups
  N5_GREETINGS = 'Chào hỏi & Giao tiếp',
  N5_COUNTERS = 'Đếm đồ vật & Người',
  N5_KANJI_TIME_DIR = 'Kanji Thời gian & Hướng',
  N5_FAMILY_COLORS = 'Gia đình & Màu sắc',
  N5_KANJI_SCHOOL_LIFE = 'Kanji Trường học & Đời sống'
}

export interface KanaChar {
  char: string;
  romaji: string;
  row: string;
  type: AlphabetType;
  group: KanaGroup;
  meaning?: string;
}

export interface QuizQuestion {
  target: KanaChar;
  options: KanaChar[];
}

export interface QuizResult {
  question: QuizQuestion;
  selectedOption: KanaChar;
  isCorrect: boolean;
}

export enum AppState {
  HOME,
  CATEGORY_SELECT, // New state for selecting deck after choosing mode
  STUDY,
  QUIZ
}
