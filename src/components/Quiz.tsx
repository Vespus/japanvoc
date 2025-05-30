import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Eye, EyeOff, RotateCcw, CheckCircle } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { QuizMode } from './QuizSelection';
import { useQuizSettings, QuizDirection } from './Settings';
import { 
  calculateSM2, 
  getDueVocabulary, 
  sortByPriority, 
  QUALITY_LABELS 
} from '../utils/sm2Algorithm';
import { VocabularyCard } from '../types/vocabulary';

interface QuizProps {
  mode: QuizMode;
  onBack: () => void;
  onComplete: () => void;
}

export const Quiz: React.FC<QuizProps> = ({
  mode,
  onBack,
  onComplete
}) => {
  const { vocabulary, updateSM2Data, isLoading } = useVocabularyManager();
  const quizSettings = useQuizSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<QuizDirection>('jp-to-de');
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    maxStreak: 0
  });

  // Vokabeln für das Quiz basierend auf dem Modus filtern
  const quizVocabulary = useMemo(() => {
    console.log(`🎯 Quiz-Modus: ${mode}, Verfügbare Vokabeln: ${vocabulary.length}`);
    
    let filtered: VocabularyCard[] = [];
    
    switch (mode) {
      case 'due':
        filtered = getDueVocabulary(vocabulary);
        console.log(`📅 Fällige Vokabeln: ${filtered.length}`);
        break;
      case 'new':
        filtered = vocabulary.filter(v => v.sm2.repetitions === 0);
        console.log(`🆕 Neue Vokabeln: ${filtered.length}`);
        break;
      case 'review':
        filtered = vocabulary.filter(v => v.sm2.repetitions > 0);
        console.log(`🔄 Review Vokabeln: ${filtered.length}`);
        break;
      case 'random':
        filtered = [...vocabulary];
        console.log(`🎲 Zufällige Vokabeln: ${filtered.length}`);
        break;
    }
    
    // Sortiere nach Priorität (außer bei random)
    if (mode !== 'random') {
      filtered = sortByPriority(filtered);
    } else {
      // Zufällige Reihenfolge
      filtered = filtered.sort(() => Math.random() - 0.5);
    }
    
    // Begrenze auf konfigurierte Anzahl Vokabeln pro Session
    const result = filtered.slice(0, quizSettings.wordsPerQuiz);
    console.log(`✅ Quiz-Vokabeln nach Filterung: ${result.length} (max: ${quizSettings.wordsPerQuiz})`);
    
    return result;
  }, [vocabulary, mode, quizSettings.wordsPerQuiz]);

  const currentVocab = quizVocabulary[currentIndex];
  const isLastCard = currentIndex >= quizVocabulary.length - 1;

  // Initialisierung nach dem Laden der Daten
  useEffect(() => {
    if (!isLoading && vocabulary.length > 0 && !isInitialized) {
      console.log('🚀 Quiz initialisiert mit', vocabulary.length, 'Vokabeln');
      console.log('⚙️ Quiz-Einstellungen:', quizSettings);
      setIsInitialized(true);
    }
  }, [isLoading, vocabulary.length, isInitialized, quizSettings]);

  // Abfragerichtung für aktuelle Vokabel bestimmen
  useEffect(() => {
    if (quizSettings.direction === 'random') {
      const directions: QuizDirection[] = ['jp-to-de', 'de-to-jp', 'kanji-to-reading'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setCurrentDirection(randomDirection);
    } else {
      setCurrentDirection(quizSettings.direction);
    }
  }, [currentIndex, quizSettings.direction]);

  // Quiz beenden wenn keine Vokabeln vorhanden (aber erst nach Initialisierung)
  useEffect(() => {
    if (isInitialized && quizVocabulary.length === 0) {
      console.log('⚠️ Keine Quiz-Vokabeln verfügbar, beende Quiz');
      setTimeout(() => onComplete(), 1000); // Kurze Verzögerung für bessere UX
    }
  }, [isInitialized, quizVocabulary.length, onComplete]);

  // Antwort bewerten und zur nächsten Vokabel
  const handleQualityRating = (quality: number) => {
    if (!currentVocab) return;
    
    // SM-2 Berechnung
    const sm2Result = calculateSM2(currentVocab, quality);
    
    // Daten aktualisieren
    updateSM2Data(currentVocab.id, {
      ...sm2Result,
      quality
    });
    
    // Session-Statistiken aktualisieren
    const isCorrect = quality >= 3;
    setSessionStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak)
      };
    });
    
    // Zur nächsten Karte oder Quiz beenden
    if (isLastCard) {
      setTimeout(() => onComplete(), 1000);
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  // Antwort anzeigen/verstecken
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  // Karte wiederholen (ohne SM-2 Update)
  const repeatCard = () => {
    setShowAnswer(false);
  };

  // Ladeansicht während Initialisierung
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-light text-stone-800 mb-2 tracking-wide">Quiz wird vorbereitet...</h2>
          <p className="text-stone-600 font-light">Vokabeln werden geladen</p>
        </div>
      </div>
    );
  }

  // Quiz abgeschlossen
  if (!currentVocab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 text-teal-600" size={64} />
          <h2 className="text-2xl font-light text-stone-800 mb-2 tracking-wide">Quiz abgeschlossen!</h2>
          <p className="text-stone-600 font-light">Keine weiteren Vokabeln verfügbar.</p>
        </div>
      </div>
    );
  }

  const getModeTitle = () => {
    switch (mode) {
      case 'due': return 'Fällige Wiederholungen';
      case 'new': return 'Neue Vokabeln';
      case 'review': return 'Wiederholung';
      case 'random': return 'Zufällige Auswahl';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-700 via-amber-800 to-stone-800 text-amber-50 shadow-2xl px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Kompakter Zurück-Pfeil */}
          <button
            onClick={onBack}
            className="mr-2 p-2 hover:bg-stone-700/50 rounded-lg transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Zurück"
          >
            <ArrowLeft size={20} className="text-amber-50 opacity-90" />
          </button>
          {/* Fortschritt + Statistiken in einer Zeile */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center space-x-4 text-sm font-light">
              <span className="text-amber-100">{currentIndex + 1} von {quizVocabulary.length}</span>
              <span className="text-amber-100">Richtig: {sessionStats.correct}/{sessionStats.total}</span>
              <span className="text-amber-200">Serie: {sessionStats.streak}</span>
            </div>
          </div>
          {/* Platzhalter für zentrierten Header */}
          <div style={{ width: 36 }} />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-amber-200/60 px-4 py-2">
        <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-stone-700 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentIndex + 1) / quizVocabulary.length) * 100}%` }}
          />
        </div>
        <div className="text-xs text-stone-500 text-center mt-1 font-light">
          {Math.round(((currentIndex + 1) / quizVocabulary.length) * 100)}% abgeschlossen
        </div>
      </div>

      {/* Quiz Card - Vollbild optimiert */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4">
        <div className="bg-gradient-to-br from-amber-25 via-stone-25 to-amber-50 rounded-3xl shadow-2xl p-6 mx-auto w-full max-w-lg border border-amber-100/80" style={{ backgroundColor: '#fefdfb' }}>
          {/* Abfragerichtung Indikator - Klar als Info-Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-5 py-2 bg-stone-100/80 text-stone-600 text-sm font-light rounded-full border border-stone-200/60 shadow-sm">
              <div className="w-2 h-2 bg-amber-600 rounded-full mr-3 opacity-80"></div>
              {currentDirection === 'jp-to-de' && 'Japanisch → Deutsch'}
              {currentDirection === 'de-to-jp' && 'Deutsch → Japanisch'}
              {currentDirection === 'kanji-to-reading' && 'Kanji → Lesung'}
            </div>
          </div>

          {/* Frage - Prominenter */}
          <div className="text-center mb-6">
            {currentDirection === 'jp-to-de' && (
              <div className="flex flex-row items-end justify-center gap-6">
                <div className="text-6xl font-extralight text-stone-800 leading-tight" style={{ fontFamily: 'serif' }}>
                  {currentVocab.kanji}
                </div>
                <div className="flex flex-col items-start justify-center gap-1">
                  <div className="text-2xl text-stone-700 font-light">{currentVocab.kana}</div>
                  <div className="text-lg text-stone-500 font-light">{currentVocab.romaji}</div>
                </div>
              </div>
            )}
            {currentDirection === 'de-to-jp' && (
              <>
                <div className="text-4xl font-light text-stone-800 leading-tight tracking-wide mb-2">
                  {currentVocab.de}
                </div>
                {showAnswer && (
                  <div className="flex flex-row items-end justify-center gap-6 mt-2">
                    <div className="text-3xl font-extralight text-stone-800" style={{ fontFamily: 'serif' }}>{currentVocab.kanji}</div>
                    <div className="flex flex-col items-start justify-center gap-1">
                      <div className="text-2xl text-stone-700 font-light">{currentVocab.kana}</div>
                      <div className="text-lg text-stone-500 font-light">{currentVocab.romaji}</div>
                    </div>
                  </div>
                )}
              </>
            )}
            {currentDirection === 'kanji-to-reading' && (
              <>
                <div className="text-7xl font-extralight text-stone-800 leading-tight mb-2" style={{ fontFamily: 'serif' }}>
                  {currentVocab.kanji}
                </div>
                {showAnswer && (
                  <div className="flex flex-row items-end justify-center gap-6 mt-2">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="text-3xl font-light text-amber-800 tracking-wide">{currentVocab.kana}</div>
                      <div className="text-2xl text-stone-600 font-light">{currentVocab.romaji}</div>
                      <div className="text-lg text-stone-500 font-light mt-2">{currentVocab.de}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Answer Section - Größer und zentraler */}
          <div className="border-t border-amber-200/60 pt-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-light text-stone-700 mb-4 tracking-wide">
                {currentDirection === 'jp-to-de' && 'Deutsche Bedeutung:'}
                {currentDirection === 'de-to-jp' && 'Japanische Schreibung:'}
                {currentDirection === 'kanji-to-reading' && 'Lesung:'}
              </h3>
              
              <button
                onClick={toggleAnswer}
                className="w-full py-4 px-6 bg-gradient-to-r from-stone-600 to-amber-700 text-amber-50 rounded-2xl hover:from-stone-700 hover:to-amber-800 transition-all duration-500 font-light text-lg shadow-xl min-h-[56px] flex items-center justify-center tracking-wide"
              >
                {showAnswer ? (
                  <>
                    <EyeOff size={22} className="mr-3 opacity-90" />
                    Antwort verstecken
                  </>
                ) : (
                  <>
                    <Eye size={22} className="mr-3 opacity-90" />
                    Antwort anzeigen
                  </>
                )}
              </button>
            </div>
            
            <div className="min-h-[120px] flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl p-6 border border-amber-100/60 shadow-inner">
              {showAnswer ? (
                <div className="text-center">
                  {currentDirection === 'jp-to-de' && (
                    <div className="text-3xl font-light text-amber-800 tracking-wide">{currentVocab.de}</div>
                  )}
                  {currentDirection === 'de-to-jp' && (
                    <>
                      <div className="text-4xl font-light text-stone-800 mb-3" style={{ fontFamily: 'serif' }}>{currentVocab.kanji}</div>
                      <div className="text-2xl text-stone-700 mb-2 font-light">{currentVocab.kana}</div>
                      <div className="text-lg text-stone-500 font-light">{currentVocab.romaji}</div>
                    </>
                  )}
                  {currentDirection === 'kanji-to-reading' && (
                    <></>
                  )}
                </div>
              ) : (
                <div className="text-stone-400 text-center text-lg font-extralight tracking-wide">
                  Versuche zuerst die Antwort zu erraten
                </div>
              )}
            </div>
          </div>

          {/* SM-2 Info - Besser lesbar */}
          <div className="border-t border-amber-200/60 pt-6 mt-8">
            <div className="text-sm text-stone-500 text-center bg-gradient-to-br from-amber-50 to-stone-100 rounded-xl p-4 border border-amber-200/50">
              <div className="font-light text-stone-600 mb-2 tracking-wide">Lernstatistik</div>
              <div className="space-y-1 font-light">
                <div>Wiederholungen: {currentVocab.sm2.repetitions}</div>
                <div>Intervall: {currentVocab.sm2.interval} Tag{currentVocab.sm2.interval !== 1 ? 'e' : ''}</div>
                <div>Schwierigkeit: {currentVocab.sm2.easeFactor.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Touch-optimiert */}
        {showAnswer && (
          <div className="fixed bottom-0 left-0 right-0 pb-4 flex flex-col items-center z-40">
            <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-3 bg-white/80 rounded-2xl shadow-2xl p-4 border border-amber-200/60">
              {QUALITY_LABELS.map(q => (
                <button
                  key={q.value}
                  onClick={() => handleQualityRating(q.value)}
                  className={`min-w-[90px] max-w-[120px] py-3 px-1 rounded-2xl text-white font-light text-center transition-all duration-200 shadow-lg text-[0.98rem] leading-tight ${q.color}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="block break-words whitespace-pre-line">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Complete Preview */}
      {isLastCard && showAnswer && (
        <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-teal-100 to-emerald-100 border border-teal-300/60 text-teal-800 px-4 py-3 rounded-2xl max-w-md mx-auto shadow-lg">
          <div className="text-center">
            <div className="font-light tracking-wide">Letzte Vokabel!</div>
            <div className="text-sm font-light">
              Session: {sessionStats.correct}/{sessionStats.total + 1} richtig • 
              Beste Serie: {sessionStats.maxStreak}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 