# DEPLOYMENT GUIDE — react-example (Goma — Delano Collection)

Généré le : 2026-11-22
Stack : React 19 (`react@^19.0.1`) + Vite 8 (`vite@^8.3.0`) + Tailwind CSS v4 (`@tailwindcss/vite@^4.3.3`) + TypeScript + Fonctions Serverless Node.js (`/api/assistant.ts`, `/api/health.ts`) + SDK `@google/genai@^2.4.0` (Express local via `server.ts`)
Plateforme(s) : Vercel

---

## 1. PRÉREQUIS

Outils à installer localement :
- Node.js `>= 20.0.0` (déclaré dans `package.json` → `engines.node`)
- `npm` (inclus avec Node.js — utilisé par Vercel pour `npm install`)
- Git + dépôt GitHub connecté à Vercel (`github.com/elfridw4-ops/Goma`)
- Compte Vercel (`vercel.com`) avec accès au projet
- Clé API Gemini (`GEMINI_API_KEY`) pour l'assistant IA `/api/assistant`

Notes sur la configuration détectée :
- **Base de données / Auth :** Aucune base de données distante configurée pour l'instant (persistance locale `localStorage` dans `src/services/marketplaceStorage.ts`).
- **Correction `ERESOLVE` Vercel appliquée :** `esbuild` a été mis à jour de `^0.25.0` vers `^0.28.0` dans `package.json` afin de satisfaire `vite@^8.3.0` (`peerOptional esbuild@"^0.27.0 || ^0.28.0"`) et `tsx@^4.21.0` lors de `npm install`.

---

## 2. VARIABLES D'ENVIRONNEMENT

À configurer dans **Vercel Dashboard → Project Settings → Environment Variables** (scopes : Production, Preview, Development).
Ne jamais commiter de fichier `.env` contenant de vraies clés (`.gitignore` exclut `.env*` sauf `!.env.example`).

Contenu de référence (`.env.example`) :

```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
# Côté serveur uniquement (/api/assistant.ts et server.ts) — ne JAMAIS préfixer par VITE_
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# Ex: https://goma-delano.vercel.app ou https://[À RENSEIGNER]
APP_URL="MY_APP_URL"
```

> ⚠️ **Règle Vite / sécurité :** Toute variable préfixée `VITE_` est exposée dans le bundle JavaScript client final. `GEMINI_API_KEY` doit rester **sans** préfixe `VITE_` pour n'être lue que côté serveur dans `/api/assistant.ts`.

---

## 3. BUILD DE PRODUCTION

Commandes définies dans `package.json` :

```bash
# Installation propre des dépendances
npm install

# Vérification TypeScript
npm run lint

# Build statique de production Vite (génère dist/)
npm run build
```

Paramètres de build détectés pour Vercel :
- **Framework Preset :** Vite (ou Other avec config `vercel.json`)
- **Install Command :** `npm install`
- **Build Command :** `npm run build`
- **Output Directory :** `dist`
- **Root Directory :** `.` (racine)

---

## 4. FICHIERS DE CONFIGURATION

### `vercel.json` (présent à la racine)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Fonctions Serverless Vercel (`api/`)

Parce que Vercel déploie un front statique (`dist/`) et n'exécute pas le serveur long-running `server.ts`, les endpoints API sont fournis dans `api/` :
- `api/assistant.ts` → `POST /api/assistant` (appelle `@google/genai` avec `process.env.GEMINI_API_KEY`)
- `api/health.ts` → `GET /api/health` (vérification de disponibilité)

> ⚠️ **Limite Vercel à surveiller :** Sur le plan Hobby gratuit, le timeout des fonctions serverless est de **10 secondes** (60s sur Pro) et la bande passante est limitée à **100 GB/mois**. Si les appels IA Gemini `/api/assistant` dépassent fréquemment 10s, passer au plan Vercel Pro ou migrer le backend API vers Railway / Cloud Run.

---

## 5. DÉPLOIEMENT

### Déploiement via Git + Dashboard Vercel

1. Commiter et pousser les modifications (`package.json`, `vercel.json`, `api/assistant.ts`, `api/health.ts`, `deployment_guide.md`) sur la branche `main` de `github.com/elfridw4-ops/Goma`.
2. Dans Vercel Dashboard → **Project Settings → General**, vérifier :
   - **Build Command :** `npm run build`
   - **Output Directory :** `dist`
   - **Install Command :** `npm install`
   - **Root Directory :** `.`
   - **Node.js Version :** `20.x` (ou supérieur, conforme à `engines.node >= 20.0.0`).
3. Dans **Project Settings → Environment Variables**, ajouter :
   - `GEMINI_API_KEY` = `[À RENSEIGNER]`
   - `APP_URL` = `[À RENSEIGNER]` (URL Vercel de production)
4. Lancer un **Redeploy** (sans build cache si un ancien échec `ERESOLVE` est en cache) depuis l'onglet **Deployments**.
5. Vérifier après déploiement :
   - Vitrine `/` et rafraîchissement direct sur une route SPA `/market/catalogue` (pas de 404).
   - Endpoint santé : `GET https://[DOMAINE-VERCEL]/api/health` → `{ "ok": true, "service": "goma-delano-collection" }`.
   - Assistant IA : tester une requête acheteur/vendeur dans `/market/ai`.

---

## 6. DOMAINE ET HTTPS

Domaine cible : `[À RENSEIGNER]`

1. Acheter le domaine auprès d'un registrar (OVH, Gandi, Namecheap, etc.).
2. Dans Vercel Dashboard → **Project Settings → Domains**, ajouter `[À RENSEIGNER]`.
3. Créer les enregistrements DNS fournis par Vercel chez le registrar :
   - Enregistrement `A` : `@` → IP fournie par Vercel (`[À RENSEIGNER]`)
   - Enregistrement `CNAME` : `www` → alias CNAME fourni par Vercel (`[À RENSEIGNER]`)
4. Attendre la propagation DNS (5 min à 48h).
5. **HTTPS :** Automatique et managé par Vercel (aucune configuration Certbot requise).

---

## 7. SEO

Meta tags déjà présents dans `index.html` :
- `<title>Goma — Delano Collection | Marketplace & Assistance IA</title>` + titres dynamiques par route dans `src/App.tsx`
- `<meta name="description">`, `og:title`, `og:description`, `og:type`, `twitter:card`

Éléments SEO à compléter dans `public/` avant mise en production publique (absents actuellement) :

### `public/robots.txt`
```txt
User-agent: *
Allow: /

Sitemap: https://[À RENSEIGNER]/sitemap.xml
```

### `public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[À RENSEIGNER]/</loc>
    <lastmod>2026-11-22</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://[À RENSEIGNER]/market</loc>
    <lastmod>2026-11-22</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://[À RENSEIGNER]/market/catalogue</loc>
    <lastmod>2026-11-22</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>
```

Et dans `index.html`, ajouter `<link rel="canonical" href="https://[À RENSEIGNER]/" />` ainsi que `<meta property="og:image" content="https://[À RENSEIGNER]/[À RENSEIGNER]" />` et `<meta property="og:url" content="https://[À RENSEIGNER]" />`.

---

## 8. PWA (si applicable)

Statut actuel détecté dans le projet : **Non configurée** (`public/manifest.json` et `public/sw.js` absents).
`index.html` dispose déjà de `viewport-fit=cover` et `<meta name="theme-color" content="#2B211B" />`.

Si l'installation PWA devient souhaitée :
- Ajouter `public/manifest.json` (`display: "standalone"`, `theme_color: "#2B211B"`, `background_color: "#F2E9DA"`)
- Ajouter les icônes PNG `192x192`, `512x512`, `512x512` maskable et `apple-touch-icon` `180x180` (sans fond transparent sur Android)
- Enregistrer `public/sw.js` dans `src/main.tsx` et tester via Chrome DevTools → Lighthouse.

---

## 9. ANALYTICS (si applicable)

Statut actuel détecté dans le projet : **Non configuré** (`[À RENSEIGNER]`).

Options possibles :
- **Plausible (sans cookies) :** ajouter dans `index.html` :
  ```html
  <script defer data-domain="[À RENSEIGNER]" src="https://plausible.io/js/script.js"></script>
  ```
- **Google Analytics 4 (`react-ga4`) :** installer `react-ga4`, ajouter la variable Vercel `VITE_GA_ID=[À RENSEIGNER]` (préfixe `VITE_` requis pour Vite), et prévoir un bandeau de consentement cookies conforme RGPD.

---

## 10. MONITORING

- **Disponibilité (UptimeRobot — gratuit jusqu'à 50 monitors) :**
  1. Créer un compte sur `uptimerobot.com`
  2. Add New Monitor → `HTTP(s)`
  3. URL : `https://[À RENSEIGNER]/api/health`
  4. Interval : `5 minutes`
  5. Notification : `[À RENSEIGNER]` (email ou Telegram)
- **Logs Vercel :** consulter Vercel Dashboard → **Deployments → Functions / Logs** pour suivre les appels `POST /api/assistant` et d'éventuels timeouts 10s.
- **Erreurs front-end (optionnel — Sentry) :** non configuré (`VITE_SENTRY_DSN=[À RENSEIGNER]`).

---

## 11. SAUVEGARDES

Statut actuel : **Aucune base de données distante configurée** (les données de démonstration et paniers/favoris/comptes temporaires sont stockés dans le navigateur via `localStorage`).

Quand une base de données distante sera activée ultérieurement (`[À RENSEIGNER]` — ex. Railway PostgreSQL ou Supabase, avec rétention 7 jours incluse sur les offres managées), configurer et **tester** la restauration des dumps avant la mise en production des comptes clients.

---

## 12. CI/CD GITHUB ACTIONS

Aucun fichier workflow détecté dans `.github/workflows/`.
Pipeline recommandé (`.github/workflows/deploy-vercel.yml` — adapté aux scripts de `package.json`) :

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Installer les dépendances
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Tests unitaires
        run: npx --yes tsx --test src/utils/marketplaceLogic.test.ts

      - name: Build
        run: npm run build

      - name: Deploy sur Vercel
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

Secrets GitHub à configurer dans **Repo → Settings → Secrets and variables → Actions** :
- `VERCEL_TOKEN` = `[À RENSEIGNER]`
- `VERCEL_ORG_ID` = `[À RENSEIGNER]`
- `VERCEL_PROJECT_ID` = `[À RENSEIGNER]`

---

## 13. ROLLBACK

En cas d'anomalie après déploiement sur Vercel :
1. Ouvrir **Vercel Dashboard → Deployments**
2. Identifier le dernier déploiement stable
3. Cliquer sur le menu (`...`) → **Promote to Production**
4. Délai de retour en arrière : **immédiat**

---

## 14. CHECKLIST FINALE

- [x] Conflit `ERESOLVE` résolu dans `package.json` (`"esbuild": "^0.28.0"`)
- [x] `vercel.json` présent et valide à la racine (`outputDirectory: "dist"` + rewrites `/api` et SPA)
- [x] Fonctions serverless `api/assistant.ts` et `api/health.ts` prêtes pour Vercel
- [x] `.gitignore` exclut `.env*` (sauf `!.env.example`), `node_modules/`, `dist/`, `build/`
- [x] Vérification locale `npm run lint` et `npm run build` sans erreur
- [ ] Variables d'environnement (`GEMINI_API_KEY`, `APP_URL`) ajoutées dans Vercel Dashboard
- [ ] Domaine personnalisé `[À RENSEIGNER]` et DNS configurés (si applicable)
- [ ] `robots.txt` et `sitemap.xml` ajoutés dans `public/` avec le domaine final
- [ ] Monitor UptimeRobot configuré sur `https://[À RENSEIGNER]/api/health`
- [ ] Test post-déploiement complet sur l'URL Vercel (`/` vitrine, `/market/catalogue` avec F5, `/api/health`, `/market/ai`)

---
Sections marquées `[À RENSEIGNER]` = informations manquantes à compléter manuellement.
