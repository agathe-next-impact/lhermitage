# Dépannage des champs ACF

## Problème: Les champs ACF ne s'affichent pas

### Diagnostic actuel

D'après les logs de débogage, l'API WordPress **retourne bien** les champs ACF avec la structure correcte:

```json
{
  "hero": {
    "sous-titre": "",
    "image": false
  }
}
```

**Cela signifie que:**
- ✅ Les champs ACF sont bien exposés dans l'API REST (`show_in_rest: 1`)
- ✅ La structure des données est correcte
- ❌ Mais les valeurs sont vides dans WordPress

### Causes possibles

1. **Les champs ne sont pas remplis dans WordPress**
   - Vérifiez que vous avez bien rempli les champs ACF dans l'éditeur de page WordPress
   - Allez dans WordPress Admin → Pages → Modifier la page → Vérifiez la section "Elements de page"

2. **Problème de cache WordPress**
   - Videz le cache WordPress (si vous utilisez un plugin de cache)
   - Videz le cache du navigateur
   - Essayez en navigation privée

3. **Les champs sont dans un autre groupe ACF**
   - Vérifiez que le groupe ACF "Elements de page" est bien assigné à vos pages
   - Vérifiez les règles de localisation du groupe ACF

4. **Problème de permissions**
   - Vérifiez que l'utilisateur WordPress a les permissions pour voir les champs ACF
   - Vérifiez que les champs ne sont pas masqués par des règles conditionnelles

### Comment vérifier

#### 1. Tester l'API REST directement

Ouvrez cette URL dans votre navigateur (remplacez `votre-domaine.com` et `slug-de-la-page`):

```
https://votre-domaine.com/wp-json/wp/v2/pages?slug=slug-de-la-page&acf_format=standard
```

Vous devriez voir les données ACF dans la réponse JSON. Si `acf.hero.sous-titre` est vide, c'est que les données ne sont pas dans WordPress.

#### 2. Vérifier dans WordPress Admin

1. Allez dans **Pages** → Trouvez votre page → Cliquez sur **Modifier**
2. Faites défiler jusqu'à la section **"Elements de page"**
3. Vérifiez que les champs **"sous-titre"** et **"image"** sont bien remplis
4. Cliquez sur **Mettre à jour** pour sauvegarder

#### 3. Vérifier les règles de localisation ACF

1. Allez dans **ACF** → **Groupes de champs**
2. Trouvez le groupe **"Elements de page"**
3. Vérifiez les **Règles de localisation**:
   - Doit être: `Type de publication` `est égal à` `Page`
   - ET `Page` `n'est pas égal à` `Page d'accueil` (ID 138)

#### 4. Vérifier que show_in_rest est actif

1. Allez dans **ACF** → **Groupes de champs** → **Elements de page**
2. Dans les **Réglages**, vérifiez que **"Afficher dans REST"** est coché
3. Si ce n'est pas le cas, cochez-le et sauvegardez

### Solution rapide

Si les champs sont bien configurés mais toujours vides:

1. **Remplissez les champs dans WordPress**:
   - Allez dans Pages → Modifier la page
   - Remplissez "sous-titre" et "image" dans la section "Elements de page"
   - Cliquez sur "Mettre à jour"

2. **Videz tous les caches**:
   - Cache WordPress (plugin de cache)
   - Cache du navigateur
   - Cache de l'application Next.js (redémarrez le serveur de dev)

3. **Rechargez la page** dans votre application

### Logs de débogage

Les logs actuels montrent:
- `[v0] WordPress API - Page data for slug: activites`
- `[v0] Page ACF data: { "hero": { "sous-titre": "", "image": false } }`

Si après avoir rempli les champs dans WordPress, vous voyez toujours des valeurs vides dans les logs, contactez-nous avec:
- L'URL de votre API WordPress
- Une capture d'écran des champs ACF remplis dans WordPress
- La réponse complète de l'API REST (URL ci-dessus)
