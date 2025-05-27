// SM-2 Spaced Repetition Daten
export interface SM2Data {
  easeFactor: number;      // Schwierigkeitsfaktor (Standard: 2.5)
  interval: number;        // Wiederholungsintervall in Tagen
  repetitions: number;     // Anzahl erfolgreicher Wiederholungen
  nextReview: string | null;  // Nächster Wiederholungstermin (ISO-String)
  lastReview: string | null;  // Letzter Wiederholungstermin (ISO-String)
  quality: number | null;     // Letzte Bewertung (0-5)
}

// Einzelne Vokabelkarte
export interface VocabularyCard {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  de: string;
  sm2: SM2Data;
}

// Metadaten der Vokabelsammlung
export interface VocabularyMeta {
  setId: string;
  total_cards: number;
  created: string;
  lastUpdated?: string;
  sm2Enabled?: boolean;
  version?: string;
}

// Komplette Vokabelsammlung
export interface VocabularyData {
  meta: VocabularyMeta;
  cards: VocabularyCard[];
}

// Quiz-Konfiguration
export interface QuizConfig {
  count: number;
  direction: 'jp-de' | 'de-jp' | 'random';
  mode: 'kanji' | 'kana' | 'romaji';
}

// Quiz-Ergebnis
export interface QuizResult {
  vocab: VocabularyCard;
  correct: boolean;
  direction: string;
  mode: string;
  timestamp: string;
}

// App-Zustand
export interface AppState {
  currentView: 'home' | 'quiz' | 'search' | 'add' | 'stats' | 'settings';
  vocabulary: VocabularyCard[];
  loading: boolean;
  error: string | null;
} 