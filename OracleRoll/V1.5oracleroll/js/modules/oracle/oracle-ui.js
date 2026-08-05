function getUniverseIcon(key) {
  const u = universes[key];
  return (u.icon && ICON_LIBRARY[u.icon]) ? ICON_LIBRARY[u.icon] : DEFAULT_UNIVERSE_ICON;
}

function renderUniverseGrid() {
  const container = document.getElementById('oracle-universes');
  container.innerHTML = Object.keys(universes).map(key => {
    const u = universes[key];
    const icon = getUniverseIcon(key);
    return `<button class="universe-btn" onclick="openUniverse('${key}')">
      <svg class="universe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${icon}</svg>
      <span>${escapeHtmlText(u.label)}</span>
    </button>`;
  }).join('');
}

function openUniverse(key) {
  currentUniverseKey = key;
  const universe = universes[key];
  document.getElementById('oracle-heading').textContent = universe.label;
  document.getElementById('oracle-intro').style.display = 'none';
  document.getElementById('oracle-universes').style.display = 'none';
  document.getElementById('oracle-favorites-section').style.display = 'none';
  document.getElementById('oracle-table-detail').style.display = 'none';
  document.getElementById('oracle-combo-detail').style.display = 'none';
  document.getElementById('oracle-deck-detail').style.display = 'none';
  document.getElementById('oracle-char-detail').style.display = 'none';
  document.getElementById('oracle-tables-list').style.display = 'block';
  renderOracleHeadingDecks();

  const container = document.getElementById('oracle-tables-buttons');
  const emptyMsg = document.getElementById('oracle-empty-msg');

  const visibleCount = universe.tables.filter(t => !t.hidden).length + (universe.combos ? universe.combos.length : 0);
  if (visibleCount === 0) {
    container.innerHTML = '';
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    container.innerHTML = renderTableButtonsGrouped(universe);
  }
}

// Regroupe l'affichage des tables (et des tirages combinés) d'un univers par "group" (optionnel).
// Les tables marquées "hidden" ne sont listées ici que via un combo qui les référence.
function renderTableButtonsGrouped(universe) {
  const entries = [
    ...universe.tables.filter(t => !t.hidden).map(t => ({ type: 'table', id: t.id, label: t.label, dice: t.dice, group: t.group })),
    ...(universe.combos || []).map(c => ({ type: 'combo', id: c.id, label: c.label, group: c.group }))
  ];

  const ungrouped = entries.filter(e => !e.group);
  const groupedEntries = entries.filter(e => e.group);

  const groupOrder = [];
  groupedEntries.forEach(e => { if (!groupOrder.includes(e.group)) groupOrder.push(e.group); });

  const entryBtnHtml = e => e.type === 'combo'
    ? `<button class="table-btn" onclick="openCombo('${e.id}')">${escapeHtmlText(e.label)}</button>`
    : `<button class="table-btn" onclick="openTable('${e.id}')">${escapeHtmlText(e.label)} <span style="color:var(--parchment-dim); font-size:0.8rem;">(D${e.dice})</span></button>`;

  let html = ungrouped.map(entryBtnHtml).join('');
  groupOrder.forEach(groupLabel => {
    html += `<div class="oracle-group-header">${escapeHtmlText(groupLabel)}</div>`;
    html += groupedEntries.filter(e => e.group === groupLabel).map(entryBtnHtml).join('');
  });
  return html;
}

function backToUniverses() {
  if (typeof dndStopAll === 'function') dndStopAll();
  document.getElementById('oracle-heading').textContent = 'Choisis un univers';
  document.getElementById('oracle-heading-decks').innerHTML = '';
  document.getElementById('oracle-intro').style.display = 'block';
  document.getElementById('oracle-tables-list').style.display = 'none';
  document.getElementById('oracle-combo-detail').style.display = 'none';
  document.getElementById('oracle-char-detail').style.display = 'none';
  oracleReturnToCombo = null;
  document.getElementById('oracle-universes').style.display = 'grid';
  renderFavoritesSection();
}

function backToTables() {
  document.getElementById('oracle-table-detail').style.display = 'none';
  if (oracleReturnToCombo) {
    const comboId = oracleReturnToCombo;
    oracleReturnToCombo = null;
    openCombo(comboId);
  } else {
    openUniverse(currentUniverseKey);
  }
}

function openTable(tableId) {
  currentTable = universes[currentUniverseKey].tables.find(t => t.id === tableId);
  document.getElementById('oracle-heading').textContent = currentTable.label;
  document.getElementById('oracle-heading-decks').innerHTML = '';
  document.getElementById('oracle-tables-list').style.display = 'none';
  document.getElementById('oracle-table-detail').style.display = 'block';
  document.getElementById('oracle-result').innerHTML = '';
  document.getElementById('oracle-roll-btn').textContent = `Tirer (1D${currentTable.dice})`;

  document.getElementById('oracle-breadcrumb').textContent =
    `${universes[currentUniverseKey].label} › ${currentTable.label}`;

  const quickSwitch = document.getElementById('oracle-quick-switch');
  quickSwitch.innerHTML = universes[currentUniverseKey].tables.map(t =>
    `<option value="${t.id}" ${t.id === tableId ? 'selected' : ''}>${escapeHtmlText(t.label)}</option>`
  ).join('');

  const descBox = document.getElementById('oracle-table-description');
  if (currentTable.description) {
    descBox.style.display = 'block';
    descBox.textContent = currentTable.description;
  } else {
    descBox.style.display = 'none';
  }

  const select = document.getElementById('oracle-category');
  select.innerHTML = '<option value="all">Résultat complet</option>' +
    (currentTable.columns.length > 1 ? '<option value="mixed">Aléatoire</option>' : '') +
    currentTable.columns.map(c => `<option value="${c.key}">${escapeHtmlText(c.label)}</option>`).join('');

  updateFavoriteStarButton();
  renderOracleTable(null);
}

// ---------- FAVORIS ----------
let favorites = [];

function loadFavorites() {
  const data = StorageService.loadFavorites();
  if (data) favorites = data;
}

function persistFavorites() {
  StorageService.saveFavorites(favorites);
}

function isFavorite(universeKey, tableId) {
  return favorites.some(f => f.universeKey === universeKey && f.tableId === tableId);
}

function toggleFavoriteCurrentTable() {
  if (!currentUniverseKey || !currentTable) return;
  const idx = favorites.findIndex(f => f.universeKey === currentUniverseKey && f.tableId === currentTable.id);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push({ universeKey: currentUniverseKey, tableId: currentTable.id });
  persistFavorites();
  updateFavoriteStarButton();
}

function updateFavoriteStarButton() {
  const btn = document.getElementById('favorite-star-btn');
  if (!btn || !currentTable) return;
  const active = isFavorite(currentUniverseKey, currentTable.id);
  btn.classList.toggle('active', active);
  btn.title = active ? 'Retirer des favoris' : 'Ajouter aux favoris';
}

function renderFavoritesSection() {
  const section = document.getElementById('oracle-favorites-section');
  const list = document.getElementById('oracle-favorites-list');

  const valid = favorites.filter(f => universes[f.universeKey] && universes[f.universeKey].tables.find(t => t.id === f.tableId));
  if (valid.length !== favorites.length) {
    favorites = valid;
    persistFavorites();
  }

  if (favorites.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = favorites.map(f => {
    const t = universes[f.universeKey].tables.find(tt => tt.id === f.tableId);
    return `<button class="table-btn" onclick="openFavoriteTable('${f.universeKey}','${f.tableId}')">★ ${escapeHtmlText(t.label)} <span style="color:var(--parchment-dim); font-size:0.8rem;">- ${escapeHtmlText(universes[f.universeKey].label)}</span></button>`;
  }).join('');
}

function openFavoriteTable(universeKey, tableId) {
  currentUniverseKey = universeKey;
  document.getElementById('oracle-intro').style.display = 'none';
  document.getElementById('oracle-universes').style.display = 'none';
  document.getElementById('oracle-favorites-section').style.display = 'none';
  document.getElementById('oracle-tables-list').style.display = 'none';
  openTable(tableId);
}
