# Pilotech : page d'accueil (portail)

Page d'entrée unique vers les trois sites Pilotech :

| Solution | Où se trouve-t-elle sur la page | Lien |
|---|---|---|
| Climatisation invisible Teknopoint | Hero (plein écran) | https://www.pilotech.eu/ |
| Climatisation et pompes à chaleur Toshiba | Carte de gauche | https://pilotech-toshiba.com/ |
| Ventilation par insufflation VMI | Carte de droite | https://pilotech-vmi.fr/ |

Le site est entièrement statique : HTML, CSS et JS, sans étape de build ni dépendance. Il fonctionne tel quel sur GitHub Pages.

## Fichiers

```
index.html            Page unique, métadonnées SEO, Open Graph et données structurées (schema.org)
assets/css/style.css  Styles et animations (couleurs en variables en haut du fichier)
assets/js/main.js     Préchargeur, apparitions au défilement, parallaxe, inclinaison des cartes
assets/img/           Photos d'intérieur, visuels produits détourés, logo, image de partage (og-pilotech.jpg)
assets/fonts/         IBM Plex Sans et IBM Plex Sans Condensed (auto-hébergées)
robots.txt, sitemap.xml, site.webmanifest, favicon.ico, apple-touch-icon.png
```

## Modifier

- **Couleurs** : variables `--tekno-*` (bleu principal), `--toshiba-*` et `--vmi-*` au début de `assets/css/style.css`.
- **Liens vers les sites** : rechercher `pilotech.eu`, `pilotech-toshiba.com` et `pilotech-vmi.fr` dans `index.html`
  (en-tête, hero, cartes, pied de page et JSON-LD).
- **Préchargeur** : il s'affiche une fois par session (clé `pilotech-portail` dans sessionStorage).
  Il ne s'affiche pas si l'utilisateur a demandé à réduire les animations.

## À savoir

- Le visuel ELFO du hero est chargé depuis le CDN Squarespace du site Teknopoint actuel. Pour ne plus dépendre
  de Squarespace, enregistrer ce PNG dans `assets/img/` et changer le `src` de `.hero-product img`.
  Si l'image ne charge pas, le hero reste propre : le bloc produit est simplement masqué.
- L'URL canonique est `https://www.pilotech.eu/`. Tant que pilotech.eu héberge le site Teknopoint (Squarespace),
  le lien « Climatisation invisible » y renvoie. Le jour où ce portail prendra le domaine pilotech.eu,
  il faudra donner une nouvelle adresse au site Teknopoint et mettre ce lien à jour.
- Les photos d'intérieur viennent des sites Toshiba et VMI ; les appareils visibles ont été retirés pour poser par-dessus
  les visuels produits détourés.
