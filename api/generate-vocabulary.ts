import { VercelRequest, VercelResponse } from '@vercel/node';

interface Vocabulary {
  japanese: string;
  kana: string;
  german: string;
  example?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { count } = req.body;
    
    if (!count || typeof count !== 'number' || count < 1 || count > 20) {
      return res.status(400).json({ 
        error: 'Invalid count. Please provide a number between 1 and 20.' 
      });
    }

    const prompt = `Generiere ${count} japanische Vokabeln im folgenden JSON-Format:
{
  "vocabularies": [
    {
      "japanese": "漢字", // Japanische Schreibweise (Kanji)
      "kana": "かんじ",   // Hiragana/Katakana Lesung
      "german": "Kanji",  // Deutsche Bedeutung
      "example": "これは漢字です。" // Optional: Beispielsatz
    }
  ]
}

Wichtige Regeln:
1. Nur gültige japanische Vokabeln
2. Korrekte Kanji und Kana
3. Präzise deutsche Übersetzungen
4. Beispielsätze sind optional
5. Keine Duplikate`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extrahiere den JSON-String aus der Claude-Antwort
    const content = data.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format from Claude');
    }

    const vocabularies = JSON.parse(jsonMatch[0]).vocabularies;
    
    res.status(200).json({ vocabularies });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 