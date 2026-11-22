import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'goma-delano-collection' });
  });

  app.post('/api/assistant', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Clé API Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets pour activer les réponses IA en direct.',
      });
      return;
    }

    const { mode, query, catalog, sellerInput } = req.body ?? {};

    try {
      if (mode === 'buyer') {
        if (typeof query !== 'string' || query.trim().length < 2) {
          res.status(400).json({ error: 'Veuillez saisir votre question style, budget en FCFA ou taille.' });
          return;
        }

        const catalogSummary = Array.isArray(catalog)
          ? catalog
              .slice(0, 14)
              .map(
                (item: {
                  id: string;
                  name: string;
                  condition: string;
                  segment: string;
                  priceFcfa: number;
                  material: string;
                  sizes: string[];
                  geoCity: string;
                  stockCount: number;
                }) =>
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
        res.json(parsed);
        return;
      }

      if (mode === 'seller') {
        const name = typeof sellerInput?.name === 'string' ? sellerInput.name.trim() : '';
        const condition =
          sellerInput?.condition === 'frip' ? 'Friperie / Pièce unique' : 'Neuf';
        const segment =
          typeof sellerInput?.segment === 'string' ? sellerInput.segment.trim() : 'Femme';
        const material =
          typeof sellerInput?.material === 'string' ? sellerInput.material.trim() : '';
        const geoCity =
          typeof sellerInput?.geoCity === 'string' ? sellerInput.geoCity.trim() : 'Cotonou';
        const priceFcfa = Number(sellerInput?.priceFcfa) || 5000;

        if (name.length < 2) {
          res.status(400).json({
            error: 'Indiquez d’abord le nom de l’article pour rédiger l’annonce par IA.',
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
                  description: 'Titre produit éditorial précis (max 65 caractères).',
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
        res.json(parsed);
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
  });

  const publicPath = path.resolve(__dirname, 'public');
  app.use(express.static(publicPath));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur Goma — Delano Collection démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
