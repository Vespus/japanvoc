import { useState, useEffect, useCallback } from 'react';
import { VocabularyData, VocabularyCard } from '../types/vocabulary';

const STORAGE_KEY = 'japanvoc-vocabulary';

export const useVocabularyManager = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Laden der Vokabeln (erst LocalStorage, dann JSON-Fallback)
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Versuche zuerst aus LocalStorage zu laden
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setVocabulary(data);
          console.log(`✅ ${data.length} Vokabeln aus LocalStorage geladen`);
          setLoading(false);
          return;
        }
        
        // Fallback: Lade aus JSON-Datei
        const response = await fetch('/japanisch-deutsch-500.json');
        if (!response.ok) {
          throw new Error('Vokabeldaten konnten nicht geladen werden');
        }
        
        const data: VocabularyData = await response.json();
        
        if (!data.cards || !Array.isArray(data.cards)) {
          throw new Error('Ungültiges Datenformat');
        }
        
        setVocabulary(data.cards);
        // Speichere initial in LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.cards));
        console.log(`✅ ${data.cards.length} Vokabeln aus JSON geladen und gespeichert`);
        
      } catch (err) {
        console.error('Fehler beim Laden der Vokabeln:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    };

    loadVocabulary();
  }, []);

  // Speichern in LocalStorage
  const saveToStorage = useCallback((vocabs: VocabularyCard[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabs));
      console.log(`💾 ${vocabs.length} Vokabeln gespeichert`);
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    }
  }, []);

  // Neue Vokabel hinzufügen
  const addVocabulary = useCallback((newVocab: Omit<VocabularyCard, 'id' | 'sm2'>) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const vocabWithDefaults: VocabularyCard = {
      ...newVocab,
      id,
      sm2: {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReview: null,
        lastReview: null,
        quality: null
      }
    };
    
    const updatedVocabs = [...vocabulary, vocabWithDefaults];
    setVocabulary(updatedVocabs);
    saveToStorage(updatedVocabs);
    
    console.log('➕ Neue Vokabel hinzugefügt:', vocabWithDefaults);
    return vocabWithDefaults;
  }, [vocabulary, saveToStorage]);

  // Vokabel bearbeiten
  const updateVocabulary = useCallback((id: string, updates: Partial<Omit<VocabularyCard, 'id'>>) => {
    const updatedVocabs = vocabulary.map(vocab => 
      vocab.id === id 
        ? { ...vocab, ...updates }
        : vocab
    );
    
    setVocabulary(updatedVocabs);
    saveToStorage(updatedVocabs);
    
    console.log('✏️ Vokabel bearbeitet:', id, updates);
    return updatedVocabs.find(v => v.id === id);
  }, [vocabulary, saveToStorage]);

  // Vokabel löschen
  const deleteVocabulary = useCallback((id: string) => {
    const updatedVocabs = vocabulary.filter(vocab => vocab.id !== id);
    setVocabulary(updatedVocabs);
    saveToStorage(updatedVocabs);
    
    console.log('🗑️ Vokabel gelöscht:', id);
    return true;
  }, [vocabulary, saveToStorage]);

  // SM-2 Daten aktualisieren
  const updateSM2Data = useCallback((id: string, sm2Data: Partial<VocabularyCard['sm2']>) => {
    const vocab = vocabulary.find(v => v.id === id);
    if (!vocab) {
      console.error('Vokabel nicht gefunden:', id);
      return null;
    }
    
    return updateVocabulary(id, { 
      sm2: { 
        ...vocab.sm2,
        ...sm2Data 
      } 
    });
  }, [vocabulary, updateVocabulary]);

  // Vokabel nach ID finden
  const getVocabularyById = useCallback((id: string) => {
    return vocabulary.find(vocab => vocab.id === id);
  }, [vocabulary]);

  // Duplikat-Prüfung
  const checkDuplicate = useCallback((kanji: string, kana: string, romaji: string, excludeId?: string) => {
    return vocabulary.some(vocab => 
      vocab.id !== excludeId && (
        vocab.kanji === kanji || 
        vocab.kana === kana || 
        vocab.romaji === romaji
      )
    );
  }, [vocabulary]);

  // Statistiken
  const getStats = useCallback(() => {
    const learned = vocabulary.filter(v => v.sm2.repetitions > 0).length;
    const toReview = vocabulary.filter(v => {
      if (!v.sm2.nextReview) return false;
      return new Date(v.sm2.nextReview) <= new Date();
    }).length;
    
    return {
      total: vocabulary.length,
      learned,
      toReview,
      available: vocabulary.length - learned
    };
  }, [vocabulary]);

  return {
    vocabulary,
    loading,
    error,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    updateSM2Data,
    getVocabularyById,
    checkDuplicate,
    getStats,
    reload: () => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };
}; 