const DND_TABLE_CLASSES = {
  id: "dnd-classes",
  label: "Classes",
  group: "Personnage",
  hidden: true,
  dice: 12,
  description: "Obtenez la classe du personnage par un tirage.",
  columns: [
    { key: "nom", label: "Classe" },
    { key: "role", label: "Rôle au combat" },
    { key: "trait", label: "Particularité" }
  ],
  rows: DND_CLASS_DETAILS.map((d, i) => ({ v: i + 1, icon: d.icon, img: (DND_CLASS_IMAGES || {})[d.name] || null, nom: d.name, role: d.role, trait: d.trait }))
};

const DND_TABLE_RACES = {
  id: "dnd-races",
  label: "Races",
  group: "Personnage",
  hidden: true,
  dice: 13,
  description: "Obtenez la race d'un personnage dans un système inspiré de donjons et dragons.",
  columns: [
    { key: "nom", label: "Race" },
    { key: "trait", label: "Trait dominant" },
    { key: "avantage", label: "Avantage" }
  ],
  rows: DND_RACE_DETAILS.map((d, i) => ({ v: i + 1, icon: d.icon, img: (DND_RACE_IMAGES || {})[d.name] || null, nom: d.name, trait: d.trait, avantage: d.avantage }))
};

const universes = {
  dnd: {
    label: "D&D-like",
    builtIn: true,
    icon: "shield",
    combos: [
      { id: "dnd-pret-a-jouer", label: "🎲 Fiche d'aventurier", group: "Personnage", charGen: true },
      { id: "dnd-perso", label: "🎲 Tirage complet", group: "Personnage", tableIds: ["dnd-classes", "dnd-races"] }
    ],
    tables: [DND_TABLE_CLASSES, DND_TABLE_RACES]
  },
  sf: { label: "SF", tables: [], builtIn: true, icon: "rocket" },
  fantasy: { label: "Fantasy", builtIn: true, icon: "star", tables: [] },
  pirate: { label: "Pirate", tables: [], builtIn: true, icon: "anchor" },
  generique: {
    label: "Générique",
    builtIn: true,
    tables: [
      {
        id: "situation",
        label: "Situation",
        dice: 6,
        columns: [
          { key: "action", label: "Action" },
          { key: "lieu", label: "Lieu" },
          { key: "personnage", label: "Personnage" },
          { key: "objet", label: "Objet" },
          { key: "oracle", label: "Oracle" }
        ],
        rows: [
          { v: 1, action: "Attaquer", lieu: "Un endroit secret", personnage: "Un allié", objet: "Un artefact ancien", oracle: "Oui" },
          { v: 2, action: "Chercher", lieu: "Un lieu connu", personnage: "Un mentor", objet: "Un objet compromis", oracle: "Oui, et" },
          { v: 3, action: "Réparer", lieu: "Une capitale", personnage: "Un opportuniste", objet: "Un objet dangereux", oracle: "Oui, mais" },
          { v: 4, action: "Sauver", lieu: "Un lieu abandonné", personnage: "Un novice", objet: "Quelque chose d'utile", oracle: "Non, mais" },
          { v: 5, action: "Escorter", lieu: "Un espace surveillé", personnage: "Un ancien rival", objet: "Une ressource précieuse", oracle: "Non et" },
          { v: 6, action: "Contacter", lieu: "Un lieu dangereux", personnage: "Un ennemi", objet: "Un objet perdu", oracle: "Non" }
        ]
      }
    ]
  }
};

let currentUniverseKey = null;
let currentTable = null;

// ---------- TIRAGE COMBINÉ (Classe + Race en un seul tirage) ----------
let currentCombo = null;
let oracleReturnToCombo = null;
let oracleComboRolling = false;

// ---------- ANIMATION DE TIRAGE ORACLE ----------

// ---------- ANIMATION DE TIRAGE ORACLE ----------
let oracleAnimationEnabled = true;
let oracleRolling = false;

function loadOracleAnimationPref() {
  const raw = StorageService.loadAnimPref();
  if (raw !== null) oracleAnimationEnabled = raw === 'true';
  updateOracleAnimToggleButton();
}

function toggleOracleAnimation() {
  oracleAnimationEnabled = !oracleAnimationEnabled;
  StorageService.saveAnimPref(oracleAnimationEnabled);
  updateOracleAnimToggleButton();
}

function updateOracleAnimToggleButton() {
  const btn = document.getElementById('oracle-anim-toggle');
  if (!btn) return;
  btn.classList.toggle('active', oracleAnimationEnabled);
  btn.title = oracleAnimationEnabled ? "Désactiver l'animation de tirage" : "Activer l'animation de tirage";
}

function rowIconSvg(row) {
  if (row.img) return `<img class="row-icon" src="${row.img}" alt="">`;
  if (!row.icon || !ICON_LIBRARY[row.icon]) return '';
  return `<svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${ICON_LIBRARY[row.icon]}</svg>`;
}

function renderOracleTable(highlightValue, mixedMap) {
  const t = currentTable;
  let html = `<tr><th>D${t.dice}</th>` + t.columns.map(c => `<th>${escapeHtmlText(c.label)}</th>`).join('') + '</tr>';
  t.rows.forEach(row => {
    const isHi = !mixedMap && row.v === highlightValue;
    html += `<tr class="${isHi ? 'highlight' : ''}"><td>${row.v}</td>` +
      t.columns.map((c, i) => {
        const cellHi = mixedMap && mixedMap[c.key] === row.v;
        const content = i === 0
          ? `<div class="cell-icon-wrap">${rowIconSvg(row)}<span>${escapeHtmlText(row[c.key])}</span></div>`
          : escapeHtmlText(row[c.key]);
        return `<td class="${cellHi ? 'cell-highlight' : ''}">${content}</td>`;
      }).join('') + '</tr>';
  });
  document.getElementById('oracle-table').innerHTML = html;
}

function rollOracle() {
  if (!currentTable || oracleRolling) return;
  if (document.getElementById('oracle-category').value === 'mixed') { rollOracleMixed(); return; }
  const t = currentTable;
  const finalRoll = Math.floor(Math.random() * t.dice) + 1;

  if (!oracleAnimationEnabled) { finishOracleRoll(finalRoll, t); return; }

  oracleRolling = true;
  document.getElementById('oracle-roll-btn').disabled = true;

  const reelCount = 9;
  const reelValues = [];
  for (let i = 0; i < reelCount; i++) reelValues.push(Math.floor(Math.random() * t.dice) + 1);
  reelValues.push(finalRoll);

  const box = document.getElementById('oracle-result');
  box.innerHTML =
    `<div class="oracle-reel-wrap"><div class="oracle-reel-track" id="oracle-reel-track">` +
    reelValues.map(v => `<div class="oracle-reel-item">D${t.dice} = ${v}</div>`).join('') +
    `</div></div>`;

  const animDuration = 1100;
  let step = 0;
  function highlightTick() {
    if (step >= reelValues.length - 1) return;
    renderOracleTable(reelValues[step]);
    step++;
    setTimeout(highlightTick, animDuration / reelValues.length);
  }
  highlightTick();

  requestAnimationFrame(() => {
    const track = document.getElementById('oracle-reel-track');
    if (!track) return;
    const itemHeight = track.firstElementChild.offsetHeight;
    track.style.transform = `translateY(-${itemHeight * (reelValues.length - 1)}px)`;
  });

  setTimeout(() => {
    finishOracleRoll(finalRoll, t);
    oracleRolling = false;
    document.getElementById('oracle-roll-btn').disabled = false;
  }, animDuration + 60);
}

function finishOracleRoll(roll, t) {
  if (!t) t = currentTable;
  const row = t.rows.find(r => r.v === roll);
  renderOracleTable(roll);
  const category = document.getElementById('oracle-category').value;
  const iconHtml = rowIconSvg(row).replace('class="row-icon"', 'class="result-icon"');

  if (category === 'all') {
    document.getElementById('oracle-result').innerHTML =
      `${iconHtml}<div class="total">${t.columns.map(c => escapeHtmlText(row[c.key])).join(' · ')}</div>
       <div class="detail">D${t.dice} = ${roll}</div>`;
  } else {
    const colLabel = t.columns.find(c => c.key === category).label;
    document.getElementById('oracle-result').innerHTML =
      `${iconHtml}<div class="total">${escapeHtmlText(row[category])}</div>
       <div class="detail">${colLabel} (D${t.dice} = ${roll})</div>`;
  }
}

function rollOracleMixed() {
  const t = currentTable;
  const finalRolls = t.columns.map(() => Math.floor(Math.random() * t.dice) + 1);

  if (!oracleAnimationEnabled) { finishOracleRollMixed(finalRolls, t); return; }

  oracleRolling = true;
  document.getElementById('oracle-roll-btn').disabled = true;

  const reelCount = 9;
  const reelsByColumn = t.columns.map(() => {
    const values = [];
    for (let i = 0; i < reelCount; i++) values.push(Math.floor(Math.random() * t.dice) + 1);
    return values;
  });
  t.columns.forEach((c, idx) => reelsByColumn[idx].push(finalRolls[idx]));

  const box = document.getElementById('oracle-result');
  box.innerHTML = `<div class="oracle-mixed-reels">` +
    t.columns.map((c, idx) => `
      <div class="oracle-mixed-reel-col">
        <div class="oracle-mixed-reel-label">${escapeHtmlText(c.label)}</div>
        <div class="oracle-mixed-reel-wrap"><div class="oracle-mixed-reel-track" id="oracle-mixed-reel-track-${idx}">` +
          reelsByColumn[idx].map(v => `<div class="oracle-mixed-reel-item">${v}</div>`).join('') +
        `</div></div>
      </div>`).join('') +
    `</div>`;

  const animDuration = 1100;
  let step = 0;
  function highlightTick() {
    if (step >= reelCount) return;
    const mixedMap = {};
    t.columns.forEach((c, idx) => { mixedMap[c.key] = reelsByColumn[idx][step]; });
    renderOracleTable(null, mixedMap);
    step++;
    setTimeout(highlightTick, animDuration / (reelCount + 1));
  }
  highlightTick();

  requestAnimationFrame(() => {
    t.columns.forEach((c, idx) => {
      const track = document.getElementById('oracle-mixed-reel-track-' + idx);
      if (!track) return;
      const itemHeight = track.firstElementChild.offsetHeight;
      track.style.transform = `translateY(-${itemHeight * reelCount}px)`;
    });
  });

  setTimeout(() => {
    finishOracleRollMixed(finalRolls, t);
    oracleRolling = false;
    document.getElementById('oracle-roll-btn').disabled = false;
  }, animDuration + 60);
}

function finishOracleRollMixed(finalRolls, t) {
  if (!t) t = currentTable;
  const mixedMap = {};
  const parts = [];
  t.columns.forEach((c, idx) => {
    const roll = finalRolls[idx];
    const row = t.rows.find(r => r.v === roll);
    mixedMap[c.key] = roll;
    parts.push(`<div class="mixed-result-line"><span class="mixed-col-label">${escapeHtmlText(c.label)}</span> (D${t.dice} = ${roll}) : ${escapeHtmlText(row[c.key])}</div>`);
  });
  renderOracleTable(null, mixedMap);
  document.getElementById('oracle-result').innerHTML = parts.join('');
}

// ---------- TIRAGE COMBINÉ ----------
function openCombo(comboId) {
  const universe = universes[currentUniverseKey];
  currentCombo = universe.combos.find(c => c.id === comboId);
  document.getElementById('oracle-heading-decks').innerHTML = '';
  document.getElementById('oracle-tables-list').style.display = 'none';
  document.getElementById('oracle-table-detail').style.display = 'none';
  document.getElementById('oracle-char-detail').style.display = 'none';
  if (currentCombo.charGen) { openCharGen(); return; }
  document.getElementById('oracle-combo-detail').style.display = 'block';
  document.getElementById('oracle-heading').textContent = currentCombo.label;
  document.getElementById('oracle-combo-breadcrumb').textContent = `${universe.label} › ${currentCombo.label}`;
  document.getElementById('oracle-combo-result').innerHTML = '';
  document.getElementById('oracle-combo-detail-buttons').innerHTML = currentCombo.tableIds.map(id => {
    const t = universe.tables.find(tt => tt.id === id);
    return `<button class="action ghost" onclick="openTableFromCombo('${id}')">Détail - ${escapeHtmlText(t.label)}</button>`;
  }).join('');
}

function openTableFromCombo(tableId) {
  oracleReturnToCombo = currentCombo.id;
  document.getElementById('oracle-combo-detail').style.display = 'none';
  openTable(tableId);
}

function rollCombo() {
  if (!currentCombo || oracleComboRolling) return;
  const universe = universes[currentUniverseKey];
  const tables = currentCombo.tableIds.map(id => universe.tables.find(t => t.id === id));
  const finalRolls = tables.map(t => Math.floor(Math.random() * t.dice) + 1);

  if (!oracleAnimationEnabled) { finishCombo(finalRolls, tables); return; }

  oracleComboRolling = true;
  document.getElementById('oracle-combo-roll-btn').disabled = true;

  const reelCount = 9;
  const reelsByTable = tables.map(t => {
    const values = [];
    for (let i = 0; i < reelCount; i++) values.push(Math.floor(Math.random() * t.dice) + 1);
    return values;
  });
  tables.forEach((t, idx) => reelsByTable[idx].push(finalRolls[idx]));

  document.getElementById('oracle-combo-result').innerHTML = `<div class="oracle-mixed-reels">` +
    tables.map((t, idx) => `
      <div class="oracle-mixed-reel-col">
        <div class="oracle-mixed-reel-label">${escapeHtmlText(t.label)}</div>
        <div class="oracle-mixed-reel-wrap"><div class="oracle-mixed-reel-track" id="oracle-combo-reel-track-${idx}">` +
          reelsByTable[idx].map(v => {
            const row = t.rows.find(r => r.v === v);
            return `<div class="oracle-mixed-reel-item">${rowIconSvg(row).replace('class="row-icon"', 'class="combo-reel-icon"')}</div>`;
          }).join('') +
        `</div></div>
      </div>`).join('') +
    `</div>`;

  requestAnimationFrame(() => {
    tables.forEach((t, idx) => {
      const track = document.getElementById('oracle-combo-reel-track-' + idx);
      if (!track) return;
      const itemHeight = track.firstElementChild.offsetHeight;
      track.style.transform = `translateY(-${itemHeight * reelCount}px)`;
    });
  });

  const animDuration = 1100;
  setTimeout(() => {
    finishCombo(finalRolls, tables);
    oracleComboRolling = false;
    document.getElementById('oracle-combo-roll-btn').disabled = false;
  }, animDuration + 60);
}

function finishCombo(finalRolls, tables) {
  const parts = tables.map((t, idx) => {
    const roll = finalRolls[idx];
    const row = t.rows.find(r => r.v === roll);
    const nameKey = t.columns[0].key;
    return `<div class="combo-result-col">
      ${rowIconSvg(row).replace('class="row-icon"', 'class="result-icon"')}
      <div class="total">${escapeHtmlText(row[nameKey])}</div>
      <div class="detail">${escapeHtmlText(t.label)} - D${t.dice} = ${roll}</div>
    </div>`;
  });
  document.getElementById('oracle-combo-result').innerHTML = `<div class="combo-result-row">${parts.join('')}</div>`;
}