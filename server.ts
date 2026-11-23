import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { injectOgIntoHtml, normalizeBaseUrl, resolveOgMeta } from './src/utils/ogMeta';

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
  app.set('trust proxy', true);
  app.use(express.json({ limit: '10mb' }));

  const getBaseUrl = (req: express.Request) =>
    normalizeBaseUrl(
      req.headers['x-forwarded-proto'] ?? req.protocol,
      req.headers['x-forwarded-host'] ?? req.get('host'),
    );

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
              .slice(0, 40)
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
              'Tu es le conseiller styliste personnel de la marketplace Goma (Delano Collection & boutiques partenaires au Bénin). Réponds en français sobre, précis et utile. Recommande 1 à 3 articles en stock (Stock > 0) du catalogue fourni en utilisant leurs identifiants exacts et les prix en FCFA.',
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
                    'Note pratique d’association des couleurs ou de livraison locale.',
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

  // Dynamic SEO files serving actual request host (no hardcoded domain)
  app.get('/sitemap.xml', (req, res) => {
    const filePath = path.join(publicPath, 'sitemap.xml');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const baseUrl = getBaseUrl(req);
      content = content.replace(/https:\/\/[^\s<>"]+/g, (match) => {
        if (match.includes('sitemaps.org') || match.includes('schema.org')) return match;
        return baseUrl;
      });
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(content);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.get('/robots.txt', (req, res) => {
    const filePath = path.join(publicPath, 'robots.txt');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const baseUrl = getBaseUrl(req);
      content = content.replace(/https:\/\/[^\s<>"]+/g, (match) => {
        if (match.includes('sitemaps.org') || match.includes('schema.org')) return match;
        return baseUrl;
      });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(content);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.get('/llms.txt', (req, res) => {
    const filePath = path.join(publicPath, 'llms.txt');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const baseUrl = getBaseUrl(req);
      content = content.replace(/https:\/\/[^\s<>"]+/g, (match) => {
        if (match.includes('schema.org')) return match;
        return baseUrl;
      });
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.send(content);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.get('/llms-full.txt', (req, res) => {
    const filePath = path.join(publicPath, 'llms-full.txt');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const baseUrl = getBaseUrl(req);
      content = content.replace(/https:\/\/[^\s<>"]+/g, (match) => {
        if (match.includes('schema.org')) return match;
        return baseUrl;
      });
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.send(content);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.use(express.static(publicPath));

  const httpServer = createServer(app);
  const disableHmr = process.env.DISABLE_HMR === 'true';

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ...(disableHmr
          ? { hmr: false as const, ws: false as const }
          : { ws: { server: httpServer } }),
      },
      appType: 'spa',
    });

    if (disableHmr) {
      app.get('/@vite/client', async (_req, res, next) => {
        try {
          const result = await vite.transformRequest('/@vite/client');
          if (!result) {
            next();
            return;
          }
          const patched = result.code
            .replaceAll('await wsTransport.connect(handlers);', 'return;')
            .replaceAll('await wsTransport.disconnect();', 'return;')
            .replaceAll('wsTransport.send(data);', 'return;');
          res
            .status(200)
            .set({
              'Content-Type': 'application/javascript; charset=utf-8',
              'Cache-Control': 'no-cache',
            })
            .end(patched);
        } catch (err) {
          next(err);
        }
      });
    }

    app.use(async (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
        return;
      }
      const reqPath = req.path || '/';
      if (
        reqPath.startsWith('/@') ||
        reqPath.startsWith('/src/') ||
        reqPath.startsWith('/node_modules/') ||
        reqPath.startsWith('/api/') ||
        /\.[a-z0-9]{1,16}$/i.test(reqPath)
      ) {
        next();
        return;
      }
      const accept = req.headers.accept || '';
      if (accept && !accept.includes('text/html') && !accept.includes('*/*')) {
        next();
        return;
      }

      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const rawTemplate = fs.readFileSync(indexPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        const baseUrl = getBaseUrl(req);
        const meta = resolveOgMeta({ requestPath: req.originalUrl, baseUrl });
        const finalHtml = injectOgIntoHtml(transformed, meta, baseUrl);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const htmlPath = path.join(distPath, 'index.html');
      const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
      const baseUrl = getBaseUrl(req);
      const meta = resolveOgMeta({ requestPath: req.originalUrl, baseUrl });
      const finalHtml = injectOgIntoHtml(rawHtml, meta, baseUrl);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(finalHtml);
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur Goma — Delano Collection démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
