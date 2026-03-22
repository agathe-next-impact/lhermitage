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
- **Autres** : Embla Carousel, Lenis (smooth scroll), sanitize-html, date-fns, Recharts, @react-pdf/renderer

## Architecture

```
app/                    Pages (App Router) - Server Components par defaut
  api/revalidate/       Webhook ISR on-demand depuis WordPress
  [slug]/               Catch-all pour pages WordPress
  sejour/[slug]/        Detail sejour
  hebergement/[slug]/   Detail hebergement
  activite/[slug]/      Detail activite
  structure/[slug]/     Detail structure
  sejours-collectifs/   Sous-pages: nos-sejours, activites, services, espaces-de-travail, packs-de-sejours
  sejours-individuels/
  ecosysteme-innovant/  Sous-pages: structures, partenaires, evenements
  infos-pratiques/      Sous-pages: contacts, localisation, jours-et-horaires-douverture
  participer/devenir-societaire/
  reserver/
  (special)/visite-virtuelle/

components/
  layout/               SiteHeader, Footer, CardNav, PageHeader, SejoursHeader
  content/              DetailPageSections, WordpressContent, WordpressLink
  features/             Organises par domaine: home/, sejours/, devenir-societaire/, contact/, hebergements/, partenaires/, structures/
  ui/                   shadcn/ui + composants custom (timeline, orbiting-circles, minimal-card)
  [racine]              Composants orphelins (hebergements-grid, structures-grid, partenaires-client, etc.)

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
Page (Server Component)
  -> wpApi.getXxx()
    -> gqlRequest() avec retry + timeout
      -> decodeObjectEntities() (HTML entities)
      -> transformXxxAcf() (extraction champs ACF)
      -> transformPost<T>() (wrapping WPPost)
      -> injection taxonomie si besoin
  -> Props vers Client Components
```

## Commandes

```bash
npm run dev          # Serveur de dev (port 3000)
npm run build        # Build production (TS strict, zero erreurs)
npm run start        # Serveur production
npm run lint         # ESLint
npm run format       # Prettier --write
npm run format:check # Prettier --check
```

## Variables d'environnement

```
WP_GRAPHQL_URL       # Endpoint GraphQL (default: https://admin.hermitagelelab.com/graphql)
WP_API_URL           # URL REST API (extraction hostname)
SITE_URL             # URL canonique frontend
HOMEPAGE_ID          # ID WordPress de la homepage (138)
DEFAULT_CTA_URL      # URL CTA fallback (/contact)
REVALIDATION_SECRET  # Secret pour webhook revalidation
MAPBOX_TOKEN         # Token MapLibre/Mapbox
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
- `dark` (#535453)

Chaque section du menu herite d'une couleur via `MENU_COLOR_SEQUENCE`. Les pages de detail utilisent `PAGE_COLORS` (fallback statique).

## Points d'attention

- **Pas de tests** : Aucun test unitaire/integration en place
- **ESLint ignore au build** : `ignoreDuringBuilds: true` (seul TS est strict)
- **`any` residuels** : Dans api.ts, card-nav.tsx, home-page-client.tsx, sejour-pricing-card.tsx
- **Composants orphelins** : hebergements-grid, structures-grid, partenaires-client, etc. a la racine de components/
- **Homepage ID hardcode** : `getHomepage()` utilise ID 138
- **Pas de CI/CD** : Deploiement via git auto-deploy Vercel
- **ACF incomplets** : `elementsDePageHero` et `pageDAccueil` pas encore accessibles en GraphQL (fallbacks hardcodes)
