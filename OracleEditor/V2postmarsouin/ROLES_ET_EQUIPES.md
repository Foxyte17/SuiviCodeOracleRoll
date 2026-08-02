# Rôles et Équipes — Réseau d'agents IA

> Document de référence. Ne pas modifier sans validation de l'utilisateur.

---

## 1. Projet

**OracleRoll** : application web principalement hors-ligne (HTML/CSS/JS vanilla, zéro dépendance) pour tablette Android. Hébergée sur GitHub.

**OracleEditor** : outil vanilla (HTML/CSS/JS) pour créer des decks de cartes.
Les cartes peuvent être exportées en **PNG** (image) ou **JSON** (données du deck complet). Les fichiers JSON sont stockés sur GitHub, puis importés dans OracleRoll.
Les cartes sont **statiques** — elles n'ont pas de statut (pas de vie, pas de conditions).

Dépôts GitHub :
- `Foxyte17/OracleRoll` pour **OracleRoll**
- `Foxyte17/editeur-de-carte` pour **OracleEditor**

---

## 2. Principes fondamentaux

1. L'utilisateur supervise toutes les équipes. Toute décision est soumise à sa validation.
2. Les équipes ne communiquent pas entre elles. L'utilisateur transmet les résultats (copier-coller).
3. Les agents cloud n'ont pas accès aux fichiers locaux — ils demandent les fichiers et fournissent des explications claires.
4. Les agents locaux accèdent directement aux fichiers.
5. Push GitHub : **Mimo V2.5 Orga uniquement**, avec accord explicite de l'utilisateur.
6. Les crédits Claude sont limités, certaines équipes sont des backup.
7. Tout document modifié va dans `documentation/` (exclu du push GitHub).
8. Sortie de périmètre : signaler et justifier **avant d'agir**.
9. Convention de nommage d'un agent à l'autre : `NOMDOC_@MODELE_DEST.md`
10. Horodatage : `AAAA-MM-JJ HH:MM` (UTC+2) en fin de tout document modifié.
11. En local le dossier `Environnement Opencode\OracleRoll` concerne OracleRoll tandis que `Environnement Opencode\OracleEditor` concerne l'éditeur de carte. Les agents Cloud doivent aussi nommer ces projets ainsi.
---

## 3. Espaces de travail

**Agents locaux** — référez-vous au chemin d'accès :

| Agent | Périmètre |
|-------|-----------|
| 🔵 Mimo V2.5 Orga | `Environnement Opencode\` (workspace projet) |
| 🟣 Mimo V2.5 Debug | `Environnement Opencode\ + LM Studio (`%LOCALAPPDATA%/LM Studio/`) + workspace (lecture) |
| 🟤 Big Pickle A | `Environnement Opencode\` (code + design) |
| 🟤 Big Pickle B | `Environnement Opencode\` (code + design) |

**Agents cloud** — demandez les documents nécessaires à l'utilisateur :

| Agent | Modèle |
|-------|--------|
| 🟢 Big Pickle 0 | Big Pickle / Opencode Zen |
| 🟢 Vision | Gemini Flash-Lite |
| 🟠 Codeur Principal | Claude Sonnet 5 |
| 🟠 Designer | Claude Sonnet 5 |
| ⚪ Z.ai A1 | GLM-5-Turbo (z.ai) |
| ⚪ Z.ai B1 | GLM-5-Turbo (z.ai) |
| ⚪ Z.ai B2 | GLM-5-Turbo (z.ai) |

---

## 4. Organigramme

```
UTILISATEUR
│
├── 🔵 Mimo V2.5 Orga — Organisateur général
│   ├── Supervise, coordonne, valide
│   └── Seul push GitHub (avec accord)
│
├── 🟣 Mimo V2.5 Debug — Agent Debug
│   ├── Bugs, config Opencode + LM Studio
│   └── Isolé de Mimo Orga
│
├── ÉQUIPE 0 — Planification & Vision
│   ├── 🟢 Big Pickle 0 — Planificateur
│   └── 🟢 Gemini Flash-Lite — Vision
│
├── ÉQUIPE A — OracleRoll
│   ├── A1 Code : 🟠 Claude + 🟤 Big Pickle A + ⚪ Z.ai A1
│   └── A2 Design : 🟠 Claude + 🟤 Big Pickle A + 🟢 Gemini Flash-Lite
│
├── ÉQUIPE B — Éditeur de cartes
│   ├── B1 Code : 🟠 Claude + 🟤 Big Pickle B + ⚪ Z.ai B1
│   └── B2 Design : 🟠 Claude + 🟤 Big Pickle B + ⚪ Z.ai B2
│
└── SYNC — GitHub
    ├── 📦 OracleRoll (Foxyte17/OracleRoll)
    └── 📦 Éditeur de cartes (Foxyte17/editeur-de-carte)
```

---

## 5. Agents

### 5.1 Transversaux

| Badge | Agent | Modèle | Rôle | Limites | Push |
|-------|-------|--------|------|---------|------|
| 🔵 | Mimo V2.5 Orga | Mimo V2.5 / Opencode Zen | Supervision, coordination, validation | Pas de code, pas de planification, pas d'images | ✅ (avec accord) |
| 🟣 | Mimo V2.5 Debug | Mimo V2.5 / Opencode Zen | Bugs, config Opencode, config LM Studio | Signale chaque manipulation. Isolé de Mimo Orga. | ❌ |

### 5.2 Équipe 0 — Planification & Vision

| Badge | Agent | Modèle | Rôle | Limites |
|-------|-------|--------|------|---------|
| 🟢 | Big Pickle 0 | Big Pickle / Opencode Zen | Ordre des tâches, priorisation, recommandation d'agents | Pas de fichiers locaux, texte brut uniquement |
| 🟢 | Vision | Gemini Flash-Lite | Analyse images, cohérence visuelle | Juste analyse, pas de création d'images |

### 5.3 Équipe A — OracleRoll

| Badge | Agent | Modèle | Rôle | Accès | Périmètre |
|-------|-------|--------|------|-------|-----------|
| 🟠 | Codeur Principal | Claude Sonnet 5 | Code initial, corrections majeures | ❌ cloud | — |
| 🟠 | Designer | Claude Sonnet 5 | Design UI, ergonomie, esthétique | ❌ cloud | — |
| 🟤 | Big Pickle A | Big Pickle / Opencode Zen | Code + design backup | ✅ local | OracleRoll (code + design) |
| ⚪ | Z.ai A1 | GLM5.2 (z.ai) | Code + design backup | ❌ cloud | — |
| 🟢 | Vérificateur Design | Gemini Flash-Lite | Vérifie cohérence visuelle | ❌ cloud | — |

### 5.4 Équipe B — OracleEditor

| Badge | Agent | Modèle | Rôle | Accès | Périmètre |
|-------|-------|--------|------|-------|-----------|
| 🟠 | Codeur Principal | Claude Sonnet 5 | Code initial, corrections majeures | ❌ cloud | — |
| 🟠 | Designer | Claude Sonnet 5 | Design UI, ergonomie, esthétique | ❌ cloud | — |
| 🟤 | Big Pickle B | Big Pickle / Opencode Zen | Code + design backup | ✅ local | editeur-de-carte/ (code + design) |
| ⚪ | Z.ai B1 | GLM5.2 (z.ai) | Code backup | ❌ cloud | — |
| ⚪ | Z.ai B2 | GLM-5-Turbo (z.ai) | Design backup | ❌ cloud | — |

---

## 6. Workflows

### Vérification

```
1. Agent vérificateur identifie un problème
        ↓
2. Signale le problème (description + localisation)
        ↓
3. L'utilisateur transmet à l'agent codeur
        ↓
4. L'agent codeur corrige
        ↓
5. Vérificateur valide ou signale un nouveau problème
```

### Push GitHub

| Étape | Description |
|-------|-------------|
| 1 | L'utilisateur dit "push" |
| 2 | Mimo V2.5 Orga demande les dossiers à envoyer (`\OracleRoll` `\OracleEditor`, ou `les 2`) |
| 3 | Mimo V2.5 Orga demande le dépôt cible (`oracleroll`, `editeur-de-carte`, ou `les 2`) |
| 4 | Tout autre contenu est exclu.|
| 5 | Validation finale avant exécution |

---

*Document mis à jour par Utilisateur — 2026-08-02 01:55*
