import React, { useState } from 'react';
import { Search, Plus, BookOpen, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { VocabularySearch } from './components/VocabularySearch';
import { AddVocabulary } from './components/AddVocabulary';
import { EditVocabulary } from './components/EditVocabulary';
import { QuizSelection, QuizMode } from './components/QuizSelection';
import { Quiz } from './components/Quiz';
import { Settings } from './components/Settings';
import { useVocabularyManager } from './hooks/useVocabularyManager';
import { VocabularyCard as VocabType } from './types/vocabulary';

type AppView = 'home' | 'search' | 'add' | 'quiz-selection' | 'quiz' | 'stats' | 'settings' | 'edit';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('due');
  const { getStats } = useVocabularyManager();

  // Handler für Vokabel-Aktionen
  const handleEditVocab = (vocab: VocabType) => {
    setEditingVocabId(vocab.id);
    setCurrentView('edit');
  };

  const handleDeleteVocab = (vocab: VocabType) => {
    // Wird direkt in der Suchkomponente über den Manager gehandhabt
    console.log('Lösche Vokabel:', vocab);
  };

  // Navigation Handler
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
  };

  // Render verschiedene Views
  if (currentView === 'search') {
    return (
      <VocabularySearch
        onBack={() => navigateTo('home')}
        onEditVocab={handleEditVocab}
        onDeleteVocab={handleDeleteVocab}
      />
    );
  }

  if (currentView === 'add') {
    return (
      <AddVocabulary
        onBack={() => navigateTo('home')}
        onSuccess={() => {
          // Nach erfolgreichem Hinzufügen zur Suche wechseln
          setTimeout(() => navigateTo('search'), 2000);
        }}
      />
    );
  }

  if (currentView === 'edit' && editingVocabId) {
    return (
      <EditVocabulary
        vocabId={editingVocabId}
        onBack={() => {
          setEditingVocabId(null);
          navigateTo('search');
        }}
        onSuccess={() => {
          // Nach erfolgreichem Bearbeiten zur Suche zurück
          setTimeout(() => {
            setEditingVocabId(null);
            navigateTo('search');
          }, 2000);
        }}
        onDelete={() => {
          setEditingVocabId(null);
          navigateTo('search');
        }}
      />
    );
  }

  if (currentView === 'quiz-selection') {
    return (
      <QuizSelection
        onBack={() => navigateTo('home')}
        onStartQuiz={(mode) => {
          setQuizMode(mode);
          navigateTo('quiz');
        }}
        onSettings={() => navigateTo('settings')}
      />
    );
  }

  if (currentView === 'quiz') {
    return (
      <Quiz
        mode={quizMode}
        onBack={() => navigateTo('quiz-selection')}
        onComplete={() => navigateTo('home')}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <Settings
        onBack={() => navigateTo('home')}
      />
    );
  }

  // Andere Views (Platzhalter für zukünftige Implementierung)
  if (currentView !== 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {currentView === 'stats' && 'Statistiken'}
          </h2>
          <p className="text-gray-600 mb-6">Diese Funktion wird bald implementiert.</p>
          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zurück zum Startbildschirm
          </button>
        </div>
      </div>
    );
  }

  // Startbildschirm
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">
          Japanisch-Deutsch Vokabeltrainer
        </h1>
        <p className="text-blue-100 text-center mt-1">
          500 Vokabeln • Spaced Repetition
        </p>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Dein Fortschritt
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{getStats().learned}</div>
              <div className="text-sm text-gray-600">Gelernt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{getStats().toReview}</div>
              <div className="text-sm text-gray-600">Zu wiederholen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{getStats().available}</div>
              <div className="text-sm text-gray-600">Verfügbar</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          {/* Quiz starten */}
          <button 
            onClick={() => navigateTo('quiz-selection')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-md transition-colors flex items-center justify-between"
          >
            <div className="flex items-center">
              <BookOpen className="mr-3" size={24} />
              <div className="text-left">
                <div className="font-semibold">Quiz starten</div>
                <div className="text-sm text-blue-100">Neue Vokabeln lernen</div>
              </div>
            </div>
            <div className="text-blue-100">→</div>
          </button>

          {/* Vokabeln suchen */}
          <button 
            onClick={() => navigateTo('search')}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-lg shadow-md transition-colors flex items-center justify-between border"
          >
            <div className="flex items-center">
              <Search className="mr-3 text-gray-600" size={24} />
              <div className="text-left">
                <div className="font-semibold">Vokabeln suchen</div>
                <div className="text-sm text-gray-600">Durchsuchen und bearbeiten</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>

          {/* Neue Vokabel hinzufügen */}
          <button 
            onClick={() => navigateTo('add')}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-lg shadow-md transition-colors flex items-center justify-between border"
          >
            <div className="flex items-center">
              <Plus className="mr-3 text-gray-600" size={24} />
              <div className="text-left">
                <div className="font-semibold">Vokabel hinzufügen</div>
                <div className="text-sm text-gray-600">Neue Begriffe erstellen</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>

          {/* Statistiken */}
          <button 
            onClick={() => navigateTo('stats')}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-lg shadow-md transition-colors flex items-center justify-between border"
          >
            <div className="flex items-center">
              <BarChart3 className="mr-3 text-gray-600" size={24} />
              <div className="text-left">
                <div className="font-semibold">Statistiken</div>
                <div className="text-sm text-gray-600">Lernfortschritt anzeigen</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>

          {/* Einstellungen */}
          <button 
            onClick={() => navigateTo('settings')}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-lg shadow-md transition-colors flex items-center justify-between border"
          >
            <div className="flex items-center">
              <SettingsIcon className="mr-3 text-gray-600" size={24} />
              <div className="text-left">
                <div className="font-semibold">Einstellungen</div>
                <div className="text-sm text-gray-600">App konfigurieren</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Spaced Repetition System (SM-2)</p>
          <p className="mt-1">Optimiert für langfristiges Lernen</p>
        </div>
      </main>
    </div>
  );
}

export default App;
