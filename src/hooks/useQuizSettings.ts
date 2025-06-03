import { useState, useEffect } from 'react';
import { QuizDirection } from '../types/vocabulary';

const SETTINGS_KEY = 'quiz-settings';

export interface QuizSettings {
  direction: QuizDirection;
  wordsPerQuiz: number;
}

const DEFAULT_SETTINGS: QuizSettings = {
  direction: 'it-to-de',
  wordsPerQuiz: 10
};

export const useQuizSettings = () => {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);

  // Einstellungen laden
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

  // Einstellungen aktualisieren
  const updateSetting = <K extends keyof QuizSettings>(
    key: K,
    value: QuizSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  return {
    settings,
    updateSetting
  };
}; 