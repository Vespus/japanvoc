import { processCsvFile } from '../utils/csvToJson';
import * as path from 'path';

// Pfade definieren
const inputPath = path.join(__dirname, '../../data/italienisch.csv');
const outputPath = path.join(__dirname, '../../public/vocabulary.json');

// Konvertierung ausführen
console.log('Starte Konvertierung...');
const success = processCsvFile(inputPath, outputPath);

if (success) {
  console.log('Konvertierung abgeschlossen!');
} else {
  console.error('Konvertierung fehlgeschlagen!');
  process.exit(1);
} 