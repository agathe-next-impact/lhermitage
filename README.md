# Tiers-Lieu Rural - Headless WordPress App

Application Next.js headless connectée à WordPress pour présenter un lieu rural et ses séjours personnalisés.

## Fonctionnalités

- **Intégration WordPress Headless** : Connexion via l'API REST WordPress
- **Décodage automatique des caractères spéciaux** : Conversion automatique des entités HTML (é, à, ç, etc.)
- **Structure ACF** : Support complet des champs personnalisés ACF
- **Mega Menu Hiérarchique** : Navigation respectant la structure des pages WordPress
- **Carte interactive haute résolution** : Utilise Mapbox pour des images satellite de qualité
- **Types de contenu** :
  - Séjours (collectifs et individuels)
  - Hébergements avec galeries photos
  - Activités
  - Événements
  - Partenaires
  - Structures hébergées
  - Pages d'information

## Configuration

1. Créer un fichier `.env.local` à la racine du projet :

```bash
NEXT_PUBLIC_WP_API_URL=https://admin.hermitagelelab.com/wp-json/wp/v2
MAPBOX_TOKEN=your_mapbox_token_here
```

2. Obtenir un token Mapbox :
   - Créez un compte gratuit sur [mapbox.com](https://www.mapbox.com/)
   - Allez dans Account > Tokens
   - Créez un nouveau token ou utilisez le token public par défaut
   - Ajoutez-le dans `.env.local`
   - Le plan gratuit offre 50 000 chargements de carte par mois

3. Installer les dépendances :

```bash
npm install
```

4. Lancer le serveur de développement :

```bash
npm run dev
```

## Structure du projet

- `/app` - Pages et routes Next.js
- `/components` - Composants React réutilisables
- `/lib/wordpress` - Client API WordPress et types TypeScript
- `/public` - Assets statiques

## Types de contenu WordPress

L'application consomme les types de contenu suivants depuis WordPress :

- **Pages** : Pages hiérarchiques avec ACF (sous-titre, image)
- **Séjours** : Séjours avec hébergements et activités associés
- **Hébergements** : Hébergements avec galeries, vidéos, localisation
- **Activités** : Activités proposées
- **Événements** : Événements avec dates, heures, localisation
- **Partenaires** : Partenaires avec logos et liens
- **Structures** : Structures hébergées avec photos et localisation

## Technologies

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- WordPress REST API
- Mapbox (imagerie satellite haute résolution)
