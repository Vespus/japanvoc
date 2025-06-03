import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Info, Sparkles } from 'lucide-react';
import { initDB, loadVocabulary, loadFromLocalStorage } from '../utils/storage';
import { KiVocabGenerator } from './KiVocabGenerator';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { useQuizSettings } from '../hooks/useQuizSettings';
import { QuizDirection } from '../types/vocabulary';

interface SettingsProps {
  onBack: () => void;
}

export interface QuizSettings {
  direction: QuizDirection;
  wordsPerQuiz: number;
}

const SETTINGS_KEY = 'japanvoc-settings';

const DEFAULT_SETTINGS: QuizSettings = {
  direction: 'jp-to-de',
  wordsPerQuiz: 20
};

// Debug-Bereich für Speicherstatus
const DebugStorage = () => {
  const [storageInfo, setStorageInfo] = useState<{
    indexedDB: number;
    localStorage: number;
  }>({ indexedDB: 0, localStorage: 0 });

  const checkStorage = async () => {
    try {
      // IndexedDB prüfen
      const db = await initDB();
      const transaction = db.transaction(['vocabulary'], 'readonly');
      const store = transaction.objectStore('vocabulary');
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        setStorageInfo(prev => ({
          ...prev,
          indexedDB: countRequest.result
        }));
      };

      // LocalStorage prüfen
      const backup = localStorage.getItem('japanvoc-backup');
      if (backup) {
        const data = JSON.parse(backup);
        setStorageInfo(prev => ({
          ...prev,
          localStorage: data.length
        }));
      }
    } catch (err) {
      console.error('Fehler beim Prüfen des Speichers:', err);
    }
  };

  useEffect(() => {
    checkStorage();
  }, []);

  return (
    <div className="mt-8 p-4 bg-amber-50 rounded-lg">
      <h3 className="text-lg font-medium text-stone-700 mb-2">Speicherstatus</h3>
      <div className="space-y-2 text-sm text-stone-600">
        <p>IndexedDB: {storageInfo.indexedDB} Vokabeln</p>
        <p>LocalStorage Backup: {storageInfo.localStorage} Vokabeln</p>
        <button
          onClick={checkStorage}
          className="mt-2 px-3 py-1 bg-amber-200 text-stone-700 rounded hover:bg-amber-300"
        >
          Aktualisieren
        </button>
      </div>
    </div>
  );
};

function DebugVocabularyStorage({ onClose }: { onClose: () => void }) {
  const [indexedCount, setIndexedCount] = useState<number | null>(null);
  const [localCount, setLocalCount] = useState<number | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const check = async () => {
    try {
      const indexed = await loadVocabulary();
      setIndexedCount(indexed.length);
      setPreview(indexed.slice(0, 3));
    } catch {
      setIndexedCount(null);
    }
    try {
      const local = loadFromLocalStorage();
      setLocalCount(local ? local.length : 0);
    } catch {
      setLocalCount(null);
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white border border-amber-200 rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-xs relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-amber-100"
          title="Schließen"
        >
          ×
        </button>
        <div className="font-light text-stone-700 mb-2">Speicher-Info</div>
        <div className="text-sm text-stone-600 mb-2">
          IndexedDB: <b>{indexedCount ?? '–'}</b> Vokabeln<br />
          LocalStorage: <b>{localCount ?? '–'}</b> Vokabeln
        </div>
        {preview.length > 0 && (
          <div className="text-xs text-stone-500">
            <div className="mb-1">Vorschau (erste 3):</div>
            <ul className="list-disc ml-5">
              {preview.map((v, i) => (
                <li key={i}>{v.kanji} / {v.kana} – {v.de}</li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={check} className="mt-3 px-3 py-1 bg-amber-200 rounded font-light text-stone-700 hover:bg-amber-300 transition">Aktualisieren</button>
      </div>
    </div>
  );
}

const directionOptions = [
  {
    value: 'it-to-de' as QuizDirection,
    label: 'Italienisch → Deutsch',
    description: 'Italienische Vokabeln werden abgefragt'
  },
  {
    value: 'de-to-it' as QuizDirection,
    label: 'Deutsch → Italienisch',
    description: 'Deutsche Vokabeln werden abgefragt'
  },
  {
    value: 'random' as QuizDirection,
    label: 'Zufällig',
    description: 'Die Richtung wechselt zufällig'
  }
];

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSetting } = useQuizSettings();
  const [showDebug, setShowDebug] = useState(false);
  const [showKiVocab, setShowKiVocab] = useState(false);

  if (showKiVocab) {
    return <KiVocabGenerator onClose={() => setShowKiVocab(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h1 className="text-2xl font-light text-stone-800 mb-6 tracking-wide">Einstellungen</h1>

          {/* Abfragerichtung */}
          <div className="mb-6">
            <label className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Abfragerichtung
            </label>
            <div className="space-y-3">
              {directionOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start p-4 border border-amber-200/60 rounded-2xl cursor-pointer hover:bg-amber-50/50 transition-all duration-300 hover:shadow-md"
                >
                  <input
                    type="radio"
                    name="direction"
                    value={option.value}
                    checked={settings.direction === option.value}
                    onChange={(e) => updateSetting('direction', e.target.value as QuizDirection)}
                    className="mt-1 mr-3 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-light text-stone-800 tracking-wide">{option.label}</div>
                    <div className="text-sm text-stone-600 font-light">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Anzahl Vokabeln pro Quiz */}
          <div className="mb-6">
            <label className="block text-sm font-light text-stone-700 mb-3 tracking-wide">
              Vokabeln pro Quiz
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.wordsPerQuiz}
                onChange={(e) => updateSetting('wordsPerQuiz', parseInt(e.target.value))}
                className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-stone-700 font-light min-w-[3rem] text-center">
                {settings.wordsPerQuiz}
              </span>
            </div>
          </div>

          {/* Zurück Button */}
          <button
            onClick={onBack}
            className="w-full py-3 bg-stone-300 text-stone-700 rounded-2xl shadow font-light text-base hover:bg-stone-400 transition-all"
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook für andere Komponenten um Einstellungen zu laden
export const useQuizSettings = (): QuizSettings => {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
      }
    }
  }, []);

  return settings;
}; 