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
merci.html            Page de remerciement (repli FormSubmit, non indexée)
robots.txt, sitemap.xml, site.webmanifest, favicon.ico, apple-touch-icon.png
```

## Modifier

- **Couleurs** : variables `--tekno-*` (bleu principal), `--toshiba-*` et `--vmi-*` au début de `assets/css/style.css`.
- **Liens vers les sites** : rechercher `pilotech.eu`, `pilotech-toshiba.com` et `pilotech-vmi.fr` dans `index.html`
  (en-tête, hero, cartes, pied de page et JSON-LD).
- **Préchargeur** : il s'affiche une fois par session (clé `pilotech-portail` dans sessionStorage).
  Il ne s'affiche pas si l'utilisateur a demandé à réduire les animations.

## Contact et avis

- **Barre mobile** (écrans de moins de 768 px) : boutons « Téléphoner » (`tel:`) et « E-mail ».
  Le bouton E-mail ouvre une fenêtre avec nom, e-mail et message, envoyée par FormSubmit à `info.pilotech@gmail.com`
  (attribut `action` du formulaire `#contact`). Si l'envoi direct échoue, le formulaire est envoyé classiquement
  et FormSubmit redirige vers `merci.html`. Au tout premier envoi depuis un nouveau domaine, FormSubmit peut
  demander de confirmer l'adresse par e-mail (lien « Activate form » à cliquer une fois).
- **Formulaire de devis** (section `#devis`, sous les avis) : nom, téléphone, e-mail, ville, solution envisagée,
  message et consentement, envoyé par FormSubmit à la même adresse, objet « Demande de devis : portail pilotech.eu ».
- **Avis Google** : note moyenne (5,0 sur 82 avis) dans le hero, le bandeau et la section « Avis clients ».
  Pour mettre à jour la note ou le nombre d'avis, rechercher « 82 avis » et « 5,0 » dans `index.html`.
  Les 12 avis du carrousel sont des citations réelles reprises de `_data/reviews.yml` (dépôt pilotech).
  Le carrousel avance toutes les 5 secondes ; il s'arrête dès que l'on touche, fait glisser ou utilise les flèches,
  et reprend avec le bouton « Lecture ». Il fait aussi une pause au survol de la souris.

## À savoir

- Le visuel IDRA Next Ring du hero est chargé depuis le CDN Squarespace du site Teknopoint actuel
  (même adresse que dans le dépôt pilotech). Pour ne plus dépendre de Squarespace, enregistrer ce PNG dans `assets/img/`
  et changer le `src` de `.hero-product img`. Si l'image ne charge pas, le bloc produit est simplement masqué.
- L'URL canonique est `https://www.pilotech.eu/`. Tant que pilotech.eu héberge le site Teknopoint (Squarespace),
  le lien « Climatisation invisible » y renvoie. Le jour où ce portail prendra le domaine pilotech.eu,
  il faudra donner une nouvelle adresse au site Teknopoint et mettre ce lien à jour.
- La photo du hero (séjour avec IDRA dans l'îlot) a été fournie par Pilotech. Les photos des cartes viennent des sites Toshiba et VMI ; les appareils visibles ont été retirés pour poser par-dessus
  les visuels produits détourés.
