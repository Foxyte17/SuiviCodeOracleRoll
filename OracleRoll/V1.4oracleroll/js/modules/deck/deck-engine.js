const suits = [
  { name: "pique", symbol: "♠", label: "Pique" },
  { name: "coeur", symbol: "♥", label: "Cœur" },
  { name: "carreau", symbol: "♦", label: "Carreau" },
  { name: "trefle", symbol: "♣", label: "Trèfle" }
];
const ranks = [
  { label: "As", value: 1 }, { label: "2", value: 2 }, { label: "3", value: 3 },
  { label: "4", value: 4 }, { label: "5", value: 5 }, { label: "6", value: 6 },
  { label: "7", value: 7 }, { label: "8", value: 8 }, { label: "9", value: 9 },
  { label: "10", value: 10 }, { label: "Valet", value: 11 }, { label: "Dame", value: 12 },
  { label: "Roi", value: 13 }
];

const suitMeanings = {
  pique: "danger, conflit, perte",
  coeur: "émotion, relation, espoir",
  carreau: "ressources, opportunité, changement",
  trefle: "effort, endurance, obstacle"
};

let deck = [];

function buildDeck() {
  deck = [];
  suits.forEach(s => {
    ranks.forEach(r => {
      deck.push({ suit: s, rank: r.label, value: r.value, isJoker: false });
    });
  });
  deck.push({ isJoker: true, label: "Joker" });
  deck.push({ isJoker: true, label: "Joker" });
  updateDeckStatus();
}

function updateDeckStatus() {
  document.getElementById('deck-status').textContent =
    `${deck.length} carte${deck.length > 1 ? 's' : ''} restante${deck.length > 1 ? 's' : ''} dans la pioche`;
}

function resetDeck() {
  buildDeck();
  document.getElementById('cards-drawn').innerHTML = "";
  document.getElementById('tirage-result').innerHTML = "Nouvelle session : le deck est mélangé.";
}

function cardHtml(card) {
  if (card.isJoker) {
    return `<div class="playing-card joker"><div class="rank">JOKER</div></div>`;
  }
  return `<div class="playing-card ${card.suit.name}">
      <div class="rank">${card.rank}</div>
      <div class="suit">${card.suit.symbol}</div>
    </div>`;
}

function drawCards() {
  if (deck.length < 2) {
    document.getElementById('tirage-result').innerHTML =
      "Plus assez de cartes - lance une nouvelle session.";
    return;
  }
  const drawn = [];
  for (let i = 0; i < 2; i++) {
    const idx = Math.floor(Math.random() * deck.length);
    drawn.push(deck.splice(idx, 1)[0]);
  }
  updateDeckStatus();
  document.getElementById('cards-drawn').innerHTML = drawn.map(cardHtml).join("");

  const hasJoker = drawn.some(c => c.isJoker);
  if (hasJoker) {
    document.getElementById('tirage-result').innerHTML =
      `<div class="total">JOKER</div>
       <div class="detail">Réussite automatique. Une conséquence narrative majeure se produit. Le Joker est retiré du jeu jusqu'à la nouvelle session.</div>`;
    return;
  }

  const total = drawn[0].value + drawn[1].value;
  let dominant;
  if (drawn[0].value > drawn[1].value) dominant = drawn[0];
  else if (drawn[1].value > drawn[0].value) dominant = drawn[1];
  else dominant = null;

  const dominantText = dominant
    ? `${dominant.suit.label} ${dominant.suit.symbol} - ${suitMeanings[dominant.suit.name]}`
    : `Égalité - choisis la couleur la plus pertinente pour la narration`;

  document.getElementById('tirage-result').innerHTML =
    `<div class="total">${total}</div>
     <div class="detail">${drawn[0].rank} ${drawn[0].suit.symbol} + ${drawn[1].rank} ${drawn[1].suit.symbol}</div>
     <div class="detail" style="margin-top:6px; font-size:0.95rem; color: var(--parchment);">${dominantText}</div>`;
}

buildDeck();

// ---------- DECKS PERSONNALISÉS ----------
let cardDecks = [];
let deckRuntimeState = {};

function loadCardDecks() {
  const data = StorageService.loadDecks();
  if (data) cardDecks = data;
}

function persistCardDecks() {
  StorageService.saveDecks(cardDecks);
}

function getDeckDef(deckId) {
  return cardDecks.find(d => d.id === deckId) || githubDecks.find(d => d.id === deckId);
}

function resetCustomDeckState(deckId) {
  const deck = getDeckDef(deckId);
  deckRuntimeState[deckId] = deck ? deck.cards.map(c => ({ ...c, flipped: false })) : [];
}

function getDeckRuntime(deckId) {
  if (!deckRuntimeState[deckId]) resetCustomDeckState(deckId);
  return deckRuntimeState[deckId];
}

// ---------- DECKS CARTES-IMAGE (GitHub, session uniquement) ----------
const CARDS_SPECS_FORMAT = 'CARDS_SPECS';
const GITHUB_CARD_INSTANCE_FIELDS = ['state', 'position', 'flipped', 'isFlipped', 'drawn', 'discard', 'inHand', 'order'];
let githubDecks = [];

function githubDeckError(code, message) {
  const err = new Error(message);
  err.name = 'GithubDeckError';
  err.code = code;
  return err;
}

function githubRawUrlFromManifestUrl(inputUrl) {
  if (!inputUrl) return null;
  const url = inputUrl.trim();
  const blob = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
  if (blob) return 'https://raw.githubusercontent.com/' + blob[1] + '/' + blob[2] + '/' + blob[3] + '/' + blob[4];
  const raw = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\/([^/]+)\/(.+)$/i);
  if (raw) return 'https://raw.githubusercontent.com/' + raw[1] + '/' + raw[2] + '/' + raw[3] + '/' + raw[4];
  if (/^https?:\/\/raw\.githubusercontent\.com\//i.test(url)) return url;
  return null;
}

function resolveGithubImageUrl(manifestUrl, imagePath) {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const base = manifestUrl.slice(0, manifestUrl.lastIndexOf('/'));
  return base + '/' + imagePath.replace(/^\/+/, '');
}

async function fetchDeckFromGithub(inputUrl) {
  if (!inputUrl || !inputUrl.trim()) {
    throw githubDeckError('empty-url', "URL vide : colle l'URL d'un manifest deck.json (format CARDS_SPECS).");
  }
  const manifestUrl = githubRawUrlFromManifestUrl(inputUrl);
  if (!manifestUrl) {
    throw githubDeckError('bad-url', "URL non reconnue : utilise un lien github.com/.../blob/... ou raw.githubusercontent.com.");
  }
  let response;
  try {
    response = await fetch(manifestUrl);
  } catch (e) {
    throw githubDeckError('fetch-failed', 'Téléchargement impossible : réseau indisponible.');
  }
  if (!response.ok) {
    throw githubDeckError('fetch-failed', 'Manifest introuvable : le serveur a répondu ' + response.status + '.');
  }
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw githubDeckError('invalid-json', "Fichier illisible : ce n'est pas un JSON valide.");
  }
  if (!data || data.format !== CARDS_SPECS_FORMAT) {
    throw githubDeckError('bad-format', 'Format invalide : le manifest doit être au format "CARDS_SPECS".');
  }
  const source = data.deck;
  if (!source || typeof source.name !== 'string' || !source.name.trim() ||
      !Array.isArray(source.cards) || source.cards.length === 0) {
    throw githubDeckError('invalid-structure', 'Structure invalide : deck.name et deck.cards[] sont requis.');
  }
  const cards = [];
  const seenIds = new Set();
  for (const rawCard of source.cards) {
    if (!rawCard || typeof rawCard !== 'object') {
      throw githubDeckError('invalid-structure', 'Structure invalide : chaque carte du deck est invalide.');
    }
    const instanceField = GITHUB_CARD_INSTANCE_FIELDS.find(f => f in rawCard);
    if (instanceField) {
      throw githubDeckError('instance-fields', 'Structure invalide : champ de Card Instance ("' + instanceField + '") interdit dans le manifest.');
    }
    if (typeof rawCard.name !== 'string' || !rawCard.name.trim() || typeof rawCard.image !== 'string' || !rawCard.image.trim()) {
      throw githubDeckError('invalid-structure', 'Structure invalide : chaque carte doit contenir "name" et "image".');
    }
    const explicitId = rawCard.id != null ? String(rawCard.id).trim() : '';
    let cardId = explicitId || String(rawCard.image).trim();
    if (seenIds.has(cardId)) {
      let suffix = 2;
      while (seenIds.has(cardId + '-' + suffix)) suffix++;
      cardId = cardId + '-' + suffix;
    }
    seenIds.add(cardId);
    cards.push({
      id: cardId,
      name: rawCard.name,
      imageUrl: resolveGithubImageUrl(manifestUrl, rawCard.image)
    });
  }
  return {
    id: 'github-' + Date.now(),
    label: source.name.trim(),
    universeKey: null,
    custom: false,
    githubDeck: true,
    manifestUrl: manifestUrl,
    cards: cards
  };
}

function registerGithubDeck(deck) {
  const existing = githubDecks.find(d => d.manifestUrl === deck.manifestUrl);
  if (existing) {
    deck.id = existing.id;
    githubDecks = githubDecks.filter(d => d.id !== existing.id);
  }
  githubDecks.push(deck);
  delete deckRuntimeState[deck.id];
  return deck;
}
