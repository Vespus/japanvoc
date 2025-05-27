import React, { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Check } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';

interface AddVocabularyProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const AddVocabulary: React.FC<AddVocabularyProps> = ({
  onBack,
  onSuccess
}) => {
  const { addVocabulary, checkDuplicate } = useVocabularyManager();
  
  const [formData, setFormData] = useState({
    kanji: '',
    kana: '',
    romaji: '',
    de: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validierung
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.kanji.trim()) {
      newErrors.kanji = 'Kanji ist erforderlich';
    }
    
    if (!formData.kana.trim()) {
      newErrors.kana = 'Kana ist erforderlich';
    }
    
    if (!formData.romaji.trim()) {
      newErrors.romaji = 'Romaji ist erforderlich';
    }
    
    if (!formData.de.trim()) {
      newErrors.de = 'Deutsche Übersetzung ist erforderlich';
    }
    
    // Duplikat-Prüfung
    if (formData.kanji.trim() || formData.kana.trim() || formData.romaji.trim()) {
      if (checkDuplicate(formData.kanji.trim(), formData.kana.trim(), formData.romaji.trim())) {
        newErrors.duplicate = 'Eine Vokabel mit diesen Werten existiert bereits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newVocab = addVocabulary({
        kanji: formData.kanji.trim(),
        kana: formData.kana.trim(),
        romaji: formData.romaji.trim(),
        de: formData.de.trim()
      });
      
      console.log('Neue Vokabel erstellt:', newVocab);
      
      // Erfolg anzeigen
      setShowSuccess(true);
      
      // Formular zurücksetzen
      setFormData({
        kanji: '',
        kana: '',
        romaji: '',
        de: ''
      });
      
      // Nach 2 Sekunden ausblenden
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      setErrors({ submit: 'Fehler beim Speichern der Vokabel' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input-Handler
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Fehler für dieses Feld löschen
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Neue Vokabel hinzufügen</h1>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          <div className="flex items-center">
            <Check className="mr-2" size={20} />
            <span>Vokabel erfolgreich hinzugefügt!</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kanji */}
          <div>
            <label htmlFor="kanji" className="block text-sm font-medium text-gray-700 mb-2">
              Kanji *
            </label>
            <input
              id="kanji"
              type="text"
              value={formData.kanji}
              onChange={(e) => handleInputChange('kanji', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl ${
                errors.kanji ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 犬"
            />
            {errors.kanji && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.kanji}
              </p>
            )}
          </div>

          {/* Kana */}
          <div>
            <label htmlFor="kana" className="block text-sm font-medium text-gray-700 mb-2">
              Kana (Hiragana/Katakana) *
            </label>
            <input
              id="kana"
              type="text"
              value={formData.kana}
              onChange={(e) => handleInputChange('kana', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                errors.kana ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: いぬ"
            />
            {errors.kana && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.kana}
              </p>
            )}
          </div>

          {/* Romaji */}
          <div>
            <label htmlFor="romaji" className="block text-sm font-medium text-gray-700 mb-2">
              Romaji *
            </label>
            <input
              id="romaji"
              type="text"
              value={formData.romaji}
              onChange={(e) => handleInputChange('romaji', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.romaji ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: inu"
            />
            {errors.romaji && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.romaji}
              </p>
            )}
          </div>

          {/* Deutsch */}
          <div>
            <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-2">
              Deutsche Übersetzung *
            </label>
            <input
              id="de"
              type="text"
              value={formData.de}
              onChange={(e) => handleInputChange('de', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.de ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: Hund"
            />
            {errors.de && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.de}
              </p>
            )}
          </div>

          {/* Duplikat-Fehler */}
          {errors.duplicate && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{errors.duplicate}</span>
              </div>
            </div>
          )}

          {/* Submit-Fehler */}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2" size={20} />
                Vokabel speichern
              </>
            )}
          </button>
        </form>

        {/* Hinweise */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Hinweise:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Alle Felder sind erforderlich</li>
            <li>• Duplikate werden automatisch erkannt</li>
            <li>• Die Vokabel wird mit SM-2 Standard-Werten erstellt</li>
            <li>• Daten werden lokal gespeichert</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 