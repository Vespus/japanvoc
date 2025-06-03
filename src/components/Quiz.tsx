import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { QuizMode } from './QuizSelection';
import { useQuizSettings, QuizDirection } from './Settings';
import { 
  calculateSM2, 
  getDueVocabulary, 
  sortByPriority, 
  QUALITY_COLORS 
} from '../utils/sm2Algorithm';
import { VocabularyCard } from '../types/vocabulary';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RepeatQuiz } from './RepeatQuiz';

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
  
  // Zentrale States für Quiz-Flow
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<QuizDirection>('jp-to-de');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [repeatQuizState, setRepeatQuizState] = useState<{ show: boolean, vocabs: VocabularyCard[] }>({ show: false, vocabs: [] });
  
  // Statistiken und Ergebnisse
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    maxStreak: 0
  });
  const [results, setResults] = useState<{vocab: VocabularyCard, quality: number}[]>([]);

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

  // Quiz beenden wenn keine Vokabeln vorhanden
  useEffect(() => {
    if (!isLoading && quizVocabulary.length === 0) {
      console.log('⚠️ Keine Quiz-Vokabeln verfügbar, beende Quiz');
      setTimeout(() => onComplete(), 1000);
    }
  }, [isLoading, quizVocabulary.length, onComplete]);

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

  // Antwort bewerten und zur nächsten Vokabel
  const handleQualityRating = (quality: number) => {
    // Sicherheitscheck
    if (!quizVocabulary[currentIndex]) {
      console.error('Keine Vokabel verfügbar für Index:', currentIndex);
      return;
    }

    try {
      // SM-2 Berechnung
      const sm2Result = calculateSM2(quizVocabulary[currentIndex], quality);
      
      // Daten aktualisieren
      updateSM2Data(quizVocabulary[currentIndex].id, {
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
      
      // Ergebnis speichern
      setResults(prev => [...prev, { 
        vocab: quizVocabulary[currentIndex], 
        quality 
      }]);
      
      // Quiz-Ende prüfen
      const isLastCard = currentIndex + 1 >= quizVocabulary.length;
      if (isLastCard) {
        console.log('🎯 Quiz abgeschlossen!');
        setIsQuizComplete(true);
      } else {
        // Zur nächsten Karte
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Fehler bei der Bewertung:', error);
      // Optional: Fehlerbehandlung für den Benutzer
    }
  };

  // Antwort anzeigen/verstecken
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  // Ergebnisbildschirm
  if (isQuizComplete) {
    const qualityCounts = QUALITY_COLORS.map(q => ({
      ...q,
      count: results.filter(r => r.quality === q.value).length
    })).filter(d => d.count > 0);
    
    const wrongVocabsResult = results.filter(r => r.quality < 3).map(r => r.vocab);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-amber-200/80 flex flex-col items-center">
          <h2 className="text-2xl font-light text-stone-800 mb-4">Quiz-Ergebnis</h2>
          <div className="w-full flex flex-col items-center">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={qualityCounts}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {qualityCounts.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.hex} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}x`} />
              </PieChart>
            </ResponsiveContainer>
            {/* Eigene Legende unterhalb des Charts */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {qualityCounts.map((entry, idx) => (
                <div key={entry.label} className="flex items-center space-x-2 text-sm font-light">
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ background: entry.hex }}
                  />
                  <span>{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 w-full text-center">
            <div className="text-lg font-light text-stone-700 mb-2">
              Richtige Antworten: {results.filter(r => r.quality >= 3).length} / {results.length}
            </div>
            {wrongVocabsResult.length > 0 ? (
              <button
                onClick={() => {
                  setRepeatQuizState({ show: true, vocabs: wrongVocabsResult });
                }}
                className="mt-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-2xl shadow-lg font-light text-lg hover:from-rose-600 hover:to-amber-700 transition-all"
              >
                Falsche wiederholen ({wrongVocabsResult.length})
              </button>
            ) : (
              <div className="text-emerald-600 font-light mt-2">Alle Vokabeln richtig! 🎉</div>
            )}
            <button
              onClick={onComplete}
              className="mt-4 px-6 py-3 bg-stone-300 text-stone-700 rounded-2xl shadow font-light text-base hover:bg-stone-400 transition-all"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wiederholungsquiz
  if (repeatQuizState.show) {
    return (
      <RepeatQuiz
        vocabulary={repeatQuizState.vocabs}
        onBack={() => setRepeatQuizState({ show: false, vocabs: [] })}
        onComplete={onComplete}
      />
    );
  }

  // Quiz-Karte
  if (currentIndex < quizVocabulary.length) {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-stone-700 via-amber-800 to-stone-800 text-amber-50 shadow-2xl px-4 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="mr-2 p-2 hover:bg-stone-700/50 rounded-lg transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Zurück"
            >
              <ArrowLeft size={20} className="text-amber-50 opacity-90" />
            </button>
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center space-x-4 text-sm font-light">
                <span className="text-amber-100">{currentIndex + 1} von {quizVocabulary.length}</span>
                <span className="text-amber-100">Richtig: {sessionStats.correct}/{sessionStats.total}</span>
                <span className="text-amber-200">Serie: {sessionStats.streak}</span>
              </div>
            </div>
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

        {/* Quiz Card */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4">
          <div className="bg-gradient-to-br from-amber-25 via-stone-25 to-amber-50 rounded-3xl shadow-2xl p-6 mx-auto w-full max-w-lg border border-amber-100/80 relative" style={{ backgroundColor: '#fefdfb' }}>
            {/* Abfragerichtung Indikator */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-5 py-2 bg-stone-100/80 text-stone-600 text-sm font-light rounded-full border border-stone-200/60 shadow-sm">
                <div className="w-2 h-2 bg-amber-600 rounded-full mr-3 opacity-80"></div>
                {currentDirection === 'jp-to-de' && 'Japanisch → Deutsch'}
                {currentDirection === 'de-to-jp' && 'Deutsch → Japanisch'}
                {currentDirection === 'kanji-to-reading' && 'Kanji → Lesung'}
              </div>
            </div>

            {/* Frage/Auflösung */}
            <div className="flex flex-col items-center justify-center min-h-[120px] mb-4 gap-4">
              {/* Frage */}
              {currentDirection === 'jp-to-de' && (
                <div className="flex flex-row items-end justify-center gap-6">
                  <div className="text-6xl font-extralight text-stone-800 leading-tight" style={{ fontFamily: 'serif' }}>
                    {quizVocabulary[currentIndex].kanji}
                  </div>
                  <div className="flex flex-col items-start justify-center gap-1">
                    <div className="text-2xl text-stone-700 font-light">{quizVocabulary[currentIndex].kana}</div>
                    <div className="text-lg text-stone-500 font-light">{quizVocabulary[currentIndex].romaji}</div>
                  </div>
                </div>
              )}
              {currentDirection === 'de-to-jp' && (
                <div className="text-4xl font-light text-stone-800 leading-tight tracking-wide mb-2">
                  {quizVocabulary[currentIndex].de}
                </div>
              )}
              {currentDirection === 'kanji-to-reading' && (
                <div className="text-7xl font-extralight text-stone-800 leading-tight mb-2" style={{ fontFamily: 'serif' }}>
                  {quizVocabulary[currentIndex].kanji}
                </div>
              )}

              {/* Antwort */}
              {showAnswer && (
                <div className="w-full flex flex-col items-center justify-center mt-2">
                  {currentDirection === 'jp-to-de' && (
                    <div className="text-3xl font-light text-amber-800 tracking-wide bg-amber-50 rounded-xl px-6 py-3 shadow-inner border border-amber-100/60">
                      {quizVocabulary[currentIndex].de}
                    </div>
                  )}
                  {currentDirection === 'de-to-jp' && (
                    <div className="flex flex-row items-end justify-center gap-6 mt-2 bg-amber-50 rounded-xl px-6 py-3 shadow-inner border border-amber-100/60">
                      <div className="text-3xl font-extralight text-stone-800" style={{ fontFamily: 'serif' }}>{quizVocabulary[currentIndex].kanji}</div>
                      <div className="flex flex-col items-start justify-center gap-1">
                        <div className="text-2xl text-stone-700 font-light">{quizVocabulary[currentIndex].kana}</div>
                        <div className="text-lg text-stone-500 font-light">{quizVocabulary[currentIndex].romaji}</div>
                      </div>
                    </div>
                  )}
                  {currentDirection === 'kanji-to-reading' && (
                    <div className="flex flex-col items-center justify-center gap-1 bg-amber-50 rounded-xl px-6 py-3 shadow-inner border border-amber-100/60">
                      <div className="text-3xl font-light text-amber-800 tracking-wide">{quizVocabulary[currentIndex].kana}</div>
                      <div className="text-2xl text-stone-600 font-light">{quizVocabulary[currentIndex].romaji}</div>
                      <div className="text-lg text-stone-500 font-light mt-2">{quizVocabulary[currentIndex].de}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Antwort anzeigen/verstecken Button */}
            <button
              onClick={toggleAnswer}
              className="w-full py-4 px-6 bg-gradient-to-r from-stone-600 to-amber-700 text-amber-50 rounded-2xl hover:from-stone-700 hover:to-amber-800 transition-all duration-500 font-light text-lg shadow-xl min-h-[56px] flex items-center justify-center tracking-wide mb-2"
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

            {/* Antwort-Buttons */}
            {showAnswer && (
              <div className="w-full flex flex-col items-center mt-4">
                <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-3 bg-white/80 rounded-2xl shadow-2xl p-4 border border-amber-200/60">
                  {QUALITY_COLORS.map(q => (
                    <button
                      key={q.value}
                      onClick={() => handleQualityRating(q.value)}
                      className={`min-w-[90px] max-w-[120px] py-3 px-1 rounded-2xl text-white font-light text-center transition-all duration-200 shadow-lg text-[0.98rem] leading-tight ${q.tailwind}`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <span className="block break-words whitespace-pre-line">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-amber-200/80 max-w-xs w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-amber-600 mr-2" />
                <h3 className="text-lg font-light text-stone-800">Quiz beenden?</h3>
              </div>
              <p className="text-stone-600 font-light mb-6 text-center">
                Möchtest du das Quiz wirklich beenden? Dein Fortschritt geht verloren.
              </p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    onComplete();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl font-light hover:from-rose-600 hover:to-amber-700 transition-all"
                >
                  Quiz beenden
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-3 px-4 bg-stone-200 text-stone-700 rounded-xl font-light hover:bg-stone-300 transition-all"
                >
                  Weiterlernen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ladeansicht
  if (isLoading) {
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

  return null;
}; 