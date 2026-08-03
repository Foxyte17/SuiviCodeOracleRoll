const universes = {
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

function renderOracleTable(highlightValue, mixedMap) {
  const t = currentTable;
  let html = `<tr><th>D${t.dice}</th>` + t.columns.map(c => `<th>${escapeHtmlText(c.label)}</th>`).join('') + '</tr>';
  t.rows.forEach(row => {
    const isHi = !mixedMap && row.v === highlightValue;
    html += `<tr class="${isHi ? 'highlight' : ''}"><td>${row.v}</td>` +
      t.columns.map(c => {
        const cellHi = mixedMap && mixedMap[c.key] === row.v;
        return `<td class="${cellHi ? 'cell-highlight' : ''}">${escapeHtmlText(row[c.key])}</td>`;
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

  if (category === 'all') {
    document.getElementById('oracle-result').innerHTML =
      `<div class="total">${t.columns.map(c => escapeHtmlText(row[c.key])).join(' · ')}</div>
       <div class="detail">D${t.dice} = ${roll}</div>`;
  } else {
    const colLabel = t.columns.find(c => c.key === category).label;
    document.getElementById('oracle-result').innerHTML =
      `<div class="total">${escapeHtmlText(row[category])}</div>
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
