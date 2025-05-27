import React from 'react';
import { Play, Clock, Brain, Target, Shuffle, Settings as SettingsIcon } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { useQuizSettings } from './Settings';
import { getLearningStats, getDueVocabulary } from '../utils/sm2Algorithm';
import { QuizMode } from './QuizSelection';

interface QuizTabProps {
  onStartQuiz: (mode: QuizMode) => void;
  onSettings: () => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  onStartQuiz,
  onSettings
}) => {
  const { vocabulary, getStats } = useVocabularyManager();
  const quizSettings = useQuizSettings();
  const stats = getLearningStats(vocabulary);

  const quizModes = [
    {
      id: 'due' as QuizMode,
      title: 'Fällige Wiederholungen',
      description: 'Heute zu lernende Vokabeln',
      icon: Clock,
      count: stats.due,
      color: 'bg-blue-600 hover:bg-blue-700',
      disabled: stats.due === 0,
      priority: true
    },
    {
      id: 'new' as QuizMode,
      title: 'Neue Vokabeln',
      description: 'Noch nicht gelernte Begriffe',
      icon: Brain,
      count: stats.new,
      color: 'bg-green-600 hover:bg-green-700',
      disabled: stats.new === 0,
      priority: false
    },
    {
      id: 'review' as QuizMode,
      title: 'Wiederholung',
      description: 'Bereits gelernte Vokabeln üben',
      icon: Target,
      count: stats.review + stats.learning,
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: (stats.review + stats.learning) === 0,
      priority: false
    },
    {
      id: 'random' as QuizMode,
      title: 'Zufällige Auswahl',
      description: 'Gemischte Vokabeln',
      icon: Shuffle,
      count: vocabulary.length,
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: vocabulary.length === 0,
      priority: false
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quiz starten</h1>
          <button
            onClick={onSettings}
            className="p-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Einstellungen"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{getStats().learned}</div>
            <div className="text-sm text-blue-100">Gelernt</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.due}</div>
            <div className="text-sm text-blue-100">Fällig heute</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.mastered}</div>
            <div className="text-sm text-blue-100">Gemeistert</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 p-4"> {/* pb-20 für Tab Bar */}
        
        {/* Aktuelle Einstellungen */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Quiz-Einstellungen
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
          <button
            onClick={onSettings}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            → Einstellungen ändern
          </button>
        </div>

        {/* Quiz Modi */}
        <div className="space-y-4">
          {quizModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => !mode.disabled && onStartQuiz(mode.id)}
                disabled={mode.disabled}
                className={`w-full p-4 rounded-lg border transition-all ${
                  mode.disabled 
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                    : `${mode.color} text-white border-transparent shadow-md hover:shadow-lg transform hover:scale-[1.02]`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-4 ${
                      mode.disabled 
                        ? 'bg-gray-200' 
                        : 'bg-white bg-opacity-20'
                    }`}>
                      <Icon 
                        size={24} 
                        className={mode.disabled ? 'text-gray-400' : 'text-white'} 
                      />
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold text-lg ${
                        mode.disabled ? 'text-gray-500' : 'text-white'
                      }`}>
                        {mode.title}
                      </div>
                      <div className={`text-sm ${
                        mode.disabled ? 'text-gray-400' : 'text-white text-opacity-90'
                      }`}>
                        {mode.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`text-3xl font-bold mr-3 ${
                      mode.disabled ? 'text-gray-400' : 'text-white'
                    }`}>
                      {mode.count}
                    </span>
                    {!mode.disabled && <Play size={20} className="text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empfehlung */}
        {stats.due > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-800 mb-2">
              <Clock className="mr-2" size={16} />
              <span className="font-medium">Empfehlung:</span>
            </div>
            <p className="text-blue-700 text-sm">
              Du hast {stats.due} fällige Vokabeln. Starte am besten mit "Fällige Wiederholungen" 
              für optimales Lernen nach dem SM-2 System.
            </p>
          </div>
        )}

        {/* Leer State */}
        {vocabulary.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Keine Vokabeln vorhanden</h3>
            <p className="text-sm">
              Füge zuerst einige Vokabeln hinzu, um mit dem Quiz zu beginnen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 