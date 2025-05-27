import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, FileText } from 'lucide-react';
import { useVocabularyManager } from '../hooks/useVocabularyManager';
import { useSearch } from '../hooks/useSearch';
import { VocabularyCard } from '../types/vocabulary';

interface VocabularyTabProps {
  onEditVocab: (vocab: VocabularyCard) => void;
  onAddVocab: () => void;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({
  onEditVocab,
  onAddVocab
}) => {
  const { vocabulary, deleteVocabulary } = useVocabularyManager();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    isSearching, 
    resultCount 
  } = useSearch(vocabulary);

  const handleDelete = (vocab: VocabularyCard) => {
    deleteVocabulary(vocab.id);
    setShowDeleteConfirm(null);
  };

  const displayVocabs = searchTerm.trim() ? searchResults : vocabulary.slice(0, 50); // Zeige nur erste 50 wenn keine Suche

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header mit Suche */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          {/* Suchfeld */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Vokabeln durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Add Button */}
          <button
            onClick={onAddVocab}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Neue Vokabel hinzufügen"
          >
            <Plus size={24} />
          </button>
        </div>
        
        {/* Suchergebnisse Info */}
        {searchTerm.trim() && (
          <div className="mt-3 text-sm text-gray-600">
            {isSearching ? (
              'Suche läuft...'
            ) : (
              `${resultCount} Ergebnis${resultCount !== 1 ? 'se' : ''} gefunden`
            )}
          </div>
        )}
      </div>

      {/* Vokabelliste */}
      <div className="flex-1 overflow-y-auto pb-20"> {/* pb-20 für Tab Bar Platz */}
        {displayVocabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText size={48} className="mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm.trim() ? 'Keine Ergebnisse' : 'Keine Vokabeln'}
            </h3>
            <p className="text-center text-sm">
              {searchTerm.trim() 
                ? 'Versuche einen anderen Suchbegriff'
                : 'Füge deine erste Vokabel hinzu'
              }
            </p>
            {!searchTerm.trim() && (
              <button
                onClick={onAddVocab}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vokabel hinzufügen
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {displayVocabs.map((vocab: VocabularyCard) => (
              <div
                key={vocab.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Japanisch */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl font-bold text-gray-900">{vocab.kanji}</span>
                      <span className="text-lg text-gray-700">{vocab.kana}</span>
                    </div>
                    
                    {/* Romaji */}
                    <div className="text-sm text-gray-500 mb-2">{vocab.romaji}</div>
                    
                    {/* Deutsche Bedeutung */}
                    <div className="text-base text-blue-600 font-medium">{vocab.de}</div>
                    
                    {/* SM-2 Info */}
                    <div className="mt-2 text-xs text-gray-400">
                      {vocab.sm2.repetitions > 0 ? (
                        `${vocab.sm2.repetitions} Wiederholungen • Faktor: ${vocab.sm2.easeFactor.toFixed(1)}`
                      ) : (
                        'Noch nicht gelernt'
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEditVocab(vocab)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Bearbeiten"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(vocab.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mehr laden Hinweis */}
            {!searchTerm.trim() && vocabulary.length > 50 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Verwende die Suche um alle {vocabulary.length} Vokabeln zu durchsuchen
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vokabel löschen?
            </h3>
            <p className="text-gray-600 mb-6">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  const vocab = vocabulary.find(v => v.id === showDeleteConfirm);
                  if (vocab) handleDelete(vocab);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 