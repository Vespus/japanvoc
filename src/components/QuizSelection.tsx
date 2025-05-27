import React, { useState } from 'react';
import { ArrowLeft, Play, Info, X, Brain, Clock, Target, Shuffle, Settings as SettingsIcon } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { useQuizSettings } from './Settings';
import { getDueVocabulary, getLearningStats } from '../utils/sm2Algorithm';

interface QuizSelectionProps {
  onBack: () => void;
  onStartQuiz: (mode: QuizMode) => void;
  onSettings?: () => void;
}

export type QuizMode = 'due' | 'new' | 'review' | 'random';

export const QuizSelection: React.FC<QuizSelectionProps> = ({
  onBack,
  onStartQuiz,
  onSettings
}) => {
  const { vocabulary } = useVocabularyManager();
  const quizSettings = useQuizSettings();
  const [showInfo, setShowInfo] = useState(false);
  
  const stats = getLearningStats(vocabulary);
  const dueVocabs = getDueVocabulary(vocabulary);

  const quizModes = [
    {
      id: 'due' as QuizMode,
      title: 'Fällige Wiederholungen',
      description: 'Vokabeln die heute gelernt werden sollten',
      icon: Clock,
      count: stats.due,
      color: 'bg-blue-600 hover:bg-blue-700',
      disabled: stats.due === 0
    },
    {
      id: 'new' as QuizMode,
      title: 'Neue Vokabeln lernen',
      description: 'Noch nicht gelernte Vokabeln',
      icon: Brain,
      count: stats.new,
      color: 'bg-green-600 hover:bg-green-700',
      disabled: stats.new === 0
    },
    {
      id: 'review' as QuizMode,
      title: 'Wiederholung',
      description: 'Bereits gelernte Vokabeln üben',
      icon: Target,
      count: stats.review + stats.learning,
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: (stats.review + stats.learning) === 0
    },
    {
      id: 'random' as QuizMode,
      title: 'Zufällige Auswahl',
      description: 'Gemischte Vokabeln aus allen Kategorien',
      icon: Shuffle,
      count: vocabulary.length,
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: vocabulary.length === 0
    }
  ];

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
            <h1 className="text-xl font-semibold">Quiz starten</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Einstellungen"
              >
                <SettingsIcon size={20} />
              </button>
            )}
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="SM-2 Algorithmus Info"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Lernstatistiken
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.due}</div>
              <div className="text-sm text-gray-600">Fällig heute</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-gray-600">Neue Vokabeln</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
              <div className="text-sm text-gray-600">Gemeistert</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Überfällig</div>
            </div>
          </div>
        </div>

        {/* Aktuelle Einstellungen */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Aktuelle Quiz-Einstellungen
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Abfragerichtung:</span>
              <span className="font-medium">
                {quizSettings.direction === 'jp-to-de' && 'Japanisch → Deutsch'}
                {quizSettings.direction === 'de-to-jp' && 'Deutsch → Japanisch'}
                {quizSettings.direction === 'kanji-to-reading' && 'Kanji → Lesung'}
                {quizSettings.direction === 'random' && 'Zufällig'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vokabeln pro Quiz:</span>
              <span className="font-medium">{quizSettings.wordsPerQuiz}</span>
            </div>
          </div>
          {onSettings && (
            <button
              onClick={onSettings}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              → Einstellungen ändern
            </button>
          )}
        </div>

        {/* Quiz Mode Selection */}
        <div className="space-y-4 max-w-md mx-auto">
          {quizModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => !mode.disabled && onStartQuiz(mode.id)}
                disabled={mode.disabled}
                className={`w-full p-4 rounded-lg shadow-md transition-colors text-white ${
                  mode.disabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : mode.color
                } flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <Icon className="mr-3" size={24} />
                  <div className="text-left">
                    <div className="font-semibold">{mode.title}</div>
                    <div className="text-sm opacity-90">{mode.description}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2">{mode.count}</span>
                  {!mode.disabled && <Play size={20} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Empfehlung */}
        {stats.due > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <div className="flex items-center text-blue-800">
              <Clock className="mr-2" size={16} />
              <span className="font-medium">Empfehlung:</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Du hast {stats.due} fällige Vokabeln. Starte am besten mit "Fällige Wiederholungen" 
              für optimales Lernen nach dem SM-2 System.
            </p>
          </div>
        )}
      </div>

      {/* SM-2 Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">SM-2 Spaced Repetition</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Was ist SM-2?</h4>
                <p>
                  Der SM-2 Algorithmus ist ein wissenschaftlich erprobtes System für optimales Lernen. 
                  Er bestimmt automatisch, wann du eine Vokabel wiederholen solltest, basierend auf 
                  deiner bisherigen Leistung.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Wie funktioniert es?</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Neue Vokabeln werden nach 1 Tag wiederholt</li>
                  <li>Bei richtiger Antwort: nächste Wiederholung nach 6 Tagen</li>
                  <li>Danach werden die Intervalle exponentiell länger</li>
                  <li>Bei falscher Antwort: Intervall wird zurückgesetzt</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bewertungssystem (0-5):</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                    <span><strong>0-2:</strong> Falsche Antworten → Neustart</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span><strong>3:</strong> Richtig mit Mühe → Kurzes Intervall</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span><strong>4:</strong> Richtig nach Zögern → Normales Intervall</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                    <span><strong>5:</strong> Perfekt → Längeres Intervall</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Vorteile:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Maximiert Langzeitgedächtnis</li>
                  <li>Minimiert Lernzeit</li>
                  <li>Passt sich deiner Leistung an</li>
                  <li>Verhindert Vergessen durch optimale Wiederholung</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-blue-800 text-xs">
                  <strong>Tipp:</strong> Sei ehrlich bei der Selbstbewertung! Das System funktioniert 
                  nur optimal, wenn du deine Antworten realistisch bewertest.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 