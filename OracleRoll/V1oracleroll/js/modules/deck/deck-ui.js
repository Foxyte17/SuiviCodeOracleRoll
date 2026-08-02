let draftDeck = null;
let currentDeckId = null;
let currentDeckContext = null;
let editingCardIconIndex = null;
let currentDrawnCards = [];

function renderOracleHeadingDecks() {
  const container = document.getElementById('oracle-heading-decks');
  const matching = cardDecks.filter(d => d.universeKey === currentUniverseKey);
  container.innerHTML = matching.map(d =>
    `<button class="icon-btn" onclick="openDeck('${d.id}','oracle')" title="Deck : ${d.label.replace(/"/g, '&quot;')}">${cardIconSvg}</button>`
  ).join('');
}

function renderTirageDecksList() {
  const container = document.getElementById('tirage-decks-list');
  const emptyMsg = document.getElementById('tirage-decks-empty');
  const standalone = cardDecks.filter(d => !d.universeKey);
  const all = standalone.concat(githubDecks);
  if (all.length === 0) {
    container.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';
  container.innerHTML = all.map(d =>
    `<button class="table-btn" onclick="openDeck('${d.id}','tirage')">${escapeHtmlText(d.label)} <span style="color:var(--parchment-dim); font-size:0.8rem;">(${d.cards.length} cartes)</span></button>`
  ).join('');
}

function updateDeckStatusDisplay(context, deckId) {
  const runtime = getDeckRuntime(deckId);
  document.getElementById(context + '-deck-status').textContent =
    `${runtime.length} carte${runtime.length > 1 ? 's' : ''} restante${runtime.length > 1 ? 's' : ''} dans la pioche`;
}

function openDeck(deckId, context) {
  const deck = getDeckDef(deckId);
  if (!deck) return;
  currentDeckId = deckId;
  currentDeckContext = context;
  currentDrawnCards = [];
  getDeckRuntime(deckId);

  if (context === 'oracle') {
    document.getElementById('oracle-heading').textContent = deck.label;
    document.getElementById('oracle-heading-decks').innerHTML = '';
    document.getElementById('oracle-universes').style.display = 'none';
    document.getElementById('oracle-favorites-section').style.display = 'none';
    document.getElementById('oracle-tables-list').style.display = 'none';
    document.getElementById('oracle-table-detail').style.display = 'none';
    document.getElementById('oracle-deck-detail').style.display = 'block';
    document.getElementById('oracle-deck-result').innerHTML = '';
    updateDeckStatusDisplay('oracle', deckId);
  } else {
    document.getElementById('tirage-decks-panel').style.display = 'none';
    document.getElementById('tirage-deck-detail-panel').style.display = 'block';
    document.getElementById('tirage-deck-heading').textContent = deck.label;
    document.getElementById('tirage-deck-result').innerHTML = '';
    updateDeckStatusDisplay('tirage', deckId);
  }
}

function closeDeckDetail(context) {
  if (context === 'oracle') {
    document.getElementById('oracle-deck-detail').style.display = 'none';
    openUniverse(currentUniverseKey);
  } else {
    document.getElementById('tirage-deck-detail-panel').style.display = 'none';
    document.getElementById('tirage-decks-panel').style.display = 'block';
  }
  currentDeckId = null;
  currentDeckContext = null;
  currentDrawnCards = [];
}

function renderCustomCardHtml(card) {
  const iconShape = card.icon && ICON_LIBRARY[card.icon] ? ICON_LIBRARY[card.icon] : null;
  return `<div class="custom-card">
    ${iconShape ? `<svg class="custom-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${iconShape}</svg>` : ''}
    <div class="custom-card-emblem">${CARD_EMBLEM_SVG}</div>
    <div class="custom-card-name-wrap"><div class="custom-card-name">${card.name}</div></div>
    ${card.description ? `<div class="custom-card-desc">${card.description}</div>` : ''}
  </div>`;
}

function drawDeckCard(context) {
  const deckId = currentDeckId;
  const runtime = getDeckRuntime(deckId);
  if (runtime.length === 0) {
    document.getElementById(context + '-deck-result').innerHTML =
      "Plus de cartes — lance une nouvelle session.";
    return;
  }
  const idx = Math.floor(Math.random() * runtime.length);
  const card = runtime.splice(idx, 1)[0];
  card.flipped = false;
  currentDrawnCards.push(card);
  updateDeckStatusDisplay(context, deckId);
  document.getElementById(context + '-deck-result').innerHTML =
    card.imageUrl ? renderImageCardHtml(card, currentDrawnCards.length - 1) : renderCustomCardHtml(card);
}

function resetCustomDeck(context) {
  resetCustomDeckState(currentDeckId);
  currentDrawnCards = [];
  updateDeckStatusDisplay(context, currentDeckId);
  document.getElementById(context + '-deck-result').innerHTML =
    'Nouvelle session : le deck est mélangé.';
}

function escapeHtmlText(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderImageCardHtml(card, drawIndex) {
  const name = escapeHtmlText(card.name);
  const missing = card.imageError || !card.imageUrl;
  return `<div class="image-card-wrap">
    <button type="button" class="action ghost" onclick="toggleCardFlip(this)">Pivoter</button>
    <div class="image-card${card.flipped ? ' flipped' : ''}" data-idx="${drawIndex}" onclick="toggleCardFlip(this)" title="Pivoter la carte">
      <div class="image-card-inner">
        ${missing
          ? '<div class="image-card-missing">Image manquante</div>'
          : `<img class="image-card-img" src="${escapeHtmlText(card.imageUrl)}" alt="${name}" data-idx="${drawIndex}" onerror="onCardImageError(this)">`}
      </div>
    </div>
    <div class="image-card-name">${name}</div>
  </div>`;
}

function toggleCardFlip(el) {
  const cardEl = el.classList.contains('image-card')
    ? el
    : el.closest('.image-card-wrap').querySelector('.image-card');
  if (!cardEl) return;
  const card = currentDrawnCards[Number(cardEl.getAttribute('data-idx'))];
  if (!card) return;
  card.flipped = !card.flipped;
  cardEl.classList.toggle('flipped', card.flipped);
}

function onCardImageError(imgEl) {
  const card = currentDrawnCards[Number(imgEl.getAttribute('data-idx'))];
  if (card) card.imageError = true;
  const wrapper = imgEl.parentNode;
  if (wrapper) {
    wrapper.innerHTML = '<div class="image-card-missing">Image manquante</div>';
  }
}

function setGithubDeckStatus(message, type) {
  const statusEl = document.getElementById('github-deck-status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove('success', 'error');
  if (type) statusEl.classList.add(type);
}

async function loadGithubDeck(manifestUrl) {
  const statusEl = document.getElementById('github-deck-status');
  if (!statusEl) return;
  statusEl.classList.remove('success', 'error');
  statusEl.textContent = 'Chargement du deck…';
  try {
    const deck = await fetchDeckFromGithub(manifestUrl);
    registerGithubDeck(deck);
    renderTirageDecksList();
    const urlInput = document.getElementById('github-deck-url');
    if (urlInput) urlInput.value = '';
    setGithubDeckStatus('Deck "' + deck.label + '" chargé (' + deck.cards.length + ' carte' + (deck.cards.length > 1 ? 's' : '') + ').', 'success');
  } catch (err) {
    setGithubDeckStatus(err.message || 'Erreur inconnue lors du chargement.', 'error');
  }
}

function loadGithubDeckFromInput() {
  const input = document.getElementById('github-deck-url');
  return loadGithubDeck(input ? input.value : '');
}

function renderDeckEditorUniverseOptions() {
  const select = document.getElementById('deck-editor-universe');
  const previous = select.value;
  select.innerHTML = '<option value="">Aucun univers</option>' +
    Object.keys(universes).map(key => `<option value="${key}">${universes[key].label}</option>`).join('');
  select.value = previous;
}

function createDeckEditorGrid() {
  const universeKey = document.getElementById('deck-editor-universe').value || null;
  const name = document.getElementById('deck-editor-name').value.trim();
  if (!name) {
    alert('Merci de donner un nom au deck.');
    return;
  }
  draftDeck = { id: 'deck-' + Date.now(), label: name, universeKey, cards: [{ name: '', description: '', icon: null }], custom: true };
  renderDeckEditorGrid();
}

function editDeck(deckId) {
  const source = cardDecks.find(d => d.id === deckId);
  draftDeck = JSON.parse(JSON.stringify(source));
  document.getElementById('deck-editor-universe').value = draftDeck.universeKey || '';
  document.getElementById('deck-editor-name').value = draftDeck.label;
  renderDeckEditorGrid();
  document.getElementById('deck-editor-grid-panel').scrollIntoView({ behavior: 'smooth' });
}

function renderDeckEditorGrid() {
  document.getElementById('deck-editor-grid-title').textContent = `Remplir : ${draftDeck.label}`;
  const container = document.getElementById('deck-editor-cards-list');
  container.innerHTML = draftDeck.cards.map((card, i) => `
    <div class="deck-card-row">
      <div class="deck-card-row-top">
        <input type="text" class="deck-card-field" placeholder="Nom de la carte" value="${(card.name || '').replace(/"/g, '&quot;')}" oninput="updateDeckCardField(${i}, 'name', this.value)">
        <button type="button" class="deck-card-icon-btn ${card.icon ? 'has-icon' : ''}" onclick="openCardIconPicker(${i})" title="Icône de la carte">
          ${card.icon && ICON_LIBRARY[card.icon] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" style="width:18px;height:18px;">${ICON_LIBRARY[card.icon]}</svg>` : cardIconSvg}
        </button>
      </div>
      <textarea class="deck-card-field" placeholder="Description (optionnelle)" oninput="updateDeckCardField(${i}, 'description', this.value)">${card.description || ''}</textarea>
      <button onclick="removeDeckCardRow(${i})">Supprimer la carte</button>
    </div>
  `).join('');
  document.getElementById('deck-editor-grid-panel').style.display = 'block';
  closeCardIconPicker();
}

function openCardIconPicker(index) {
  editingCardIconIndex = index;
  const panel = document.getElementById('deck-card-icon-picker');
  const current = draftDeck.cards[index].icon || null;
  panel.innerHTML = `
    <div class="icon-picker-grid">
      <button type="button" class="icon-pick-btn ${!current ? 'active' : ''}" title="Aucune icône" onclick="selectCardIcon(null)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="width:18px;height:18px;"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
      </button>
      ${Object.keys(ICON_LIBRARY).map(key => `
        <button type="button" class="icon-pick-btn ${key === current ? 'active' : ''}" title="${ICON_LABELS[key]}" onclick="selectCardIcon('${key}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" style="width:20px;height:20px;">${ICON_LIBRARY[key]}</svg>
        </button>`).join('')}
    </div>
    <button type="button" class="action ghost" style="width:100%;" onclick="closeCardIconPicker()">Fermer</button>
  `;
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectCardIcon(iconKey) {
  if (editingCardIconIndex === null || !draftDeck) return;
  draftDeck.cards[editingCardIconIndex].icon = iconKey;
  renderDeckEditorGrid();
}

function closeCardIconPicker() {
  editingCardIconIndex = null;
  const panel = document.getElementById('deck-card-icon-picker');
  if (panel) { panel.classList.remove('open'); panel.innerHTML = ''; }
}

function updateDeckCardField(index, field, value) {
  if (!draftDeck) return;
  draftDeck.cards[index][field] = value;
}

function addDeckCardRow() {
  if (!draftDeck) return;
  draftDeck.cards.push({ name: '', description: '', icon: null });
  renderDeckEditorGrid();
}

function removeDeckCardRow(index) {
  if (!draftDeck) return;
  if (draftDeck.cards.length <= 1) {
    alert('Un deck doit contenir au moins une carte.');
    return;
  }
  draftDeck.cards.splice(index, 1);
  renderDeckEditorGrid();
}

function cancelDeckEditor() {
  draftDeck = null;
  closeCardIconPicker();
  document.getElementById('deck-editor-grid-panel').style.display = 'none';
  document.getElementById('deck-editor-name').value = '';
  document.getElementById('deck-editor-universe').value = '';
}

function saveDeckEditor() {
  if (!draftDeck) return;
  if (draftDeck.cards.some(c => !c.name.trim())) {
    alert('Merci de donner un nom à chaque carte.');
    return;
  }
  const idx = cardDecks.findIndex(d => d.id === draftDeck.id);
  if (idx >= 0) cardDecks[idx] = draftDeck; else cardDecks.push(draftDeck);
  persistCardDecks();
  delete deckRuntimeState[draftDeck.id];
  cancelDeckEditor();
  renderDeckEditorExisting();
  renderTirageDecksList();
  if (currentUniverseKey) renderOracleHeadingDecks();
  updateAppStats();
}

function deleteDeck(deckId) {
  cardDecks = cardDecks.filter(d => d.id !== deckId);
  delete deckRuntimeState[deckId];
  persistCardDecks();
  renderDeckEditorExisting();
  renderTirageDecksList();
  if (currentUniverseKey) renderOracleHeadingDecks();
  updateAppStats();
}

function renderDeckEditorExisting() {
  const container = document.getElementById('deck-editor-existing-list');
  if (cardDecks.length === 0) {
    container.innerHTML = '<p class="legend">Aucun deck pour l\'instant.</p>';
    return;
  }
  container.innerHTML = cardDecks.map(d => {
    const universeLabel = d.universeKey && universes[d.universeKey] ? universes[d.universeKey].label : 'Aucun univers';
    return `<div class="existing-table-item">
      <div>${d.label} <span class="meta">— ${universeLabel} · ${d.cards.length} carte${d.cards.length > 1 ? 's' : ''}</span></div>
      <div style="display:flex; gap:6px;">
        <button class="icon-btn" onclick="editDeck('${d.id}')" title="Modifier">${gearIconSvg}</button>
        <button onclick="deleteDeck('${d.id}')">Supprimer</button>
      </div>
    </div>`;
  }).join('');
}
