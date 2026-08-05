# Suivi des modifications — OracleRoll

> Document de relais entre agents codeurs.
> Contient les derniers choix de code et les agents responsables par ordre anti-chronologique (plus récent en haut).

---

### 2026-08-05 20:25 — 🔵 Z.AI — Icônes races (découpage, VLM, 256x256), finalisation 9 chantiers

**Contexte** : reprise du travail de l'agent précédent (Big Pickle B). 8 des 9 chantiers étaient déjà implémentés dans le code (Âge texte, bouton Règles, médaillons grand, stats compactes, 4 races, dndRaceImg, branchement oracle). Le seul manquant : les fichiers image `assets/races/*.jpg`.

**Travail effectué :**
- Découpage du sprite sheet `yuriy-chuprov-races.jpg` (1253x1644, grille 6x6 = 36 cellules ~208x274px) en 36 crops.
- Planche contact numérotée générée (`contact-sheet-races.jpg`) et analysée par VLM (glm-5v-turbo) pour identifier les correspondances.
- Double vérification VLM sur les 4 nouvelles races (Argonien #17, Catthar #18, Bouquenar #26, Minorog #27) + 4 classiques (#5 Halfelin, #6 Gnome, #7 Tieffelin, #8 Demi-orc) = toutes confirmées.
- 13 icônes redimensionnées en 256x256 JPEG q80 (~8-12 Ko chacune) dans `assets/races/`.

**Correspondance sprite -> race (fichier source : yuriy-chuprov-races.jpg) :**
| # | Cellule | Race | Fichier |
|---|---------|------|--------|
| 1 | r1c1 | Humain | humain.jpg |
| 2 | r1c2 | Elfe | elfe.jpg |
| 3 | r1c3 | Demi-elfe | demi-elfe.jpg |
| 4 | r1c4 | Nain | nain.jpg |
| 5 | r1c5 | Halfelin | halfelin.jpg |
| 6 | r1c6 | Gnome | gnome.jpg |
| 7 | r2c1 | Tieffelin | tieffelin.jpg |
| 8 | r2c2 | Demi-orc | demi-orc.jpg |
| 9 | r3c3 | Drakéide | drakeide.jpg |
| 17 | r3c5 | Argonien | argonien.jpg |
| 18 | r3c6 | Catthar | catthar.jpg |
| 26 | r5c2 | Bouquenar | bouquenar.jpg |
| 27 | r5c3 | Minorog | minorog.jpg |

**Vérifications :**
- `node --check` OK sur dnd-data.js, oracle-engine.js, char-gen.js, dnd-adventure.js.
- Harnais rapide : DND_RACES=13, RACE_DETAILS=13, RACE_IMAGES=13, CLASSES=12, CLASS_IMAGES=12, 13/13 race files exist, 12/12 class files exist.
- Table oracle races : dice=13, 13 rows toutes avec img.
- Table oracle classes : dice=12, 12 rows toutes avec img.

**Note :** #26 (Bouquenar) est identifié comme « Kobold » dans le sprite original (texte russe), mais les cornes courbées conviennent pour un Bouquenar (cornes de bouc/montagnard).

---

### 2026-08-05 13:57 — 🟤 Big Pickle B — 4 chantiers post-module : mort définitive, icônes classes, intro oracle, checklist textes (harnais 112/112)

**Contexte** : suite de la validation du module D&D-like. 4 chantiers demandés par l'utilisateur, tous livrés et vérifiés automatiquement.

Chantiers 1-4 vérifiés (harnais 112/112), trace mise à jour. Voici le chantier 5 - checklist des textes D&D (fichier:ligne + texte actuel) :

Checklist des textes joueurs D&D
Modale Règles + bandeau — index.html
l.228 bandeau : « Tire tes caractéristiques (4D6, garde les 3 meilleurs), choisis race, classe et 3 sorts de niveau 1, équipe-toi en boutique, puis commence l'aventure. »
l.374 titre : « Règles du système D&D-like »
l.378-393 8 sections : caractéristiques / tirage (4D6 + répartition) / tests (1D20 + mod ≥ seuil 10/15/20) / PV & CA / combat (à 0 PV inconscient) / sorts (3 sorts niv 1, déblocage 2-9) / or (boutique, auberge, marchandage) / aventure (Chapitres vs Quêtes, progression, chrono)
Boutons / interfaces — index.html
l.229 aria/title « Consulter les règles » ; l.375 & 402 « × »
l.413 « Exporter (JSON) » / l.414 « Reprendre » (pause, l.410-411 « Aventure en pause » + « La page est figée. Exporte ta progression en l'état ou reprends l'aventure. »)
l.421 « Attaque surprise ! », l.427 « 45 », l.429 « Agis avant la fin du compte à rebours ! »
l.436 « Fin de l'aventure », l.437 « c'est la fin de ton aventure... tout le monde ne peut pas survivre dans ce monde. », l.439 « Nouvel aventurier », l.440 « Retour à l'accueil »
Sorts — dnd-data.js (54 sorts, l.167-224)
33 sorts niv 1 (l.169-200), 11 niv 2 (l.203-213), 10 niv 3 (l.216-223). Exemples de libellés utilisateur : l.169 « Trois rayons infaillibles infligent 1D4+1 dégâts de force chacun. », l.187 « Les ennemis à 6 m sont Effrayés (échec SAG). », l.223 « Un faucon spirituel vous guide et vous alerte. »
Monstres — dnd-data.js l.138-159 (20 monstres SRD 5e)
ex. l.146 « Gobours » 39 PV / CA 15 / « Griffe » 2D4+2, l.158 « Tarrasque » 676 PV / CA 25 / « Morsure » 4D12+7
États / poisons / folie — dnd-data.js
l.98-111 12 états (« À terre », « Aveuglé »... l.104 « Étourdi : Perd son tour, échec auto des tests de FOR et DEX, avantage pour vos attaquants. »)
l.322-327 4 poisons (l.323 « Poison de base : La victime doit réussir un jet de CON (12) ou subir 1D4 dégâts de poison. »)
l.329-335 6 folies (l.333 « Le chant d'un ruisseau vous semble un cri d'alerte. »)
Événements chronométrés — dnd-data.js l.229-284 (6 urgences)
l.231-237 « Attaque surprise » 45 s / l.240 « Piège en déclenchement » 30 s / l.249 « Effondrement » 30 s / l.258 « Course-poursuite » 20 s / l.267 « Porte qui se referme » 15 s / l.276 « Naufrage » 40 s — chacun avec conséquences + 3 actions (« Fuir » DEX, « Combattre » FOR, « Parlementer » CHA...)
Scènes / quêtes — dnd-data.js
l.289-294 lieux (12), l.296-301 obstacles (12), l.303-307 PNJ (10), l.309-317 quêtes (7, ex. l.310 « Livraison en ville » — 10 PO, dc 12, social)
Boutiques — dnd-adventure.js l.18-51 (3 boutiques)
Armurerie (11 items, l.20-32) / Alchimiste (l.35-41 : « Potions de soin (x2) », « Antidote »...) / Marchand d'aventure (l.43-49)
Textes dynamiques — dnd-adventure.js
l.241 « Rencontre un monstre pour tester ton armement. », l.269 « Combat : un ... surgit ! », l.286 « Critique ! », l.290 « ... vaincu ! (+X PO) », l.316 « Tu es inconscient ! Le combat est perdu. »
l.520 « Choisis ton mode d'aventure : » + l.522 « Chapitres (oracle) » / l.523 « Quêtes »
l.551/671 « L'aventure est accomplie ! Ton héros entre dans la légende. »
l.570-576 scène A (« Vous êtes à ... / ... vous barre la route. ... vous observe. / Choisis une approche (jet contre 15) : » + boutons « Combattre (FOR) / Négocier (CHA) / Discrétion (DEX) »)
l.622-628 quête B (« Quête : / Récompense : ... - choisis une approche (jet contre X) : » + « Combattre / Négocier / Survie »)
l.385 « Maximum de sorts atteint (N). », l.499 « Dormir (10 PO) », l.507 « Nuit à l'auberge : repos complet, PV restaurés. »
l.537 confirm aventure : « Une fois l'aventure commencée, les boutiques ferment. Tu pourras dormir à l'auberge, marchander au fil du récit et mettre l'aventure en pause à tout moment. Confirmer ? »
La checklist est livrée en chat (fichier refusé). Tous les chantiers sont clos — il ne reste que la validation visuelle de ta part (médaillons JPG, intro oracle visible/masquée, modal de mort).


- **Chantier 1 — Mort définitive à 0 PV (terminé)** : dans `dnd-adventure.js`, `dndDamageChar()` pose `mort=true` à PV 0 et appelle `dndShowDeathModal()` (coupe le timer, vide le combat, ferme pause/timer/spell overlays, écrit au journal) ; gardes `mort` dans `dndHealChar`, `dndSleep`, `dndCheckLevelUp`, `dndStartCombat`, `dndLaunchAdventure` ; `dndRenderSheet()` re-déclenche la modal si `mort`/PV 0 (rechargement de vue) ; `dndReset()` masque l'overlay ; nouvelles fonctions `dndDeathNewCharacter()` (reset complet + régénération) et `dndDeathBackHome()` (retour univers). `index.html` : `#dnd-death-overlay` avec texte exact « c'est la fin de ton aventure... tout le monde ne peut pas survivre dans ce monde. » + 2 boutons. CSS `.dnd-death-*` (z-index 1003).
- **Chantier 2 — Icônes de classes (terminé)** : 12 JPG redimensionnés 256×256 (JPEG q80, ~5-7 Ko) générés dans `OracleRoll\assets\classes\` (noms ASCII `barbare|barde|clerc|druide|guerrier|magicien|moine|occultiste|paladin|rodeur|roublard|sorcier.jpg`). Sources originales 8417×8417 (fond dégradé bleu nuit non uniforme, coins blancs sur Wizard/Cleric) masqués par médaillon rond `object-fit:cover` + `border-radius:50%`. Rendu **partout** : table oracle `dnd-classes` (`rowIconSvg` → `<img>` si `row.img`), fiche (`dndClassImg()`), cartes détail (`buildDetailPanel`). Artificer écarté (12 classes). `DND_CLASS_IMAGES` ajouté dans `dnd-data.js` (après `DND_CLASS_DETAILS`).
- **Chantier 3 — Intro oracle (terminé)** : `<p id="oracle-intro">` inséré sous le titre dans `index.html` (« L'oracle tire des tables... Choisis un univers, tire une table, puis combine les tirages selon ton envie. ») ; masqué dans `openUniverse`, `openFavoriteTable` (oracle-ui.js), `openDeck` (deck-ui.js), `openCharGen` (char-gen.js), restauré dans `backToUniverses`. CSS `.oracle-intro`.
- **Chantier 4 — Vérification (terminé)** : `node --check` OK sur les 6 JS ; **harnais étendu 112/112** (11 nouveaux tests : 12 entrées `DND_CLASS_IMAGES`, fichiers existants dans `assets/classes/`, rows table Classes toutes avec `img`, `dndClassImg` renvoie `<img>`/retombe sur icône vide, mort → PV 0 + `mort=true` + état Inconscient + overlay `flex` + dégâts stoppés + soin bloqué).
- **Chantier 5 — Checklist textes** : livrée **dans le chat** (fichier refusé par l'utilisateur), avec fichier:ligne + texte actuel des textes joueurs D&D.
- **Règles appliquées** : règle « — → - » limitée aux commentaires CSS (textes joueurs inchangés) ; usage des emblèmes Wizards of the Coast validé (strictement personnel, non commercial) ; `assets/classes/` = JPG 256×256 + médaillon rond liseré laiton (option A utilisateur).

---

### 2026-08-05 13:39 — 🟤 Big Pickle B — Module D&D-like implémenté (phases 0-5) + harnais 101/101

**État : toutes les phases (0 → Vérification) sont implémentées et vérifiées automatiquement.**
- **Harnais** `char-gen-harness.js` : **101 passés, 0 échec** (univers 5, combos, bornes 4D6, hitDie, tables oracle, compétences/monstres/sorts ≥3 sorts niv 1 par classe, parsing dé, crit/fumble, CA, progression/niveau, génération 4D6, boutique, reset, import).
- **Correctifs en fin de phase** :
  - `dnd-data.js` : ajout des sorts de niveau 1 manquants - Guerrier (Cri de bataille, Posture défensive, Frappe précise) et Rôdeur (Marque de la proie, Piège à mâchoires) - chaque classe a désormais ≥3 sorts de niveau 1 (règle du manuel).
  - `char-gen.js` : `importCharacter()` ne réinitialise plus les PV à 0 (garde `undefined/null` seulement) - cas limite personnage inconscient à l'import.
  - `dnd-adventure.js` : `dndContinueAdventure()` affiche l'épilogue si progression ≥ 20 (fini de rejouer une scène après la victoire).
- **Vérifications finales** : `node --check` OK sur les 4 JS (dnd-adventure, char-gen, dnd-data, oracle-ui) ; grep « anciens globals » (DND_SHOP_ITEMS, DND_SPELLS_AVAILABLE/LOCKED, startAdventure, btn-start-adventure) → 0 référence dans l'appli, 4 restantes uniquement dans la maquette autonome `d&d-like/d&d-like.html` (jamais chargée, doublon documenté à ignorer).
- **Ordre de chargement** confirmé dans `index.html` : dnd-data.js → oracle-engine.js → char-gen.js → dnd-adventure.js.
- **Prochaine étape** : test visuel utilisateur (tirage → fiche → compétences/combat → sorts → boutique → aventure A/B → chrono 45s → pause/export) puis validation.

---

### 2026-08-05 13:28 — 🟤 Big Pickle B — Verdict honnête sur la complexité + justification 4D6 + garde-fous d'isolation du module D&D

### 2026-08-05 13:28 — 🟤 Big Pickle B — Verdict honnête sur la complexité + justification 4D6 + garde-fous d'isolation du module D&D

**Verdict honnête demandé par l'utilisateur sur la complexité du code :**
- ~171 fonctions globales dans `index.html` + 14 JS, **0 collision** vérifiée au greffage (grep croisé sur `rollDice`, `getModifier`, `buyItem`, `startAdventure`, `exportCharacter`...).
- Risques à surveiller (pas de bugs actifs) : **namespace global** (tout est en `window`, un futur module pourrait écraser un nom générique), **ordre de chargement** des `<script>` (dépendances implicites : `dnd-data.js` avant `char-gen.js`), **chemins relatifs CSS** (`../assets` → bug historique `css/assets`, corrigé en `../../assets`).
- **Décision** : le gros ajout à venir (compétences, combat, sorts, économie, aventure procédurale, événements chronométrés) est isolé dans un module dédié `js/modules/oracle/dnd-adventure.js` (nouveau), avec **globals préfixés `dnd*`/`DND*`** et **CSS préfixé `dnd-`**. Aucun fichier hors module D&D ne sera modifié sauf ajout additif (`utils.js` icônes, `index.html` vue + `<script>`).
- **Garantie anti-casse** : `node --check` + harnais par module + test visuel des autres onglets (Dés, Tirage, Battle map, Contenu) après chaque phase.

**Justification 4D6 (question utilisateur « pourquoi garder seulement les 3 meilleurs ? ») :**
- C'est la méthode standard de création de personnage de D&D 5e (« 4d6 drop lowest »).
- Moyenne ≈ **12,24** contre 10,5 pour un simple 3D6 (répartition plus haute, plus fiable).
- Plage possible 3-18 (plage canonique des caractéristiques), minimum moins extrême que 3D6.
- Objectif : **atténuer la variance** - un joueur a moins de chance de se retrouver avec un score très bas qui handicape toute sa fiche.

---

## Convention de nommage

Les rapports échangés entre agents utilisent le format :
`NOMDOC_@MODELE_DEST.md`

Exemples :
- `RAPPORT_@claude_codeur.md` — rapport destiné à Claude Codeur
- `SUIVI_@mimo_debug.md` — suivi destiné à Mimo V2.5 Debug
- `CORRECTION_@bigpickle_a.md` — correction destinée à Big Pickle A

---

## Architecture OracleRoll

- **Type** : Application web hors-ligne (HTML/CSS/JS vanilla, zéro dépendance)
- **Cible** : Tablette Android
- **Dépôt** : `Foxyte17/OracleRoll`
- **Structure** : `index.html` + 7 CSS + 14 JS

---

## Décision architecturale — cache des decks GitHub (2026-08-02)

- **Cache image : en mémoire, session uniquement.** Confirmé par l'utilisateur. Pas de persistance entre sessions (`localStorage`/IndexedDB) — cohérent avec la décision « pas de cache persistant » déjà actée pour l'intégration GitHub.
- État actuel du code (`deck-engine.js`) : le tableau `githubDecks` fait déjà office de cache mémoire pour les **manifests** (dédoublonné par `manifestUrl` dans `registerGithubDeck`, perdu au rechargement de la page — conforme).
- **Item de roadmap clos, sans développement (2026-08-02).** Un cache applicatif dédié pour les images (`Map<url, blob>` ou équivalent) n'est pas nécessaire : usage réel = un deck chargé une fois puis consulté ponctuellement pendant 1-2h de session sans rechargement de page, chaque image étant un résultat consulté puis quitté (logique proche d'un tirage de table, pas d'un affichage permanent). Le cache HTTP natif du navigateur suffit déjà à éviter tout re-téléchargement d'une image déjà vue sur `raw.githubusercontent.com` (même URL = pas de nouvelle requête réseau tant que l'onglet reste ouvert). Ajouter un cache applicatif serait de la complexité sans gain d'usage démontré — contraire au principe « pas de réécriture sans nécessité démontrée ». **Décision : aucun développement à faire sur ce point.**
- **Storage / IndexedDB : point clos définitivement (2026-08-02).** Ne plus rouvrir ce sujet sauf nécessité nouvelle et démontrée (volume de données, limite `localStorage` effectivement atteinte). L'architecture reste 100% `localStorage` + GitHub distant sans cache persistant.

---

## Corrections effectuées

### 2026-08-03 16:41 — 🟤 Big Pickle A (A1)
**Fichiers** : `css/base.css`, `css/components.css`, `css/modules/battlemap.css`, `css/modules/deck.css`, `css/modules/dice.css`, `css/modules/editor.css`, `css/modules/oracle.css`, `index.html`, `js/modules/deck/deck-ui.js`
**Correctif** : Application du patch uniformisation des textes (`PATCH_UNIFORMISATION_TEXTES.md`) - 9 tirets cadratins « — » → « - » (commentaires CSS uniquement) + 3 points de suspension « … » → « ... » (ASCII, texte joueur : `index.html` l.428 et l.486, `deck-ui.js` l.160)
**Raison** : Décisions utilisateur du 2026-08-02 - règle « — → - » limitée aux commentaires CSS ; points de suspension uniformisés sur l'ASCII `...`. Aucun changement de comportement, purement typographique.
**Chemin** : `D:\CodeEnLocal\Environnement Opencode\OracleRoll\`
**Vérification** : re-grep post-application - les 12 occurrences « — » en texte joueur restent inchangées (conformes au rappel), plus aucun « … » dans le projet.

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

### 2026-08-02 — 🟠 Claude Codeur (A1) — Validation croisée V1 → V2 (`SuiviCodeOracleRoll` GitHub)
**Fichiers** : tous les fichiers modifiés listés ci-dessous, comparés `OracleRoll/V1oracleroll` → `OracleRoll/V2oracleroll`
**Constat** : les 6 correctifs de la table ci-dessus sont **confirmés présents et conformes** à leur description dans le code réel (diff ligne à ligne). Statut passé de « en attente de validation » à **« Validé (revue de code) »** — reste la validation fonctionnelle navigateur (5 onglets) à la charge de l'utilisateur.
**Constat additionnel non documenté trouvé au passage** : `escapeHtmlText` était dupliquée dans `deck-ui.js` en plus de sa définition dans `utils.js` ; la version V2 ne conserve que celle de `utils.js`. Fonctionnellement correct, mais ce nettoyage n'était pas tracé dans ce document — ajouté ici a posteriori pour la traçabilité.

---

### 2026-08-01 14:55 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/battlemap/battlemap-engine.js`
**Correctif** : Suppression des doublons `bmColLetter` et `bmDistToSegment` (restent définis dans `js/core/utils.js`)
**Raison** : Fonctions définies deux fois à l'identique - code mort
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\battlemap\battlemap-engine.js`

---

### 2026-08-01 14:50 — 🟤 Big Pickle A (A1)
**Fichiers** : `js/modules/deck/deck-ui.js`, `js/modules/dice/dice-engine.js`
**Correctif** : Cohérences UI - restauration du select univers seulement si `universes[previous]` existe ; faces de dé personnalisé bornées `Math.min(1000, Math.max(2, parseInt(...) || 2))`
**Raison** : Le select pouvait restaurer une valeur disparue ; la saisie « 0 » ou négative produisait un dé à 1 face
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\deck\deck-ui.js` + `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\dice\dice-engine.js`

---

### 2026-08-01 14:45 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/oracle/oracle-engine.js`
**Correctif** : Robustesse du tirage Oracle - la table capturée `t` est passée à `finishOracleRoll` / `finishOracleRollMixed` (signatures `(roll, t)` / `(finalRolls, t)`, fallback `if (!t) t = currentTable`)
**Raison** : Changer de table pendant l'animation (~1 s) pouvait viser une table inconnue et provoquer une erreur, en mode simple et mixte
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\oracle\oracle-engine.js`

---

### 2026-08-01 14:40 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/editor/editor.js`
**Correctif** : Clés de colonnes unifiées - nouveau helper `makeColumnKey` (slugify + dédoublonnage + mots réservés `all`/`mixed` via `RESERVED_COLUMN_KEYS`), utilisé dans `createEditorGrid` et `addColumnToDraft`
**Raison** : L'ancienne génération locale produisait des doublons (« Action, action »), des underscore en trop (« Lieu ! » → `lieu_`) et des collisions avec les options « Résultat complet » / « Aléatoire »
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\editor\editor.js`

---

### 2026-08-01 14:35 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/editor/editor.js`
**Correctif** : Export complet - univers custom ET personalisés, avec `icon` et `builtIn`
**Raison** : L'export n'incluait ni les univers de base personnalisés (renommés / icône modifiée) ni les icônes - perte silencieuse de personnalisation au transfert
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\editor\editor.js`

---

### 2026-08-01 14:30 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/editor/editor.js`
**Correctif** : Ré-import des tables avec mise à jour (écrasement des existantes de même id) + rappel de `updateAppStats()` après import + message de statut « X ajoutée(s), Y mise(s) à jour »
**Raison** : Une table de même id était silencieusement ignorée à l'import (message « N importées » alors que 0) ; le compteur en bas de page restait faux après import
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\editor\editor.js`

---

### 2026-07-31 14:40 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/deck/deck-engine.js`
**Correctif** : Suppression code mort `jokersRemoved`
**Raison** : Variable initialisée mais jamais utilisée
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\deck\deck-engine.js`

---

### 2026-07-31 14:35 — 🟤 Big Pickle A (A1)
**Fichier** : `js/modules/dice/dice-engine.js`
**Correctif** : Modificateur appliqué en mode Séparation
**Raison** : Modificateur silencieusement ignoré en mode Séparation
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\modules\dice\dice-engine.js`

---

### 2026-07-31 14:30 — 🟤 Big Pickle A (A1)
**Fichiers** : `js/core/utils.js`, `js/modules/oracle/oracle-engine.js`, `js/modules/oracle/oracle-ui.js`, `js/modules/editor/editor.js`, `js/modules/deck/deck-ui.js`, `js/modules/battlemap/battlemap-ui.js`
**Correctif** : Échappement HTML des contenus utilisateur
**Raison** : Textes avec `<` ou `&` cassaient l'affichage ; risque XSS
**Chemin** : `D:\...\OracleRollLightTESTCOPIEPOURGITHUB\js\core\utils.js` + 5 autres fichiers

---

## Anomalies détectées hors périmètre des 6 correctifs — tranchées (2026-08-02, arbitrage utilisateur)

Trouvées en comparant `V1oracleroll` → `V2oracleroll`, non tracées dans ce document au moment de la détection. Statut après arbitrage :

1. **Tirets cadratins « — » → tirets simples « - »** (`deck-engine.js`, `index.html`) : **volontaire, règle de convention typographique du projet, toujours en vigueur.** Ne plus signaler comme anomalie à l'avenir — c'est la norme attendue sur tout le texte de l'app (à rapprocher de l'item « Uniformiser tous les textes de l'application » des ajustements rapides restants).
2. **Changements visuels Battlemap** (`battlemap.css`, `battlemap-ui.js` — grille, bordures, police et contour des pions) : **fait via un agent A1, validé par l'utilisateur.** Clos.
3. **Renommage `oracleroll.html` → `index.html`** : **volontaire, uniformisation.** Clos.

---

## Items écartés (pour mémoire)

- Persistance localStorage : écarté (sessions uniques)
- Responsive / accessibilité : écarté (application tablette, usage personnel)
- Mode clair/sombre : écarté
- Undo/redo : écarté
- Tooltip tactile : écarté
- Labels FR uniquement : écarté

---

## Rappel des contraintes design

- **OracleRoll** : interface pensée pour tablette Android
- **Typographie** : tiret court « - », pas de cadratin
- **Polices** : charger via `@font-face` (fichier `.woff2` local, pas de CDN)
- **Architecture** : vanilla HTML/CSS/JS, zéro framework

---

*Mis à jour par 🟤 Big Pickle A (A1) — 2026-08-03 16:41 : application du patch uniformisation.*
*Mis à jour par 🟠 Claude Codeur (A1) — 2026-08-02 : uniformisation textes + décision cache deck + anomalies tranchées.*
*Mis à jour par 🟠 Claude Codeur (A1) — 2026-08-02 : validation croisée V1→V2.*
*Mis à jour par 🟤 Big Pickle A (A1) — 2026-08-01 15:08 : ajout des 6 fixes.*
*Document créé par 🔵 Mimo V2.5 Orga — 2026-08-01 15:08.*
*Refondu par 🔵 Mimo V2.5 Orga — 2026-08-04 : séparation SUIVI_MODIF_CODE.md → SUIVI_MODIF_ORACLEROLL.md + SUIVI_MODIF_ORACLEEDITOR.md.*
*Réordonné par 🔵 Mimo V2.5 Orga — 2026-08-04 : passage à l'ordre anti-chronologique (plus récent en haut).*
