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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{getModeTitle()}</h1>
              <p className="text-sm text-gray-600">
                {currentIndex + 1} von {quizVocabulary.length}
              </p>
            </div>
          </div>
          
          {/* Session Stats */}
          <div className="text-right text-sm">
            <div className="text-gray-600">
              Richtig: {sessionStats.correct}/{sessionStats.total}
            </div>
            <div className="text-blue-600">
              Serie: {sessionStats.streak}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="h-2 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quizVocabulary.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Abfragerichtung Indikator */}
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {currentDirection === 'jp-to-de' && 'Japanisch → Deutsch'}
              {currentDirection === 'de-to-jp' && 'Deutsch → Japanisch'}
              {currentDirection === 'kanji-to-reading' && 'Kanji → Lesung'}
            </span>
          </div>

          {/* Frage */}
          <div className="text-center mb-6">
            {currentDirection === 'jp-to-de' && (
              <>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {currentVocab.kanji}
                </div>
                <div className="text-xl text-gray-700 mb-1">
                  {currentVocab.kana}
                </div>
                <div className="text-sm text-gray-500">
                  {currentVocab.romaji}
                </div>
              </>
            )}
            
            {currentDirection === 'de-to-jp' && (
              <div className="text-2xl font-bold text-gray-900">
                {currentVocab.de}
              </div>
            )}
            
            {currentDirection === 'kanji-to-reading' && (
              <div className="text-4xl font-bold text-gray-900">
                {currentVocab.kanji}
              </div>
            )}
          </div>

          {/* Answer Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">
                {currentDirection === 'jp-to-de' && 'Deutsche Bedeutung:'}
                {currentDirection === 'de-to-jp' && 'Japanische Schreibung:'}
                {currentDirection === 'kanji-to-reading' && 'Lesung:'}
              </h3>
              <button
                onClick={toggleAnswer}
                className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showAnswer ? (
                  <>
                    <EyeOff size={16} className="mr-1" />
                    Verstecken
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-1" />
                    Anzeigen
                  </>
                )}
              </button>
            </div>
            
            <div className="min-h-[60px] flex items-center justify-center">
              {showAnswer ? (
                <div className="text-xl font-medium text-blue-600 text-center">
                  {currentDirection === 'jp-to-de' && currentVocab.de}
                  {currentDirection === 'de-to-jp' && (
                    <>
                      <div className="text-2xl mb-1">{currentVocab.kanji}</div>
                      <div className="text-lg text-gray-700">{currentVocab.kana}</div>
                      <div className="text-sm text-gray-500">{currentVocab.romaji}</div>
                    </>
                  )}
                  {currentDirection === 'kanji-to-reading' && (
                    <>
                      <div className="text-xl mb-1">{currentVocab.kana}</div>
                      <div className="text-lg text-gray-600">{currentVocab.romaji}</div>
                      <div className="text-sm text-gray-500 mt-2">({currentVocab.de})</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  Klicke "Anzeigen" um die Antwort zu sehen
                </div>
              )}
            </div>
          </div>

          {/* SM-2 Info */}
          <div className="border-t pt-4 mt-4">
            <div className="text-xs text-gray-500 text-center">
              Wiederholungen: {currentVocab.sm2.repetitions} • 
              Intervall: {currentVocab.sm2.interval} Tag{currentVocab.sm2.interval !== 1 ? 'e' : ''} • 
              Faktor: {currentVocab.sm2.easeFactor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showAnswer ? (
          <div className="space-y-3">
            <div className="text-center text-sm text-gray-600 mb-4">
              Wie gut kanntest du die Antwort?
            </div>
            
            {/* Quality Rating Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(QUALITY_LABELS).map(([quality, info]) => (
                <button
                  key={quality}
                  onClick={() => handleQualityRating(Number(quality))}
                  className={`p-3 rounded-lg text-white text-sm font-medium transition-colors ${info.color} hover:opacity-90`}
                >
                  <div className="font-bold">{quality} - {info.label}</div>
                  <div className="text-xs opacity-90">{info.description}</div>
                </button>
              ))}
            </div>
            
            {/* Repeat Button */}
            <button
              onClick={repeatCard}
              className="w-full mt-4 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" />
              Nochmal anschauen
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Versuche zuerst die Bedeutung zu erraten, bevor du die Antwort anzeigst.
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