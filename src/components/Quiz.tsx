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
  const { vocabulary, updateSM2Data, loading } = useVocabularyManager();
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
    if (!loading && vocabulary.length > 0 && !isInitialized) {
      console.log('🚀 Quiz initialisiert mit', vocabulary.length, 'Vokabeln');
      console.log('⚙️ Quiz-Einstellungen:', quizSettings);
      setIsInitialized(true);
    }
  }, [loading, vocabulary.length, isInitialized, quizSettings]);

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
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz wird vorbereitet...</h2>
          <p className="text-gray-600">Vokabeln werden geladen</p>
        </div>
      </div>
    );
  }

  // Quiz abgeschlossen
  if (!currentVocab) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz abgeschlossen!</h2>
          <p className="text-gray-600">Keine weiteren Vokabeln verfügbar.</p>
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
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-3 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Zurück"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{getModeTitle()}</h1>
              <p className="text-sm text-gray-600">
                {currentIndex + 1} von {quizVocabulary.length}
              </p>
            </div>
          </div>
          
          {/* Quiz beenden Button */}
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors min-h-[44px] font-medium"
          >
            Quiz beenden
          </button>
        </div>
        
        {/* Session Stats */}
        <div className="flex justify-between items-center mt-3 text-sm">
          <div className="text-gray-600">
            Richtig: {sessionStats.correct}/{sessionStats.total}
          </div>
          <div className="text-blue-600 font-medium">
            Serie: {sessionStats.streak}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentIndex + 1) / quizVocabulary.length) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          {Math.round(((currentIndex + 1) / quizVocabulary.length) * 100)}% abgeschlossen
        </div>
      </div>

      {/* Quiz Card - Vollbild optimiert */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mx-auto w-full max-w-lg">
          {/* Abfragerichtung Indikator - Klar als Info-Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {currentDirection === 'jp-to-de' && 'Japanisch → Deutsch'}
              {currentDirection === 'de-to-jp' && 'Deutsch → Japanisch'}
              {currentDirection === 'kanji-to-reading' && 'Kanji → Lesung'}
            </div>
          </div>

          {/* Frage - Prominenter */}
          <div className="text-center mb-12">
            {currentDirection === 'jp-to-de' && (
              <>
                <div className="text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  {currentVocab.kanji}
                </div>
                <div className="text-2xl text-gray-700 mb-2 font-medium">
                  {currentVocab.kana}
                </div>
                <div className="text-lg text-gray-500">
                  {currentVocab.romaji}
                </div>
              </>
            )}
            
            {currentDirection === 'de-to-jp' && (
              <div className="text-4xl font-bold text-gray-900 leading-tight">
                {currentVocab.de}
              </div>
            )}
            
            {currentDirection === 'kanji-to-reading' && (
              <div className="text-7xl font-bold text-gray-900 leading-tight">
                {currentVocab.kanji}
              </div>
            )}
          </div>

          {/* Answer Section - Größer und zentraler */}
          <div className="border-t border-gray-100 pt-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {currentDirection === 'jp-to-de' && 'Deutsche Bedeutung:'}
                {currentDirection === 'de-to-jp' && 'Japanische Schreibung:'}
                {currentDirection === 'kanji-to-reading' && 'Lesung:'}
              </h3>
              
              <button
                onClick={toggleAnswer}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg min-h-[56px] flex items-center justify-center"
              >
                {showAnswer ? (
                  <>
                    <EyeOff size={24} className="mr-3" />
                    Antwort verstecken
                  </>
                ) : (
                  <>
                    <Eye size={24} className="mr-3" />
                    Antwort anzeigen
                  </>
                )}
              </button>
            </div>
            
            <div className="min-h-[120px] flex items-center justify-center bg-gray-50 rounded-2xl p-6">
              {showAnswer ? (
                <div className="text-center">
                  {currentDirection === 'jp-to-de' && (
                    <div className="text-3xl font-bold text-blue-600">{currentVocab.de}</div>
                  )}
                  {currentDirection === 'de-to-jp' && (
                    <>
                      <div className="text-4xl font-bold text-gray-900 mb-3">{currentVocab.kanji}</div>
                      <div className="text-2xl text-gray-700 mb-2">{currentVocab.kana}</div>
                      <div className="text-lg text-gray-500">{currentVocab.romaji}</div>
                    </>
                  )}
                  {currentDirection === 'kanji-to-reading' && (
                    <>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{currentVocab.kana}</div>
                      <div className="text-2xl text-gray-700 mb-3">{currentVocab.romaji}</div>
                      <div className="text-lg text-gray-500">({currentVocab.de})</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-center text-lg">
                  Versuche zuerst die Antwort zu erraten
                </div>
              )}
            </div>
          </div>

          {/* SM-2 Info - Besser lesbar */}
          <div className="border-t border-gray-100 pt-6 mt-8">
            <div className="text-sm text-gray-500 text-center bg-gray-50 rounded-xl p-4">
              <div className="font-medium text-gray-600 mb-1">Lernstatistik</div>
              <div className="space-y-1">
                <div>Wiederholungen: {currentVocab.sm2.repetitions}</div>
                <div>Intervall: {currentVocab.sm2.interval} Tag{currentVocab.sm2.interval !== 1 ? 'e' : ''}</div>
                <div>Schwierigkeit: {currentVocab.sm2.easeFactor.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Touch-optimiert */}
        {showAnswer && (
          <div className="px-6 pb-8">
            <div className="text-center text-lg font-medium text-gray-700 mb-6">
              Wie gut kanntest du die Antwort?
            </div>
            
            {/* Quality Rating Buttons - Größer und touch-freundlicher */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(QUALITY_LABELS).map(([quality, info]) => (
                <button
                  key={quality}
                  onClick={() => handleQualityRating(Number(quality))}
                  className={`p-4 rounded-2xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[80px] ${info.color}`}
                >
                  <div className="text-lg font-bold mb-1">{quality} - {info.label}</div>
                  <div className="text-sm opacity-90">{info.description}</div>
                </button>
              ))}
            </div>
            
            {/* Repeat Button - Größer */}
            <button
              onClick={repeatCard}
              className="w-full py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center font-semibold text-lg min-h-[56px]"
            >
              <RotateCcw size={24} className="mr-3" />
              Nochmal anschauen
            </button>
          </div>
        )}
      </div>

      {/* Quiz Complete Preview */}
      {isLastCard && showAnswer && (
        <div className="fixed bottom-4 left-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          <div className="text-center">
            <div className="font-medium">Letzte Vokabel!</div>
            <div className="text-sm">
              Session: {sessionStats.correct}/{sessionStats.total + 1} richtig • 
              Beste Serie: {sessionStats.maxStreak}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 