import { VocabularyCard } from '../types/vocabulary';

const DB_NAME = 'japanvoc-db';
const DB_VERSION = 1;
const STORE_NAME = 'vocabulary';

// Datenbank initialisieren
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Fehler beim Öffnen der Datenbank');
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('✅ Datenbank erfolgreich geöffnet');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('kanji', 'kanji', { unique: false });
        store.createIndex('kana', 'kana', { unique: false });
        console.log('✅ Datenbank-Schema erstellt');
      }
    };
  });
};

// Vokabeln speichern
export const saveVocabulary = async (vocabs: VocabularyCard[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Alte Daten löschen
    store.clear();

    // Neue Daten speichern
    vocabs.forEach(vocab => {
      store.add(vocab);
    });

    transaction.oncomplete = () => {
      console.log(`💾 ${vocabs.length} Vokabeln in IndexedDB gespeichert`);
      resolve();
    };

    transaction.onerror = () => {
      console.error('Fehler beim Speichern der Vokabeln');
      reject(transaction.error);
    };
  });
};

// Vokabeln laden
export const loadVocabulary = async (): Promise<VocabularyCard[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const vocabs = request.result;
      console.log(`✅ ${vocabs.length} Vokabeln aus IndexedDB geladen`);
      resolve(vocabs);
    };

    request.onerror = () => {
      console.error('Fehler beim Laden der Vokabeln');
      reject(request.error);
    };
  });
};

// Backup in LocalStorage (zusätzliche Sicherheit)
export const backupToLocalStorage = (vocabs: VocabularyCard[]): void => {
  try {
    localStorage.setItem('japanvoc-backup', JSON.stringify(vocabs));
    console.log('💾 Backup in LocalStorage erstellt');
  } catch (err) {
    console.error('Fehler beim Backup in LocalStorage:', err);
  }
};

// Backup aus LocalStorage laden
export const loadFromLocalStorage = (): VocabularyCard[] | null => {
  try {
    const backup = localStorage.getItem('japanvoc-backup');
    if (backup) {
      const vocabs = JSON.parse(backup);
      console.log('✅ Backup aus LocalStorage geladen');
      return vocabs;
    }
  } catch (err) {
    console.error('Fehler beim Laden des Backups:', err);
  }
  return null;
}; 