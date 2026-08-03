let draftTable = null;

const copyIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;">
  <rect x="8" y="8" width="12" height="12" rx="1.5"/>
  <path d="M5 15.5H4.5A1.5 1.5 0 0 1 3 14V4.5A1.5 1.5 0 0 1 4.5 3H14a1.5 1.5 0 0 1 1.5 1.5V5"/>
</svg>`;
const pasteIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;">
  <rect x="5" y="4" width="14" height="17" rx="1.5"/>
  <rect x="9" y="2.3" width="6" height="3.4" rx="1"/>
  <path d="M9 11h6M9 15h6"/>
</svg>`;

let tableClipboard = null;
let expandedTableCategories = new Set();

function loadCustomUniverses() {
  const saved = StorageService.loadUniverses();
  if (!saved) return;
  saved.forEach(u => {
    if (universes[u.key]) {
      universes[u.key].label = u.label;
      if (u.icon) universes[u.key].icon = u.icon;
      universes[u.key].personalized = true;
    } else if (!u.builtIn) {
      universes[u.key] = { label: u.label, tables: [], custom: true, icon: u.icon, personalized: true };
    }
  });
}

function persistCustomUniverses() {
  const data = Object.keys(universes)
    .filter(key => universes[key].custom || universes[key].personalized)
    .map(key => ({ key, label: universes[key].label, icon: universes[key].icon, builtIn: !!universes[key].builtIn }));
  StorageService.saveUniverses(data);
}

function createUniverse() {
  const input = document.getElementById('editor-universe-name');
  const name = input.value.trim();
  if (!name) { alert('Merci de donner un nom à ton univers.'); return; }
  let key = slugify(name);
  if (!key || universes[key]) key = 'custom_' + Date.now();
  universes[key] = { label: name, tables: [], custom: true };
  persistCustomUniverses();
  renderUniverseGrid();
  renderEditorUniverseOptions();
  renderDeckEditorUniverseOptions();
  renderExistingUniverses();
  updateAppStats();
  input.value = '';
}

function deleteUniverse(key) {
  if (universes[key] && universes[key].builtIn) return;
  delete universes[key];
  favorites = favorites.filter(f => f.universeKey !== key);
  cardDecks.forEach(d => { if (d.universeKey === key) d.universeKey = null; });
  persistCustomUniverses();
  persistCustomTables();
  persistFavorites();
  persistCardDecks();
  renderUniverseGrid();
  renderEditorUniverseOptions();
  renderDeckEditorUniverseOptions();
  renderExistingUniverses();
  renderExistingTables();
  renderDeckEditorExisting();
  renderTirageDecksList();
  updateAppStats();
}

function renderEditorUniverseOptions() {
  const select = document.getElementById('editor-universe');
  const previous = select.value;
  select.innerHTML = Object.keys(universes).map(key =>
    `<option value="${key}">${universes[key].label}</option>`
  ).join('');
  if (universes[previous]) select.value = previous;
}

let customizingUniverseKey = null;
let selectedIconKey = null;

function personalizeUniverse(key) {
  customizingUniverseKey = key;
  selectedIconKey = universes[key].icon || null;
  document.getElementById('customize-universe-name').value = universes[key].label;
  renderIconPickerGrid();
  document.getElementById('universe-customize-panel').style.display = 'block';
  document.getElementById('universe-customize-panel').scrollIntoView({ behavior: 'smooth' });
}

function renderIconPickerGrid() {
  const container = document.getElementById('customize-icon-grid');
  container.innerHTML = Object.keys(ICON_LIBRARY).map(iconKey => `
    <button type="button" class="icon-pick-btn ${iconKey === selectedIconKey ? 'active' : ''}" data-icon="${iconKey}" title="${ICON_LABELS[iconKey]}" onclick="selectIconOption('${iconKey}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" style="width:22px;height:22px;">${ICON_LIBRARY[iconKey]}</svg>
    </button>`).join('');
}

function selectIconOption(iconKey) {
  selectedIconKey = iconKey;
  document.querySelectorAll('.icon-pick-btn').forEach(b => b.classList.toggle('active', b.dataset.icon === iconKey));
}

function saveUniverseCustomization() {
  const key = customizingUniverseKey;
  const name = document.getElementById('customize-universe-name').value.trim();
  if (!name) { alert('Merci de donner un nom.'); return; }
  universes[key].label = name;
  if (selectedIconKey) universes[key].icon = selectedIconKey;
  universes[key].personalized = true;
  persistCustomUniverses();
  renderUniverseGrid();
  renderEditorUniverseOptions();
  renderDeckEditorUniverseOptions();
  renderExistingUniverses();
  cancelUniverseCustomization();
}

function cancelUniverseCustomization() {
  document.getElementById('universe-customize-panel').style.display = 'none';
  customizingUniverseKey = null;
  selectedIconKey = null;
}

function renderExistingUniverses() {
  const container = document.getElementById('editor-universes-list');
  const keys = Object.keys(universes);
  container.innerHTML = keys.map(key => `
    <div class="existing-table-item">
      <div>${universes[key].label} <span class="meta">— ${universes[key].tables.length} table${universes[key].tables.length > 1 ? 's' : ''}</span></div>
      <div style="display:flex; gap:6px;">
        <button class="icon-btn" onclick="personalizeUniverse('${key}')" title="Personnaliser">${gearIconSvg}</button>
        ${!universes[key].builtIn ? `<button onclick="deleteUniverse('${key}')">Supprimer</button>` : ''}
      </div>
    </div>
  `).join('');
}

function loadCustomTables() {
  const saved = StorageService.loadTables();
  if (!saved) return;
  Object.keys(saved).forEach(uKey => {
    if (!universes[uKey]) return;
    saved[uKey].forEach(t => {
      const idx = universes[uKey].tables.findIndex(et => et.id === t.id);
      if (idx >= 0) universes[uKey].tables[idx] = t;
      else universes[uKey].tables.push(t);
    });
  });
}

function persistCustomTables() {
  const data = {};
  Object.keys(universes).forEach(uKey => {
    data[uKey] = universes[uKey].tables.filter(t => t.custom);
  });
  StorageService.saveTables(data);
}

function createEditorGrid() {
  const universeKey = document.getElementById('editor-universe').value;
  const name = document.getElementById('editor-name').value.trim();
  const dice = parseInt(document.getElementById('editor-dice').value, 10);
  const columnsRaw = document.getElementById('editor-columns').value.trim();
  const description = document.getElementById('editor-description').value.trim();

  if (!name || !dice || dice < 2 || !columnsRaw) {
    alert('Merci de remplir le nom de la table, un nombre de faces valide, et au moins une colonne.');
    return;
  }

  const columns = columnsRaw.split(',').map(c => c.trim()).filter(Boolean)
    .map(label => ({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label }));

  const rows = [];
  for (let i = 1; i <= dice; i++) {
    const row = { v: i };
    columns.forEach(c => row[c.key] = '');
    rows.push(row);
  }

  draftTable = { id: 'custom-' + Date.now(), label: name, dice, columns, rows, custom: true, universeKey, description };
  renderEditorGridHtml(draftTable);
}

function editTable(universeKey, tableId) {
  const source = universes[universeKey].tables.find(t => t.id === tableId);
  draftTable = JSON.parse(JSON.stringify(source));
  draftTable.universeKey = universeKey;

  document.getElementById('editor-universe').value = universeKey;
  document.getElementById('editor-universe').disabled = true;
  document.getElementById('editor-name').value = draftTable.label;
  document.getElementById('editor-dice').value = draftTable.dice;
  document.getElementById('editor-columns').value = draftTable.columns.map(c => c.label).join(', ');
  document.getElementById('editor-description').value = draftTable.description || '';

  renderEditorGridHtml(draftTable);
  document.getElementById('editor-grid-panel').scrollIntoView({ behavior: 'smooth' });
}

function renderEditorGridHtml(draft) {
  document.getElementById('editor-grid-title').textContent = `Remplir : ${draft.label} (D${draft.dice})`;
  let html = `<tr><th>D${draft.dice}</th>` +
    draft.columns.map(c => {
      const label = (c.label || '').toString().replace(/"/g, '&quot;');
      return `<th><input class="col-header-input" data-colkey="${c.key}" value="${label}"></th>`;
    }).join('') + '</tr>';
  draft.rows.forEach(row => {
    html += `<tr><td>${row.v}</td>` +
      draft.columns.map(c => {
        const val = (row[c.key] || '').toString().replace(/"/g, '&quot;');
        return `<td><input data-row="${row.v}" data-col="${c.key}" value="${val}"></td>`;
      }).join('') + '</tr>';
  });
  document.getElementById('editor-grid-table').innerHTML = html;
  document.getElementById('editor-grid-panel').style.display = 'block';
}

function syncGridInputsToDraft() {
  if (!draftTable) return;
  document.querySelectorAll('#editor-grid-table th input').forEach(input => {
    const col = draftTable.columns.find(c => c.key === input.dataset.colkey);
    if (col) col.label = input.value;
  });
  document.querySelectorAll('#editor-grid-table td input').forEach(input => {
    const row = draftTable.rows.find(r => r.v === parseInt(input.dataset.row, 10));
    if (row) row[input.dataset.col] = input.value;
  });
}

let newColumnPosition = 'right';

function setNewColumnPosition(pos) {
  newColumnPosition = pos;
  document.querySelectorAll('.bubble-btn').forEach(b => b.classList.toggle('active', b.dataset.pos === pos));
}

function addColumnToDraft() {
  if (!draftTable) return;
  const nameInput = document.getElementById('new-column-name');
  const label = nameInput.value.trim();
  if (!label) { alert('Merci de donner un nom à la nouvelle colonne.'); return; }
  syncGridInputsToDraft();

  let key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!key || draftTable.columns.find(c => c.key === key)) key = 'col_' + Date.now();
  const newCol = { key, label };

  if (newColumnPosition === 'left') draftTable.columns.unshift(newCol);
  else draftTable.columns.push(newCol);

  draftTable.rows.forEach(r => { r[key] = ''; });

  renderEditorGridHtml(draftTable);
  nameInput.value = '';
}

function cancelEditorGrid() {
  document.getElementById('editor-grid-panel').style.display = 'none';
  document.getElementById('editor-universe').disabled = false;
  document.getElementById('editor-name').value = '';
  document.getElementById('editor-columns').value = '';
  document.getElementById('editor-description').value = '';
  document.getElementById('new-column-name').value = '';
  setNewColumnPosition('right');
  draftTable = null;
}

function saveEditorTable() {
  if (!draftTable) return;
  syncGridInputsToDraft();
  draftTable.custom = true;

  const list = universes[draftTable.universeKey].tables;
  const idx = list.findIndex(t => t.id === draftTable.id);
  if (idx >= 0) list[idx] = draftTable; else list.push(draftTable);
  persistCustomTables();

  document.getElementById('editor-grid-panel').style.display = 'none';
  document.getElementById('editor-universe').disabled = false;
  document.getElementById('editor-name').value = '';
  document.getElementById('editor-columns').value = '';
  document.getElementById('editor-description').value = '';
  document.getElementById('new-column-name').value = '';
  setNewColumnPosition('right');
  draftTable = null;
  renderExistingTables();
}

function deleteCustomTable(universeKey, tableId) {
  universes[universeKey].tables = universes[universeKey].tables.filter(t => t.id !== tableId);
  persistCustomTables();
  renderExistingTables();
}

function toggleTableCategory(key) {
  if (expandedTableCategories.has(key)) expandedTableCategories.delete(key);
  else expandedTableCategories.add(key);
  renderExistingTables();
}

function copyTableToClipboard(universeKey, tableId) {
  const source = universes[universeKey].tables.find(t => t.id === tableId);
  if (!source) return;
  tableClipboard = JSON.parse(JSON.stringify(source));
  renderExistingTables();
}

function pasteTableIntoCategory(universeKey) {
  if (!tableClipboard || !universes[universeKey]) return;
  const newTable = JSON.parse(JSON.stringify(tableClipboard));
  newTable.id = 'custom-' + Date.now();
  newTable.universeKey = universeKey;
  newTable.custom = true;
  universes[universeKey].tables.push(newTable);
  persistCustomTables();
  expandedTableCategories.add(universeKey);
  renderExistingTables();
}

function renderExistingTables() {
  const container = document.getElementById('editor-existing-list');
  const orderedKeys = ['generique'].concat(Object.keys(universes).filter(k => k !== 'generique'));

  container.innerHTML = orderedKeys.map(uKey => {
    const u = universes[uKey];
    if (!u) return '';
    const isOpen = expandedTableCategories.has(uKey);
    const pasteDisabled = !tableClipboard;

    const bodyHtml = u.tables.length === 0
      ? '<p class="legend" style="margin:0;">Aucune table dans cette catégorie pour l\'instant.</p>'
      : u.tables.map(t => `
          <div class="existing-table-item">
            <div>${t.label} <span class="meta">— D${t.dice}</span></div>
            <div style="display:flex; gap:6px;">
              <button class="icon-btn" onclick="copyTableToClipboard('${uKey}','${t.id}')" title="Copier cette table">${copyIconSvg}</button>
              <button class="icon-btn" onclick="editTable('${uKey}','${t.id}')" title="Modifier">${gearIconSvg}</button>
              ${t.custom ? `<button onclick="deleteCustomTable('${uKey}','${t.id}')">Supprimer</button>` : ''}
            </div>
          </div>`).join('');

    return `<div class="table-category">
      <div class="table-category-header-row">
        <button class="table-category-toggle" onclick="toggleTableCategory('${uKey}')">
          <span class="chevron">${isOpen ? '▾' : '▸'}</span> ${u.label} <span class="meta">(${u.tables.length})</span>
        </button>
        <button class="icon-btn paste-icon" ${pasteDisabled ? 'disabled' : ''} onclick="pasteTableIntoCategory('${uKey}')" title="${pasteDisabled ? 'Copie une table d\'abord' : 'Coller ici'}">${pasteIconSvg}</button>
      </div>
      ${isOpen ? `<div class="table-category-body">${bodyHtml}</div>` : ''}
    </div>`;
  }).join('');
}

function exportTables() {
  const data = { universes: [], tables: {}, decks: cardDecks };
  Object.keys(universes).forEach(uKey => {
    if (universes[uKey].custom) data.universes.push({ key: uKey, label: universes[uKey].label });
    data.tables[uKey] = universes[uKey].tables.filter(t => t.custom);
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'oracleroll-tables.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importTables(event) {
  const file = event.target.files[0];
  if (!file) return;
  const statusBox = document.getElementById('editor-transfer-status');
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      let universeCount = 0;
      (data.universes || []).forEach(u => {
        if (!universes[u.key]) { universes[u.key] = { label: u.label, tables: [], custom: true }; universeCount++; }
      });

      let tableCount = 0;
      const tablesData = data.tables || data;
      Object.keys(tablesData).forEach(uKey => {
        if (!universes[uKey]) return;
        tablesData[uKey].forEach(t => {
          if (!universes[uKey].tables.find(existing => existing.id === t.id)) { universes[uKey].tables.push(t); tableCount++; }
        });
      });

      let deckCount = 0;
      (data.decks || []).forEach(d => {
        if (!cardDecks.find(existing => existing.id === d.id)) { cardDecks.push(d); deckCount++; }
      });

      persistCustomUniverses();
      persistCustomTables();
      persistCardDecks();
      renderUniverseGrid();
      renderEditorUniverseOptions();
      renderDeckEditorUniverseOptions();
      renderExistingUniverses();
      renderExistingTables();
      renderDeckEditorExisting();
      renderTirageDecksList();
      statusBox.style.display = 'block';
      statusBox.innerHTML = `<div class="detail">${universeCount} univers, ${tableCount} table${tableCount > 1 ? 's' : ''} et ${deckCount} deck${deckCount > 1 ? 's' : ''} importés avec succès.</div>`;
    } catch (err) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = `<div class="detail">Ce fichier n'est pas lisible. Vérifie qu'il s'agit bien d'un export d'oracleroll.</div>`;
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
