# Site du CEE · Club Étudiants Entrepreneurs (IUT de Nîmes)

Landing page bilingue FR/EN du club, en ligne sur **https://cee-nime.vercel.app** (URL du QR code des affiches : elle ne doit jamais changer).
Site statique : HTML, CSS et JavaScript, sans framework, sans dépendance, sans cookie ni traceur.
Identité « Le Déclic » : noir #0E0E0E, orange #FF5A1F, papier #F4F1EA, gris #8C8C8C. Typos Anton (titres) et Inter (textes), auto-hébergées.

## Arborescence

```
index.html                 page unique : accueil, le club, bureau, talks, conférence, rejoindre, réseaux
mentions-legales.html      mentions légales et données personnelles (RGPD), FR/EN
404.html                   page introuvable
assets/config.js           À REMPLIR : URL du formulaire, lien WhatsApp, réseaux, mail
assets/style.css           styles (source lisible)      -> assets/style.min.css (généré)
assets/i18n.js             textes anglais (source)      -> assets/app.min.js (généré)
assets/main.js             comportements (source)       -> assets/app.min.js (généré)
assets/fonts/              Anton et Inter, sous-ensemble latin (woff2)
assets/img/                logos SVG optimisés, mascotte et fonds en WebP (plusieurs tailles)
favicon.*, icon-*.png, apple-touch-icon.png, site.webmanifest, og-image.jpg (partage 1200x630)
robots.txt, sitemap.xml, vercel.json (en-têtes de cache et de sécurité, URL sans .html)
outils/build.mjs           minifie CSS et JS, met à jour les empreintes ?v= des pages
outils/serveur-local.py    serveur de test qui imite Vercel (URL propres, page 404)
google-apps-script/        script qui enregistre les inscriptions dans un Google Sheets
_a-supprimer/              anciens fichiers remplacés (non publiés, non versionnés)
```

## Modifier le site

- **Textes français** : directement dans les pages HTML. Chaque élément traduisible porte `data-i18n="cle"`.
- **Textes anglais** : dans `assets/i18n.js` (même clé). Ajouter un texte = l'attribut dans le HTML + la clé dans `CEE_EN`.
- **Après toute modification de `style.css`, `i18n.js`, `main.js` ou `config.js`**, régénérer les fichiers minifiés :
  ```
  node outils/build.mjs
  ```
  (Node 18+ ; télécharge esbuild via npx au premier lancement.) Puis commit et push : Vercel redéploie tout seul.
- **Tester en local** : `python outils/serveur-local.py` puis http://localhost:8765

## À brancher

- `assets/config.js` : `formEndpoint` (URL Apps Script), `whatsapp`, `instagram`, `linkedin`, `youtube`, `mail`.
  Tant qu'une valeur est vide, le lien correspondant reste inactif et le formulaire affiche « les inscriptions ouvrent bientôt ».
  Après modification : `node outils/build.mjs` (met à jour l'empreinte de cache de config.js).
- Formulaire : voir `google-apps-script/inscriptions.gs` (étapes en tête de fichier). Champs envoyés : prenom, nom, email, departement, langue, date.
- Liste des départements : dans le `<select name="departement">` de `index.html` (et la traduction dans `i18n.js`).
- Talks : à chaque sortie, remplacer le bloc du talk (nom, sujet) et ajouter le lien YouTube.
- Photos du bureau : remplacer l'image mascotte de chaque `.member__ph` par la photo (WebP, 480 px de large).
- Conférence : quand la date exacte et la salle sont connues, compléter aussi le JSON-LD `Event` dans le `<head>` de `index.html` (`startDate` au format AAAA-MM-JJ).

## Textes attendus du club

Tous les emplacements `[À fournir : ...]` (classe `.todo`, hachurés à l'écran) : voir le document `_a-envoyer-au-club/CEE_Site_textes-a-fournir.docx`.

## Contraintes

- Aucun cookie, aucun traceur. Seul le choix de langue est stocké en localStorage.
- Accessibilité WCAG AA : contrastes de la charte, focus visible, lien d'évitement, `prefers-reduced-motion` respecté.
- Pas de tiret cadratin dans les textes. Ne jamais inventer de contenu : les textes viennent du club.
