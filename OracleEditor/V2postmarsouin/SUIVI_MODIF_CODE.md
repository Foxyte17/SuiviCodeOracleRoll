# Suivi des modifications Code

> Document de relais entre agents codeurs.
> Contient les derniers choix de code et les agents responsables par ordre chronologique.

---

## Convention de nommage

Les rapports échangés entre agents utilisent le format :
`NOMDOC_@MODELE_DEST.md`

Exemples :
- `RAPPORT_@claude_codeur.md` — rapport destiné à Claude Codeur
- `SUIVI_@mimo_debug.md` — suivi destiné à Mimo V2.5 Debug
- `CORRECTION_@bigpickle_a.md` — correction destinée à Big Pickle A

---

## Informations projet (fusionnées)

### Architecture OracleRoll

- **Type** : Application web hors-ligne (HTML/CSS/JS vanilla, zéro dépendance)
- **Cible** : Tablette Android
- **Dépôt** : `Foxyte17/OracleRoll`
- **Structure** : `index.html` + 7 CSS + 14 JS

### Architecture Éditeur de cartes

- **Type** : Outil vanilla (HTML/CSS/JS, zéro build)
- **Format** : `CARDS_SPECS` figé, ne pas modifier
- **Dépôt** : `Foxyte17/editeur-de-carte`
- **Fichiers** : `index.html` + `css/` + `js/` (core, utils, modules, image, render, export)
- **Branche/version de référence : `V1.5Marsouin`.** Version fonctionnelle dont les éléments visuels ont été validés par l'utilisateur — c'est le code « propre » auquel se référer en priorité pour tout travail sur l'éditeur de cartes. Des modifications ultérieures y seront apportées, mais elle reste la base de comparaison par défaut (pas `V1`).

### Format d'échange (CARDS_SPECS)

```json
{
  "format": "CARDS_SPECS",
  "deck": {
    "name": "Nom du deck",
    "cards": [
      { "id": "card-1", "name": "Nom de la carte", "image": "data:image/png;base64,..." }
    ]
  }
}
```

### Décision architecturale — cache des decks GitHub (2026-08-02)

- **Cache image : en mémoire, session uniquement.** Confirmé par l'utilisateur. Pas de persistance entre sessions (`localStorage`/IndexedDB) — cohérent avec la décision « pas de cache persistant » déjà actée pour l'intégration GitHub.
- État actuel du code (`deck-engine.js`) : le tableau `githubDecks` fait déjà office de cache mémoire pour les **manifests** (dédoublonné par `manifestUrl` dans `registerGithubDeck`, perdu au rechargement de la page — conforme).
- **Item de roadmap clos, sans développement (2026-08-02).** Un cache applicatif dédié pour les images (`Map<url, blob>` ou équivalent) n'est pas nécessaire : usage réel = un deck chargé une fois puis consulté ponctuellement pendant 1-2h de session sans rechargement de page, chaque image étant un résultat consulté puis quitté (logique proche d'un tirage de table, pas d'un affichage permanent). Le cache HTTP natif du navigateur suffit déjà à éviter tout re-téléchargement d'une image déjà vue sur `raw.githubusercontent.com` (même URL = pas de nouvelle requête réseau tant que l'onglet reste ouvert). Ajouter un cache applicatif serait de la complexité sans gain d'usage démontré — contraire au principe « pas de réécriture sans nécessité démontrée ». **Décision : aucun développement à faire sur ce point.**
- **Storage / IndexedDB : point clos définitivement (2026-08-02).** Ne plus rouvrir ce sujet sauf nécessité nouvelle et démontrée (volume de données, limite `localStorage` effectivement atteinte). L'architecture reste 100% `localStorage` + GitHub distant sans cache persistant.

---

## Corrections effectuées

### 2026-07-31 14:30 — 🟤 Big Pickle A (A1)
**Fichiers** : `js/core/utils.js`, `js/modules/oracle/oracle-engine.js`, `js/modules/oracle/oracle-ui.js`, `js/modules/editor/editor.js`, `js/modules/deck/deck-ui.js`, `js/modules/battlemap/battlemap-ui.js`
**Correctif** : Échappement HTML des contenus utilisateur
**Raison** : Textes avec `<` ou `&` cassaient l'affichage ; risque XSS
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\core\utils.js` + 5 autres fichiers

### 2026-07-31 14:35 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/dice/dice-engine.js`
**Correctif** : Modificateur appliqué en mode Séparation
**Raison** : Modificateur silencieusement ignoré en mode Séparation
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\dice\dice-engine.js`

### 2026-07-31 14:40 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/deck/deck-engine.js`
**Correctif** : Suppression code mort `jokersRemoved`
**Raison** : Variable initialisée mais jamais utilisée
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\deck\deck-engine.js`

### 2026-08-01 14:30 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/editor/editor.js`
**Correctif** : Ré-import des tables avec mise à jour (écrasement des existantes de même id) + rappel de `updateAppStats()` après import + message de statut « X ajoutée(s), Y mise(s) à jour »
**Raison** : Une table de même id était silencieusement ignorée à l'import (message « N importées » alors que 0) ; le compteur en bas de page restait faux après import
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\editor\editor.js`

### 2026-08-01 14:35 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/editor/editor.js`
**Correctif** : Export complet - univers custom ET personalisés, avec `icon` et `builtIn`
**Raison** : L'export n'incluait ni les univers de base personnalisés (renommés / icône modifiée) ni les icônes - perte silencieuse de personnalisation au transfert
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\editor\editor.js`

### 2026-08-01 14:40 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/editor/editor.js`
**Correctif** : Clés de colonnes unifiées - nouveau helper `makeColumnKey` (slugify + dédoublonnage + mots réservés `all`/`mixed` via `RESERVED_COLUMN_KEYS`), utilisé dans `createEditorGrid` et `addColumnToDraft`
**Raison** : L'ancienne génération locale produisait des doublons (« Action, action »), des underscore en trop (« Lieu ! » → `lieu_`) et des collisions avec les options « Résultat complet » / « Aléatoire »
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\editor\editor.js`

### 2026-08-01 14:45 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/oracle/oracle-engine.js`
**Correctif** : Robustesse du tirage Oracle - la table capturée `t` est passée à `finishOracleRoll` / `finishOracleRollMixed` (signatures `(roll, t)` / `(finalRolls, t)`, fallback `if (!t) t = currentTable`)
**Raison** : Changer de table pendant l'animation (~1 s) pouvait viser une table inconnue et provoquer une erreur, en mode simple et mixte
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\oracle\oracle-engine.js`

### 2026-08-01 14:50 — 🟤 Big Pickle A (A1)
**Fichiers** : `js/modules/deck/deck-ui.js`, `js/modules/dice/dice-engine.js`
**Correctif** : Cohérences UI - restauration du select univers seulement si `universes[previous]` existe ; faces de dé personnalisé bornées `Math.min(1000, Math.max(2, parseInt(...) || 2))`
**Raison** : Le select pouvait restaurer une valeur disparue ; la saisie « 0 » ou négative produisait un dé à 1 face
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\deck\deck-ui.js` + `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\dice\dice-engine.js`

### 2026-08-01 14:55 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/battlemap/battlemap-engine.js`
**Correctif** : Suppression des doublons `bmColLetter` et `bmDistToSegment` (restent définis dans `js/core/utils.js`)
**Raison** : Fonctions définies deux fois à l'identique - code mort
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\battlemap\battlemap-engine.js`

### 2026-08-02 — 🟠 Claude Codeur (A1) — Validation croisée V1 → V2 (`SuiviCodeOracleRoll` GitHub)
**Fichiers** : tous les fichiers modifiés listés ci-dessus, comparés `OracleRoll/V1oracleroll` → `OracleRoll/V2oracleroll`
**Constat** : les 6 correctifs de la table ci-dessous sont **confirmés présents et conformes** à leur description dans le code réel (diff ligne à ligne). Statut passé de « en attente de validation » à **« Validé (revue de code) »** — reste la validation fonctionnelle navigateur (5 onglets) à la charge de l'utilisateur.
**Constat additionnel non documenté trouvé au passage** : `escapeHtmlText` était dupliquée dans `deck-ui.js` en plus de sa définition dans `utils.js` ; la version V2 ne conserve que celle de `utils.js`. Fonctionnellement correct, mais ce nettoyage n'était pas tracé dans ce document — ajouté ici a posteriori pour la traçabilité.

---

### 2026-08-02 — 🟠 Claude Codeur (A1) — Uniformisation des textes (chantier « ajustements rapides »)
**Périmètre analysé** : tous les fichiers `.html`/`.js` de `OracleRoll/V2oracleroll` (référence de travail = dernier état validé du dépôt `SuiviCodeOracleRoll`)
**Constat 1 — tirets cadratins « — » résiduels** : la règle « pas de « — », utiliser « - » » (confirmée en vigueur le 2026-08-02) n'est pas encore appliquée partout. **12 occurrences** trouvées dans le texte utilisateur (hors commentaires de code) :
| Fichier | Ligne | Texte concerné |
|---|---|---|
| `index.html` | 157 | "pour l'instant — elles pourront" |
| `index.html` | 230 | "Deck image — GitHub" (titre de section) |
| `index.html` | 239 | "pour l'instant — crée-en un" |
| `js/modules/editor/editor.js` | 132 | `<span class="meta">— ${...} table...</span>` |
| `js/modules/editor/editor.js` | 348 | `<span class="meta">— D${t.dice}</span>` |
| `js/modules/deck/deck-ui.js` | 92 | "Plus de cartes — lance une nouvelle session." |
| `js/modules/deck/deck-ui.js` | 322 | `<span class="meta">— ${universeLabel} · ...</span>` |
| `js/modules/oracle/oracle-ui.js` | 141 | favoris : `<span>— ${universeLabel}</span>` |
| `js/modules/dice/dice-engine.js` | 48 | "lancers séparés" — préfixe `${count}D${sides} — lancers séparés` |
| `js/modules/dice/dice-engine.js` | 61 | mode addition : `[...] — ${maxV} - ${minV}` (⚠️ la même ligne contient déjà un tiret simple pour "maxV - minV" : incohérence interne à la ligne) |
| `js/modules/dice/dice-engine.js` | 65 | "avantage — garde le meilleur" / "désavantage — garde le pire" |
| `js/modules/dice/dice-engine.js` | 68 | `[...] — ${label} (${kept})` |

**Décision utilisateur (2026-08-02)** : la règle « — → - » est limitée aux commentaires CSS (voir constat 2). Ces 12 occurrences en texte joueur **restent inchangées**, conservées en « — ».

**Constat 2 — tirets restants dans les fichiers CSS** : 9 occurrences de « — » trouvées, uniquement dans des **commentaires de code** (`base.css`, `components.css`, `battlemap.css`, `deck.css`, `dice.css`, `editor.css`, `oracle.css` — ex. `/* Responsive — tablette */`).

**Constat 3 — points de suspension incohérents** : deux graphies coexistaient dans le texte joueur : le caractère typographique « … » (3 occurrences : `index.html` l.428, l.486, et `deck-ui.js` l.160 - "Chargement du deck…") contre trois points ASCII « ... » (1 occurrence réelle de texte : `index.html` l.329, placeholder "Post-apo..."). Le reste du diagnostic (apostrophes, espaces avant `:`, casse des boutons, guillemets) était déjà homogène, rien à signaler dessus.

**Décisions utilisateur (2026-08-02)** :
1. La règle « pas de « — » » s'applique **uniquement aux commentaires CSS** (constat 2) — les **12 occurrences en texte joueur (constat 1) restent inchangées, en « — »**. Les 9 occurrences CSS sont à convertir en « - ».
2. Points de suspension : uniformisation validée sur **l'ASCII « ... »** — les 3 occurrences en « … » sont à convertir.

**Statut : correctifs prêts à appliquer**, livrés dans `PATCH_UNIFORMISATION_TEXTES.md` (liste complète file/ligne/avant/après pour les 9 tirets CSS + les 3 points de suspension).

| Priorité | Sujet | Fichier | Agent | Statut |
|----------|-------|---------|-------------|--------|
| 1 | Ré-import tables avec mise à jour | `js/modules/editor/editor.js` | 🟤 Big Pickle A (A1) | **Validé (revue de code) 2026-08-02** |
| 2 | Export icônes et univers personnalisés | `js/modules/editor/editor.js` | 🟤 Big Pickle A (A1) | **Validé (revue de code) 2026-08-02** |
| 3 | Fiabilité tirage Oracle (changement table) | `js/modules/oracle/oracle-engine.js` | 🟤 Big Pickle A (A1) | **Validé (revue de code) 2026-08-02** |
| 4 | Clés de colonnes dupliquées | `js/modules/editor/editor.js` | 🟤 Big Pickle A (A1) | **Validé (revue de code) 2026-08-02** |
| 5 | Incohérences d'interface (3 sous-points) | Divers | 🟤 Big Pickle A (A1) | **Validé (revue de code) 2026-08-02** |
| 6 | Fonctions dupliquées | `js/core/utils.js`, `js/modules/battlemap/battlemap-engine.js` | 🟤 Big Pickle A (A1) | **Validé (revue de code) 2026-08-02** |

> Note : validation par revue de code effectuée par 🟠 Claude Codeur (A1) le 2026-08-02 sur la base du dépôt `SuiviCodeOracleRoll`. Il reste à l'utilisateur la **validation fonctionnelle en navigateur** (5 onglets) pour clore définitivement ce lot.

---

## Anomalies détectées hors périmètre des 6 correctifs — tranchées (2026-08-02, arbitrage utilisateur)

Trouvées en comparant `V1oracleroll` → `V2oracleroll`, non tracées dans ce document au moment de la détection. Statut après arbitrage :

1. **Tirets cadratins « — » → tirets simples « - »** (`deck-engine.js`, `index.html`) : **volontaire, règle de convention typographique du projet, toujours en vigueur.** Ne plus signaler comme anomalie à l'avenir — c'est la norme attendue sur tout le texte de l'app (à rapprocher de l'item « Uniformiser tous les textes de l'application » des ajustements rapides restants).
2. **Changements visuels Battlemap** (`battlemap.css`, `battlemap-ui.js` — grille, bordures, police et contour des pions) : **fait via un agent A1, validé par l'utilisateur.** Clos.
3. **Renommage `oracleroll.html` → `index.html`** : **volontaire, uniformisation.** Clos.

---

## Suggestions Éditeur de cartes (transmises)

| Priorité | Sujet | Fichier | Agent cible | Statut |
|----------|-------|---------|-------------|--------|
| A1 | Titre écrasé sans ellipse | `js/render/engine.js` | 🟠 Claude Codeur (B1) | Transmis |
| A2 | Encart description trop étroit | `js/render/engine.js` | 🟠 Claude Codeur (B1) | Transmis |
| A3 | Auto-shrink borné à 12px sans troncature | `js/render/engine.js` | 🟠 Claude Codeur (B1) | Transmis |
| A4 | Position encart limitée gauche/droite | `js/render/engine.js` | 🟠 Claude Codeur (B1) | Transmis |
| A5 | Polices système non garanties | `js/render/engine.js`, `css/base.css` | 🟠 Claude Codeur (B1) | Transmis |
| A6 | Encart centré peut chevaucher illustration | `js/render/engine.js` | 🟠 Claude Codeur (B1) | Transmis |
| A7 | Badge icône toujours présent | `js/render/engine.js`, `js/core/icons.js` | 🟠 Claude Codeur (B1) | Transmis |
| B1 | Qualité visuelle inégale (icônes) | `js/core/icons.js` | 🟠 Claude Codeur (B1) | Transmis |
| B2 | Incohérence stroke/fill | `js/core/icons.js` | 🟠 Claude Codeur (B1) | Transmis |
| C1 | Logique dupliquée import legacy | `js/image/import.js`, `js/export/export.js` | 🟠 Claude Codeur (B1) | Transmis |
| C2 | Race condition drag cadrage | `js/image/crop.js`, `js/image/import.js` | 🟠 Claude Codeur (B1) | Transmis |
| C3 | renderCropBox instancie new Image à chaque appel | `js/image/crop.js` | 🟠 Claude Codeur (B1) | Transmis |
| C4 | Échappement HTML partiel | `js/modules/decks.js` | 🟠 Claude Codeur (B1) | Transmis |
| C5 | Validation absente (nom carte/deck) | `index.html` | 🟠 Claude Codeur (B1) | Transmis |

> Confirmé 2026-08-02 par l'utilisateur : `OracleEditor/V1.5Marsouin` est la **version de référence** (visuel validé), à privilégier sur `V1` pour tout travail futur sur l'éditeur de cartes (cf. section « Architecture Éditeur de cartes » en tête de document). `js/core/icons.js` et `js/render/engine.js` y diffèrent de `V1` (un `engine.js.bak` est aussi présent) — cohérent avec le fait que les items A1-A7/B1-B2 transmis à B1 y sont en cours de traitement. Aucune vérification de contenu détaillée faite ici, hors périmètre A1.

---

## Items écartés (pour mémoire)

- Persistance localStorage : écarté (sessions uniques)
- Responsive / accessibilité : écarté (éditeur de cartes PC, usage personnel)
- Mode clair/sombre : écarté
- Undo/redo : écarté
- Performance iconToSvg : écarté (11 icônes, usage local)
- Tooltip tactile : écarté
- Labels FR uniquement : écarté
- Duplication/réordonnancement cartes : en cours côté Designer

---

*Document créé par 🔵 Mimo V2.5 Orga — 2026-08-01 15:08*
*Mis à jour par 🟤 Big Pickle A (A1) — 2026-08-01 15:08 : ajout des 6 fixes et mise à jour des suggestions.*
*Mis à jour par 🟠 Claude Codeur (A1) — 2026-08-02 : validation croisée des 6 correctifs sur `SuiviCodeOracleRoll` (V1→V2), décision cache deck GitHub actée (mémoire, session uniquement), anomalies hors périmètre signalées.*
*Mis à jour par 🟠 Claude Codeur (A1) — 2026-08-02 (2e passe) : item cache image clos sans développement (couvert par le cache HTTP navigateur) ; 3 anomalies tranchées par l'utilisateur (tirets = règle typographique en vigueur, battlemap = validé, renommage index.html = volontaire) ; `V1.5Marsouin` confirmée comme version de référence de l'éditeur de cartes.*
*Mis à jour par 🟠 Claude Codeur (A1) — 2026-08-02 (3e passe) : storage/IndexedDB clos définitivement ; diagnostic complet d'uniformisation des textes.*
*Mis à jour par 🟠 Claude Codeur (A1) — 2026-08-02 (4e passe) : décisions finales sur l'uniformisation (règle « — → - » limitée au CSS, points de suspension uniformisés en ASCII) ; nettoyage du résidu obsolète sur le cache image (item invalidé, non retenu) ; correctifs livrés dans `PATCH_UNIFORMISATION_TEXTES.md`.*
