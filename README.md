# DMS Prod — site (maquette V0.1)

Site vitrine de l'association **DMS Prod**. [Astro](https://astro.build) 7, 100 % statique, sans framework CSS ni JS côté client (à part quelques lignes pour le thème, le menu mobile et les animations).

> **Statut : maquette locale.** Contenus fictifs (lorem ipsum), `noindex`, pas de dépôt git, pas de déploiement.

## Lancer la maquette

Prérequis : Node 22.23.4 ou plus récent.

```powershell
./mockup.ps1            # serveur de dev avec rechargement auto : http://localhost:4321
./mockup.ps1 preview    # build puis sert dist/ (le rendu réel, brouillons exclus)
./mockup.ps1 build      # génère seulement dist/
./mockup.ps1 brand      # régénère les fichiers de la charte depuis brand/source/
./mockup.ps1 clean      # supprime dist/, .astro/ et node_modules/
```

Si PowerShell refuse le script : `pwsh -ExecutionPolicy Bypass -File ./mockup.ps1`.

## Charte : noir et or

- **Thème sombre par défaut** (fond noir, or). Le bouton soleil/lune bascule sur un thème clair ivoire et bronze, mémorisé dans le navigateur.
- Titres en **Cinzel** (capitales romaines, proches du logo), texte en **Inter**. Polices hébergées avec le site.
- Couleurs : jetons `--accent`, `--gold` et `--metal-*` en haut de `src/styles/global.css`.
- **Fichiers d'origine** dans `brand/source/` (logos et bannières). `tools/brand.mjs` en tire :
  - `src/assets/brand/logo.png` : écusson plein **détouré** (les logos reçus sont des JPG avec un damier incrusté, pas de vraie transparence) ;
  - `src/assets/brand/banniere-scene.jpg` : bannière d'accueil, servie par Astro en AVIF/WebP à la bonne taille selon l'écran ;
  - `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/og-image.jpg` (aperçu des partages sur les réseaux).
- Bannière d'accueil : la version « scène rock ». La version « bar » reste disponible dans `brand/source/`.

## Où est quoi

```
src/content/news/AAAA-MM-JJ-titre.md   une actualité = un fichier Markdown
src/data/site.json                     nom, mails, réseaux, HelloAsso, mentions légales
src/data/groups.json                   les groupes (résumé, logo, liens officiels)
src/content.config.ts                  schémas : le build échoue si un fichier est mal rempli
public/uploads/                        TOUTES les images éditoriales (dossier média unique)
src/styles/global.css                  jetons de couleur (clair/sombre), mise en page
src/pages/                             les pages (une route = un fichier)
src/lib/navigation.ts                  le menu
```

## Écrire une actualité

Créer `src/content/news/2026-12-01-titre-court.md`. L'URL sera `/actualites/titre-court/` (la date du nom de fichier ne sert qu'au tri).

```markdown
---
title: Titre de l'article
date: 2026-12-01
summary: "Une ou deux phrases, 220 caractères maximum."
tags: [concert, vie-associative]
groups: [stoneheart]
cover: /uploads/mon-image.jpg
coverAlt: Description de l'image
draft: false
---

Le contenu en **Markdown** : titres, listes, liens, images, citations, tableaux.
```

- `tags` : libres, en minuscules, avec des tirets au lieu des espaces. Chaque tag crée sa page `/actualites/tag/xxx/`.
- `groups` : identifiants de `groups.json` (`stoneheart`, `distorted-memory`). Un identifiant inconnu fait échouer le build.
- `draft: true` : visible en dev, absent du site généré.
- **Piège YAML** : une valeur qui contient « `: ` » doit être entre guillemets (`summary: "Ceci : cela"`).

## Compatibilité avec une édition sur GitHub ou un CMS Git

Les fichiers ont été pensés pour être édités à la main sur github.com, ou plus tard via un CMS Git (Pages CMS, Sveltia CMS, Decap CMS), sans rien changer :

- en-têtes plats : chaînes, date, booléen, listes de chaînes. Pas d'objet imbriqué dans les actualités ;
- un seul dossier média (`public/uploads/`), référencé par des chemins absolus `/uploads/...` ;
- données du site et des groupes en JSON simple ;
- validation au build : une erreur de saisie est bloquée avant la mise en ligne.
