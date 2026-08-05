// ============================================================
// char-gen.js - Fiche d'aventurier (générateur de personnage D&D-like)
// Données partagées : dnd-data.js (races, classes, détails, icônes).
// ============================================================

const DND_STAT_NAMES = ["FOR", "DEX", "CON", "INT", "SAG", "CHA"];
const DND_STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const DND_CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><path d="M20 6 9 17l-5-5"/></svg>';
const DND_LOCK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

let currentCharacter = null;
let rolledStats = null;
let currentStatMode = '4d6';

function roll4d6DropLowest() {
  const rolls = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
}

function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

function dndIconSvg(key) {
  if (!key || !ICON_LIBRARY[key]) return '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${ICON_LIBRARY[key]}</svg>`;
}

function dndClassImg(name) {
  const src = DND_CLASS_IMAGES && DND_CLASS_IMAGES[name];
  if (!src) {
    const det = classDetail(name);
    return dndIconSvg(det ? det.icon : '');
  }
  return `<img class="dnd-class-icon" src="${src}" alt="${escapeHtmlText(name)}">`;
}

function dndRaceImg(name) {
  const src = DND_RACE_IMAGES && DND_RACE_IMAGES[name];
  if (!src) {
    const det = raceDetail(name);
    return dndIconSvg(det ? det.icon : '');
  }
  return `<img class="dnd-race-icon" src="${src}" alt="${escapeHtmlText(name)}">`;
}

function classDetail(name) {
  return DND_CLASS_DETAILS.find(c => c.name === name);
}

function raceDetail(name) {
  return DND_RACE_DETAILS.find(r => r.name === name);
}

// --- MODE DE STATISTIQUES (4D6 / répartition fixe) ---
function setStatMode(mode) {
  currentStatMode = mode;
  document.querySelectorAll('.stat-mode-toggle .bubble-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const allocator = document.getElementById('array-allocator');
  const diceBtn = document.getElementById('btn-dice');
  if (mode === '4d6') {
    allocator.style.display = 'none';
    diceBtn.style.display = '';
  } else {
    buildArrayAllocator();
    allocator.style.display = 'grid';
    diceBtn.style.display = 'none';
  }
}

function buildArrayAllocator() {
  const container = document.getElementById('array-allocator');
  container.innerHTML = DND_STAT_NAMES.map(stat =>
    `<div class="alloc-group">
      <label>${stat}</label>
      <select class="alloc-select" data-stat="${stat}" onchange="updateArrayOptions()"></select>
    </div>`
  ).join('');
  updateArrayOptions();
}

function updateArrayOptions() {
  const selects = document.querySelectorAll('.alloc-select');
  const selectedValues = Array.from(selects).map(s => s.value).filter(v => v !== "");
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Choisir...</option>' +
      DND_STANDARD_ARRAY.map(val => {
        const available = val.toString() === currentValue || !selectedValues.includes(val.toString());
        return available
          ? `<option value="${val}" ${val.toString() === currentValue ? 'selected' : ''}>${val}</option>`
          : '';
      }).join('');
  });
}

// --- LANCER DES DÉS (même animation que l'onglet Dés) ---
function rollDice() {
  const stage = document.getElementById('char-dice-spin');
  if (!stage) {
    rolledStats = DND_STAT_NAMES.map(() => roll4d6DropLowest());
    setDiceResult(rolledStats, 'Statistiques tirées (4D6, garde les 3 meilleurs)');
    return;
  }
  const wrap = document.getElementById('char-dice-spin-icon-wrap');
  const flash = document.getElementById('char-dice-flash');
  const btn = document.getElementById('btn-dice');
  wrap.innerHTML = `<svg class="dice-spin-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">${DIE_SHAPES[6]}</svg>`;
  flash.classList.remove('flashing');
  stage.style.display = 'flex';
  if (btn) btn.disabled = true;

  setTimeout(() => {
    flash.classList.add('flashing');
    setTimeout(() => {
      stage.style.display = 'none';
      if (btn) btn.disabled = false;
      rolledStats = DND_STAT_NAMES.map(() => roll4d6DropLowest());
      setDiceResult(rolledStats, 'Statistiques tirées (4D6, garde les 3 meilleurs)');
    }, 150);
  }, 350);
}

function setDiceResult(values, label) {
  const box = document.getElementById('char-dice-result');
  if (!box) return;
  box.innerHTML = `<div class="total">${values.join(' · ')}</div><div class="detail">${label}</div>`;
}

// --- GÉNÉRATION DU PERSONNAGE ---
function generateCharacter() {
  let finalStats = [];

  if (currentStatMode === '4d6') {
    if (!rolledStats) {
      rolledStats = DND_STAT_NAMES.map(() => roll4d6DropLowest());
    }
    finalStats = [...rolledStats];
  } else {
    const selects = document.querySelectorAll('.alloc-select');
    finalStats = Array.from(selects).map(s => parseInt(s.value, 10));
    if (finalStats.some(isNaN)) {
      alert('Veuillez attribuer toutes les caractéristiques avant de tirer le personnage.');
      return;
    }
  }

  const race = DND_RACES[Math.floor(Math.random() * DND_RACES.length)];
  const charClass = DND_CLASSES[Math.floor(Math.random() * DND_CLASSES.length)];
  const conMod = getModifier(finalStats[DND_STAT_NAMES.indexOf("CON")]);
  const dexMod = getModifier(finalStats[DND_STAT_NAMES.indexOf("DEX")]);
  const hp = charClass.hitDie + conMod;

  currentCharacter = {
    nom: "", age: "", taille: "",
    race: race, classe: charClass.name, niveau: 1,
    hp: hp, pv: hp, ca: 10 + dexMod,
    stats: {},
    or: 20,
    inventaire: [
      { name: "Vêtements de voyage", cost: 0 },
      { name: "Bourse", cost: 0 }
    ],
    sorts: [],
    sortsNiveauMax: 1,
    etats: [],
    progression: 0,
    aventureMode: null,
    aventureCommencee: false,
    journal: []
  };

  DND_STAT_NAMES.forEach((stat, index) => { currentCharacter.stats[stat] = finalStats[index]; });

  setDiceResult(finalStats, currentStatMode === '4d6'
    ? 'Statistiques tirées (4D6, garde les 3 meilleurs)'
    : 'Statistiques (répartition fixe)');
  document.getElementById('image-modal').style.display = 'flex';
}

function validateCharacterImage() {
  document.getElementById('image-modal').style.display = 'none';
  renderSheet();
}

// --- RENDU DE LA FICHE ---
function renderSheet() {
  const sheet = document.getElementById('character-sheet');
  if (!sheet || !currentCharacter) return;
  sheet.style.display = 'block';

  const controls = document.getElementById('char-gen-controls');
  if (controls) controls.style.display = 'none';

  document.getElementById('char-name').value = currentCharacter.nom;
  document.getElementById('char-age').value = currentCharacter.age;
  document.getElementById('char-size').value = currentCharacter.taille;
  document.getElementById('char-hp').innerText = `${currentCharacter.pv} / ${currentCharacter.hp}`;
  document.getElementById('char-level').innerText = currentCharacter.niveau;
  document.getElementById('char-gold').innerText = currentCharacter.or;

  const rDet = raceDetail(currentCharacter.race);
  document.getElementById('char-race-line').innerHTML =
    `<span class="rc-icon">${dndRaceImg(currentCharacter.race)}</span><span>${escapeHtmlText(currentCharacter.race)}</span>`;
  document.getElementById('char-class-line').innerHTML =
    `<span class="rc-icon">${dndClassImg(currentCharacter.classe)}</span><span>${escapeHtmlText(currentCharacter.classe)}</span>`;

  const raceIcon = document.getElementById('char-race-icon');
  if (raceIcon) raceIcon.innerHTML = dndRaceImg(currentCharacter.race);
  const classIcon = document.getElementById('char-class-icon');
  if (classIcon) classIcon.innerHTML = dndClassImg(currentCharacter.classe);

  const statsContainer = document.getElementById('stats-container');
  statsContainer.innerHTML = DND_STAT_NAMES.map(stat => {
    const value = currentCharacter.stats[stat];
    const mod = getModifier(value);
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
    return `<div class="stat-box">
      <div class="stat-name">${stat}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-mod">MOD ${modStr}</div>
    </div>`;
  }).join('');

  const spellsContainer = document.getElementById('spells-container');
  const mySpells = currentCharacter.sorts || [];
  spellsContainer.innerHTML = mySpells.length
    ? mySpells.map(s =>
        `<li><span>${escapeHtmlText(s.nom)} <em class="spell-lvl">(Niv.${s.niveau})</em></span><span class="spell-ok">${DND_CHECK_SVG}</span></li>`
      ).join('')
    : `<li class="spell-locked"><span>Choisis 3 sorts de niveau 1 avec le bouton « Choisir mes sorts ».</span><span class="spell-locked-icon">${DND_LOCK_SVG}</span></li>`;

  const invContainer = document.getElementById('inventory-container');
  invContainer.innerHTML = currentCharacter.inventaire.map((item, index) => {
    const canRefund = item.cost > 0 && !currentCharacter.aventureCommencee;
    return `<li class="inv-item">
      <span>${escapeHtmlText(item.name)}</span>
      ${canRefund ? `<button onclick="refundItem(${index})">Rembourser (${item.cost} PO)</button>` : ''}
    </li>`;
  }).join('');

  if (typeof dndRenderSheet === 'function') dndRenderSheet();
}

// --- BOUTIQUE & REMBOURSEMENT ---
function buyItem(name, cost) {
  if (currentCharacter.or >= cost) {
    currentCharacter.or -= cost;
    currentCharacter.inventaire.push({ name: name, cost: cost });
    renderSheet();
  }
}

function refundItem(index) {
  const item = currentCharacter.inventaire[index];
  if (item && item.cost > 0) {
    currentCharacter.or += item.cost;
    currentCharacter.inventaire.splice(index, 1);
    renderSheet();
  }
}

// --- CHANGEMENT RACE / CLASSE ---
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function updateRace(newRace) {
  if (!currentCharacter) return;
  currentCharacter.race = newRace;
  const panel = document.getElementById('race-detail-panel');
  if (panel) panel.style.display = 'none';
  renderSheet();
}

function updateClass(newClass) {
  if (!currentCharacter) return;
  currentCharacter.classe = newClass;
  const cls = DND_CLASSES.find(c => c.name === newClass);
  if (cls) {
    currentCharacter.hp = cls.hitDie + getModifier(currentCharacter.stats["CON"]);
    if (currentCharacter.pv === undefined || currentCharacter.pv > currentCharacter.hp) {
      currentCharacter.pv = currentCharacter.hp;
    }
  }
  const panel = document.getElementById('class-detail-panel');
  if (panel) panel.style.display = 'none';
  renderSheet();
}

// --- RE-TIRER (restaure les contrôles du haut) ---
function resetCharGen() {
  if (typeof dndReset === 'function') dndReset();
  currentCharacter = null;
  rolledStats = null;
  const sheet = document.getElementById('character-sheet');
  const controls = document.getElementById('char-gen-controls');
  if (sheet) sheet.style.display = 'none';
  if (controls) controls.style.display = '';
  const box = document.getElementById('char-dice-result');
  if (box) box.innerHTML = 'Vos statistiques ne sont pas encore tirées.';
  setStatMode('4d6');
}

// --- EXPORT / IMPORT JSON ---
function exportCharacter() {
  if (!currentCharacter) return;
  const dataStr = JSON.stringify(currentCharacter, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentCharacter.nom || 'personnage'}_fiche.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCharacter(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      currentCharacter = JSON.parse(e.target.result);
      if (!currentCharacter.inventaire) currentCharacter.inventaire = [];
      currentCharacter.inventaire = currentCharacter.inventaire.map(item =>
        typeof item === 'string' ? { name: item, cost: 0 } : item
      );
      if (currentCharacter.aventureCommencee === undefined) currentCharacter.aventureCommencee = false;
      if (!currentCharacter.niveau) currentCharacter.niveau = 1;
      if (currentCharacter.pv === undefined || currentCharacter.pv === null || currentCharacter.pv > currentCharacter.hp) currentCharacter.pv = currentCharacter.hp;
      if (currentCharacter.ca === undefined) {
        currentCharacter.ca = 10 + getModifier((currentCharacter.stats && currentCharacter.stats["DEX"]) || 10);
      }
      if (!currentCharacter.sorts) {
        currentCharacter.sorts = (currentCharacter.sorts_disponibles || []).map(n => ({ nom: n, niveau: 1 }));
      }
      if (!currentCharacter.sortsNiveauMax) currentCharacter.sortsNiveauMax = 1;
      if (!currentCharacter.etats) currentCharacter.etats = [];
      if (!currentCharacter.progression) currentCharacter.progression = 0;
      if (currentCharacter.aventureMode === undefined) currentCharacter.aventureMode = null;
      if (!currentCharacter.journal) currentCharacter.journal = [];

      rolledStats = Object.values(currentCharacter.stats);
      setDiceResult(rolledStats, 'Fiche chargée depuis le fichier');

      renderSheet();
      alert('Fiche chargée avec succès !');
    } catch (error) {
      alert('Erreur lors de la lecture du fichier JSON.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// --- OUVERTURE DE LA VUE DEPUIS L'ORACLE ---
function openCharGen() {
  const universe = universes[currentUniverseKey];
  document.getElementById('oracle-heading-decks').innerHTML = '';
  document.getElementById('oracle-intro').style.display = 'none';
  document.getElementById('oracle-favorites-section').style.display = 'none';
  document.getElementById('oracle-tables-list').style.display = 'none';
  document.getElementById('oracle-table-detail').style.display = 'none';
  document.getElementById('oracle-combo-detail').style.display = 'none';
  document.getElementById('oracle-deck-detail').style.display = 'none';
  document.getElementById('oracle-heading').textContent = 'Fiche d\'aventurier';
  document.getElementById('oracle-char-breadcrumb').textContent = `${universe ? universe.label : ''} › Fiche d'aventurier`;
  document.getElementById('oracle-char-detail').style.display = 'block';
}

// --- MODALE « RÈGLES » ---
function openRulesModal() {
  const modal = document.getElementById('dnd-rules-modal');
  if (modal) modal.style.display = 'flex';
}

function closeRulesModal() {
  const modal = document.getElementById('dnd-rules-modal');
  if (modal) modal.style.display = 'none';
}

// --- INITIALISATION ---
function buildDetailPanel(id, items, kind) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const handler = kind === 'race' ? 'updateRace' : 'updateClass';
  panel.innerHTML = `<div class="detail-grid">` + items.map(d =>
    `<button type="button" class="detail-card" onclick="${handler}('${d.name}')">
      <span class="card-icon">${kind === 'class' ? dndClassImg(d.name) : dndRaceImg(d.name)}</span>
      <span class="card-text">
        <span class="card-name">${escapeHtmlText(d.name)}</span>
        <span class="card-sub">${escapeHtmlText(d.trait)}</span>
      </span>
    </button>`
  ).join('') + `</div>`;
}

function initCharGen() {
  buildDetailPanel('race-detail-panel', DND_RACE_DETAILS, 'race');
  buildDetailPanel('class-detail-panel', DND_CLASS_DETAILS, 'class');

  ['char-name', 'char-age', 'char-size'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      if (!currentCharacter) return;
      if (id === 'char-name') currentCharacter.nom = e.target.value;
      if (id === 'char-age') currentCharacter.age = e.target.value;
      if (id === 'char-size') currentCharacter.taille = e.target.value;
    });
  });
}

initCharGen();
