import { VocabularyCard, SM2Data } from '../types/vocabulary';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Initiale SM-2 Daten
const initialSM2Data: SM2Data = {
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  nextReview: null,
  lastReview: null,
  quality: null
};

// CSV-Daten in JSON konvertieren
export const convertCsvToJson = (csvContent: string): VocabularyCard[] => {
  // CSV parsen
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';',
    trim: true
  });

  // In VocabularyCard-Format umwandeln
  return records.map((record: any, index: number) => {
    // Tags aus der vierten Spalte extrahieren und in Array umwandeln
    const tags = record['Tags'] ? record['Tags'].split(',').map((tag: string) => tag.trim()) : [];
    
    // Notizen aus der dritten Spalte
    const notes = record['Notizen'] || '';

    return {
      id: `it-${index + 1}`,
      it: record['Italienisch'],
      de: record['Deutsch'],
      notes: notes,
      tags: tags,
      sm2: { ...initialSM2Data }
    };
  });
};

// JSON-Datei mit Metadaten erstellen
export const createVocabularyJson = (cards: VocabularyCard[]) => {
  const vocabularyData = {
    meta: {
      setId: "it-basic-2024",
      total_cards: cards.length,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      sm2Enabled: true,
      version: "1.0"
    },
    cards: cards
  };

  return vocabularyData;
};

// Hauptfunktion zum Konvertieren und Speichern
export const processCsvFile = (inputPath: string, outputPath: string) => {
  try {
    // CSV-Datei lesen
    const csvContent = fs.readFileSync(inputPath, 'utf-8');
    
    // Konvertieren
    const cards = convertCsvToJson(csvContent);
    const vocabularyData = createVocabularyJson(cards);
    
    // JSON speichern
    fs.writeFileSync(outputPath, JSON.stringify(vocabularyData, null, 2));
    
    console.log(`Konvertierung erfolgreich: ${cards.length} Vokabeln konvertiert`);
    return true;
  } catch (error) {
    console.error('Fehler bei der Konvertierung:', error);
    return false;
  }
}; 