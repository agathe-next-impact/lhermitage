# L'Hermitage - CLAUDE.md

## Projet

Site vitrine de L'Hermitage, tiers-lieu rural en France. Frontend Next.js headless connecte a un WordPress via WPGraphQL. Le site presente sejours, hebergements, activites, structures de l'ecosysteme, evenements, partenaires, et pages institutionnelles.

## Stack technique

- **Framework** : Next.js 14.2.35 (App Router), React 18.2, TypeScript strict (`ignoreBuildErrors: false`)
- **Styles** : Tailwind CSS 3.4, shadcn/ui (New York style, RSC, Lucide icons)
- **Data** : WordPress headless via WPGraphQL (`graphql-request` 7.4)
- **Animations** : Framer Motion, GSAP
- **Maps** : MapLibre GL
- **State** : Zustand, React Context (menu)
- **Forms** : React Hook Form + Zod
- **Autres** : Embla Carousel, Lenis (smooth scroll), sanitize-html, date-fns, Recharts, @react-pdf/renderer, Sonner (toasts), HeroUI, Vercel Analytics

## Architecture

```
app/                    Pages (App Router) - Server Components par defaut
  api/revalidate/       Webhook ISR on-demand depuis WordPress
  [...slug]/            Catch-all pour pages WordPress (sejours, hebergements, ecosysteme, infos-pratiques, etc.)
  sejour/[slug]/        Detail sejour
  hebergement/[slug]/   Detail hebergement
  activite/[slug]/      Detail activite
  structure/[slug]/     Detail structure
  (special)/visite-virtuelle/
middleware.ts           Detection redirections WordPress old-slug (cache 1h, HEAD request)

components/
  layout/               SiteHeader, Footer, CardNav, PageHeader, SejoursHeader, MenuButton, BentoHeaderContent
  content/              DetailPageSections, WordpressContent, WordpressLink
  features/             Organises par domaine: home/, sejours/, devenir-societaire/, contact/, recrutement/,
                        activites/, espaces/, evenements/, services/, visite-virtuelle/
  ui/                   shadcn/ui + composants custom (timeline, orbiting-circles, minimal-card, variable-proximity)
  [racine]              Composants partages (hebergements-grid, structures-grid, partenaires-client,
                        patrimoine-page, seminaires-page, histoire-timeline, localisation-map,
                        category-filter, team-masonry, menu-colors-provider, providers, theme-provider)

lib/
  wordpress/
    api.ts              Singleton wpApi - toutes les methodes de fetching (20 methodes)
    types.ts            Types WPPost<T>, WPPage, WPImage, tous les ACF types
    graphql/
      client.ts         Client GraphQL avec retry + timeout 30s
      fragments.ts      Fragments reutilisables (IMAGE_FIELDS, PAGE_FIELDS, etc.)
      transformers.ts   Conversions GraphQL -> types TS (transformPost, transformPage, transformHebergementAcf, etc.)
      queries/          Requetes par domaine: pages.ts, posts.ts, sejours.ts, menu.ts, taxonomy.ts, seminaires.ts
    config.ts           Configuration WordPress
    sanitize.ts         Sanitization HTML (allowlist)
    decode.ts           Decodage entites HTML (accents francais)
    url-transform.ts    Reecriture URLs WordPress -> frontend
    transform-content.ts  Transformation liens dans le contenu
    category-colors.ts  Couleurs par categorie
    menu.ts             Utilitaires menu
  page-renderers/       Renderers par type de page (activites, contacts, hebergements, sejours, etc.)
    transforms/         Utilitaires extraction categories, dates evenements, images HTML
  page-registry.ts      Registre slug -> renderer pour le catch-all [...slug]
  theme/colors.ts       BRAND_COLORS (coral, teal, green, rose, orange, darkBlue, dark)
  constants.ts          REVALIDATION (homepage: 2h, listing: 1h, detail: 1h, frequent: 15min)
  utils.ts              cn(), stripHtml(), truncateText()
  page-colors.ts        Mapping route -> couleur de marque
  menu-context.tsx      Context React pour etat du menu (open/close)
  logger.ts             Logger conditionnel (dev/prod)
  map/                  Styles et types pour MapLibre

hooks/
  use-is-mounted.ts     Guard hydratation SSR/client
```

## Conventions de code

### Formatting (Prettier)
- Pas de point-virgule (`semi: false`)
- Guillemets doubles (`singleQuote: false`)
- Indentation 2 espaces
- Trailing comma ES5
- Print width 100
- Arrow parens always
- Line endings LF

### ESLint
- Extends: next/core-web-vitals, @typescript-eslint/recommended, prettier
- `no-explicit-any`: warn (pas error - il y a des `any` historiques dans api.ts, card-nav, etc.)
- `no-unused-vars`: error (prefix `_` autorise)
- `no-console`: warn (sauf `error` et `warn`)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn

### TypeScript
- Strict mode active
- Path alias: `@/*` -> `./`
- Build echoue si erreurs TS (`ignoreBuildErrors: false`)

### Patterns de code
- **Server Components par defaut** : `"use client"` uniquement quand interactivite necessaire
- **Fetching dans les pages** : Appels `wpApi.getXxx()` directement dans les Server Components
- **Page Registry** : Le catch-all `[...slug]` utilise `page-registry.ts` pour router vers le bon renderer dans `page-renderers/`
- **ACF generics** : `WPPost<HebergementACF>`, `WPPost<SejourACF>`, etc.
- **Transformers** : Chaque CPT a son propre transformer dans `graphql/transformers.ts`
- **Injection taxonomie** : Les filtres de categorie injectent `_embedded["wp:term"]` manuellement apres transformation
- **Imports** : Alias `@/` systematique (`@/lib/`, `@/components/`, `@/hooks/`)

## GraphQL - Points cles

### Noms WPGraphQL (mangling des accents)
- Hebergements: query root `hBergements`, single `hBergement`
- Activites: query root `activitS`, single `activit`
- Sejours: query root `sJours`, single `sJour`
- Evenements: query root `evNements`
- Team: query root `equipes`

### ACF dans GraphQL
- `photos` = `AcfMediaItemConnection` -> `{ nodes: [{ sourceUrl, altText }] }`
- `logo` = `AcfMediaItemConnectionEdge` -> `{ node: { sourceUrl, altText } }`
- `localisation` = `AcfGoogleMap` -> `{ latitude, longitude, zoom, streetAddress }`
- `position` (mapPinPoints) = `{ latitude: Float, longitude: Float, altitude: Float }`
- Certains CPT ont 2 groupes ACF (principal + mapPinPoints) -> fusionnes par `mergeMainAndMapPinPoints()`

### Data flow
```
Catch-all [...slug] (Server Component)
  -> page-registry.ts : slug -> renderer
  -> renderer dans page-renderers/ :
    -> wpApi.getXxx()
      -> gqlRequest() avec retry + timeout
        -> decodeObjectEntities() (HTML entities)
        -> transformXxxAcf() (extraction champs ACF)
        -> transformPost<T>() (wrapping WPPost)
        -> injection taxonomie si besoin
    -> Props vers Client Components

Pages de detail (/sejour/[slug], /hebergement/[slug], etc.)
  -> wpApi.getXxxBySlug() directement dans le Server Component
  -> Props vers Client Components
```

## Commandes

```bash
npm run dev          # Serveur de dev (port 3000)
npm run build        # Build production (TS strict, zero erreurs)
npm run start        # Serveur production
npm run lint         # ESLint
npm run lint:fix     # ESLint --fix
npm run format       # Prettier --write
npm run format:check # Prettier --check
npm run prepare      # Husky (git hooks)
```

## Variables d'environnement

```
WP_GRAPHQL_URL       # Endpoint GraphQL (default: https://admin.hermitagelelab.com/graphql)
NEXT_PUBLIC_WP_API_URL  # URL REST API (extraction hostname, fallback)
SITE_URL             # URL canonique frontend
HOMEPAGE_ID          # ID WordPress de la homepage (138)
DEFAULT_CTA_URL      # URL CTA fallback (/reserver)
REVALIDATION_SECRET  # Secret pour webhook revalidation
```

## Revalidation ISR

- **Homepage** : 2h (`REVALIDATION.homepage`)
- **Listings** : 1h (`REVALIDATION.listing`)
- **Detail** : 1h (`REVALIDATION.detail`)
- **Frequent** (structures, events) : 15min (`REVALIDATION.frequent`)
- **On-demand** : POST `/api/revalidate` avec header `x-revalidation-secret`

## Couleurs de marque

Definies dans `lib/theme/colors.ts` -> `BRAND_COLORS` :
- `coral` (#E75754) - Participer, Reserver
- `teal` (#56939F) - Sejours, Hebergements
- `green` (#78AD7D) - Ecosysteme innovant
- `rose` (#C14C66) - Tiers-lieu, Projet, Patrimoine
- `orange` (#DC6F45) - Infos pratiques, Services
- `darkBlue` (#2A4A51)
- `dark` (#535353)

Chaque section du menu herite d'une couleur via `MENU_COLOR_SEQUENCE`. Les pages de detail utilisent `PAGE_COLORS` (fallback statique).

## Pre-commit hooks

- **Husky** 9.x + **lint-staged** 16.x : Prettier et ESLint automatiques avant chaque commit
- Configures dans `package.json` sous `lint-staged`

## Middleware

- `middleware.ts` : Detection des redirections WordPress old-slug
- HEAD request vers le backend WP, cache en memoire (TTL 1h)
- Matcher : tous les chemins sauf `_next`, `api`, `favicon.ico`, fichiers statiques
- Timeout : 3 secondes

## Securite

- **CSP** : Content-Security-Policy stricte dans `next.config.mjs`
- Autorise YouTube embeds, API geospatiales (data.geopf.fr, IGN Panoramax)
- `object-src: 'none'`, `upgrade-insecure-requests`

## Points d'attention

- **Pas de tests** : Aucun test unitaire/integration en place
- **ESLint ignore au build** : `ignoreDuringBuilds: true` (seul TS est strict)
- **`any` residuels** : Dans api.ts, card-nav.tsx, home-page-client.tsx, sejour-pricing-card.tsx
- **Composants orphelins** : hebergements-grid, structures-grid, partenaires-client, etc. a la racine de components/
- **Homepage ID hardcode** : `getHomepage()` utilise ID 138
- **Pas de CI/CD** : Deploiement via git auto-deploy Vercel
- **ACF incomplets** : `elementsDePageHero` et `pageDAccueil` pas encore accessibles en GraphQL (fallbacks hardcodes)
