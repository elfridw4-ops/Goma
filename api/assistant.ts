import { GoogleGenAI, Type } from '@google/genai';

interface ServerlessRequest {
  method?: string;
  body?: unknown;
}

interface ServerlessResponse {
  status: (statusCode: number) => ServerlessResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface CatalogSummaryItem {
  id: string;
  name: string;
  condition: string;
  segment: string;
  priceFcfa: number;
  material: string;
  sizes: string[];
  geoCity: string;
  stockCount: number;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

function parseBody(rawBody: unknown): Record<string, unknown> | null {
  if (rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody)) {
    return rawBody as Record<string, unknown>;
  }
  if (typeof rawBody === 'string') {
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error:
        'Clé API Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans les variables d’environnement Vercel.',
    });
    return;
  }

  const body = parseBody(req.body);
  if (!body) {
    res.status(400).json({ error: 'Corps de requête JSON invalide.' });
    return;
  }

  const { mode, query, catalog, sellerInput } = body as {
    mode?: unknown;
    query?: unknown;
    catalog?: unknown;
    sellerInput?: Record<string, unknown>;
  };

  try {
    if (mode === 'buyer') {
      if (typeof query !== 'string' || query.trim().length < 2) {
        res.status(400).json({
          error:
            'Veuillez saisir votre question style, budget en FCFA ou taille.',
        });
        return;
      }

      const catalogSummary = Array.isArray(catalog)
        ? (catalog as CatalogSummaryItem[])
            .slice(0, 14)
            .map(
              (item) =>
                `- [${item.id}] ${item.name} (${item.condition === 'frip' ? 'Friperie' : 'Neuf'} · ${item.segment}) | ${item.priceFcfa} F | ${item.material} | Tailles: ${(item.sizes || []).join(', ')} | Ville: ${item.geoCity} | Stock: ${item.stockCount}`,
            )
            .join('\n')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Demande client au Bénin : "${query.trim()}"\n\nCatalogue marketplace Goma (Neuf & Frip en FCFA) :\n${catalogSummary}`,
        config: {
          systemInstruction:
            'Tu es le conseiller styliste personnel de la marketplace Goma (Delano Collection & boutiques partenaires au Bénin : Cotonou, Abomey-Calavi, Porto-Novo). Réponds en français sobre, précis et utile. Recommande 1 à 3 articles en stock (Stock > 0) du catalogue fourni en utilisant leurs identifiants exacts et les prix en FCFA.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advice: {
                type: Type.STRING,
                description:
                  'Conseil personnalisé de coupe, climat, taille et budget en FCFA en 2-3 phrases maximum.',
              },
              recommendedIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Liste des identifiants exacts [id] en stock du catalogue recommandés.',
              },
              stylingNotes: {
                type: Type.STRING,
                description:
                  'Note pratique d’association des couleurs Argile & Moutarde ou de livraison locale.',
              },
            },
            required: ['advice', 'recommendedIds', 'stylingNotes'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.status(200).json(parsed);
      return;
    }

    if (mode === 'seller') {
      const name =
        typeof sellerInput?.name === 'string' ? sellerInput.name.trim() : '';
      const condition =
        sellerInput?.condition === 'frip'
          ? 'Friperie / Pièce unique'
          : 'Neuf';
      const segment =
        typeof sellerInput?.segment === 'string'
          ? sellerInput.segment.trim()
          : 'Femme';
      const material =
        typeof sellerInput?.material === 'string'
          ? sellerInput.material.trim()
          : '';
      const geoCity =
        typeof sellerInput?.geoCity === 'string'
          ? sellerInput.geoCity.trim()
          : 'Cotonou';
      const priceFcfa = Number(sellerInput?.priceFcfa) || 5000;

      if (name.length < 2) {
        res.status(400).json({
          error:
            'Renseignez au moins le nom de l’article pour générer sa fiche SEO & GEO.',
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Article à publier sur la marketplace Goma (Bénin) :\nNom: ${name}\nÉtat: ${condition}\nCatégorie: ${segment}\nMatière: ${material || 'Non précisée'}\nZone GEO: ${geoCity}\nPrix souhaité: ${priceFcfa} FCFA`,
        config: {
          systemInstruction:
            'Tu es l’assistant vendeur SEO & GEO de la marketplace Goma au Bénin. Génère en français une fiche produit claire, crédible, optimisée pour la recherche locale (Cotonou, Abomey-Calavi, Porto-Novo) et adaptée à la revente neuf ou friperie, sans superlatifs vides.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedTitle: {
                type: Type.STRING,
                description:
                  'Titre produit éditorial précis (max 65 caractères).',
              },
              seoDescription: {
                type: Type.STRING,
                description:
                  'Description produit claire et structurée (30 à 50 mots) mentionnant matière, état et coupe.',
              },
              geoSummary: {
                type: Type.STRING,
                description:
                  'Phrase d’accroche optimisée pour la visibilité locale (GEO) sur la ville béninoise indiquée.',
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 mots-clés SEO/GEO ciblés.',
              },
              suggestedPriceFcfa: {
                type: Type.INTEGER,
                description: 'Prix conseillé cohérent en FCFA.',
              },
            },
            required: [
              'optimizedTitle',
              'seoDescription',
              'geoSummary',
              'keywords',
              'suggestedPriceFcfa',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.status(200).json(parsed);
      return;
    }

    res.status(400).json({ error: 'Mode assistant invalide.' });
  } catch (error) {
    console.error('Erreur /api/assistant:', error);
    res.status(502).json({
      error:
        error instanceof Error
          ? `Impossible de joindre l'assistant Gemini (${error.message}).`
          : "Erreur lors de l'appel à l'assistant IA.",
    });
  }
}
