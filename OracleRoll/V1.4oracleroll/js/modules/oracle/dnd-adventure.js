// ============================================================
// dnd-adventure.js - Moteur du système D&D-like (OracleRoll)
// Compétences, combat, sorts, économie, aventure procédurale
// et événements chronométrés. Module isolé, globals préfixés dnd.
// ============================================================

// --- ÉTAT DU MODULE ---
let dndDC = 15;
let dndCombat = null;
let dndNegotiatedPrices = {};
let dndTimer = null;
let dndPaused = false;
let dndCurrentScene = null;
let dndCurrentQuest = null;
let dndCurrentShop = null;
let dndBrowserLevel = 1;

const DND_SHOPS = [
  {
    id: "armurerie", name: "Armurerie", items: [
      { name: "Épée courte", cost: 10 },
      { name: "Dague", cost: 2 },
      { name: "Cimeterre", cost: 15 },
      { name: "Hache d'armes", cost: 12 },
      { name: "Marteau de guerre", cost: 15 },
      { name: "Arc court", cost: 25 },
      { name: "Arc long", cost: 50 },
      { name: "Bouclier", cost: 10 },
      { name: "Armure de cuir", cost: 10 },
      { name: "Armure de cuir clouté", cost: 45 },
      { name: "Chemise de mailles", cost: 50 }
    ]
  },
  {
    id: "alchimiste", name: "Alchimiste", items: [
      { name: "Potions de soin (x2)", cost: 50 },
      { name: "Antidote", cost: 50 },
      { name: "Poison de base", cost: 100 },
      { name: "Torches (x3)", cost: 1 }
    ]
  },
  {
    id: "aventure", name: "Marchand d'aventure", items: [
      { name: "Matériel d'aventurier", cost: 1 },
      { name: "Corde (15 m)", cost: 2 },
      { name: "Pied-de-biche", cost: 2 },
      { name: "Miroir en acier", cost: 5 },
      { name: "Ration de voyage (x2)", cost: 1 }
    ]
  }
];

// ============================================================
// HELPERS
// ============================================================
function dndPickIndex(arr) { return Math.floor(Math.random() * arr.length); }

function dndCap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function dndAddJournal(text) {
  if (!currentCharacter) return;
  if (!currentCharacter.journal) currentCharacter.journal = [];
  currentCharacter.journal.push(text);
}

function dndRollD20() { return Math.floor(Math.random() * 20) + 1; }

function dndParseDice(str) {
  const m = /(\d*)D(\d+)([+-]\d+)?/i.exec(String(str));
  if (!m) return { count: 1, sides: 1, plus: 0 };
  return {
    count: m[1] ? parseInt(m[1], 10) : 1,
    sides: parseInt(m[2], 10),
    plus: m[3] ? parseInt(m[3], 10) : 0
  };
}

function dndRollDice(str) {
  const d = dndParseDice(str);
  let total = d.plus;
  for (let i = 0; i < d.count; i++) total += Math.floor(Math.random() * d.sides) + 1;
  return total;
}

function dndExtractDamage(text) {
  const m = /(\d+)D(\d+)/.exec(String(text));
  if (!m) return 0;
  const count = parseInt(m[1], 10), sides = parseInt(m[2], 10);
  let t = 0;
  for (let i = 0; i < count; i++) t += Math.floor(Math.random() * sides) + 1;
  return t;
}

function dndRollCheck(stat, opts) {
  opts = opts || {};
  const r1 = dndRollD20();
  const r2 = dndRollD20();
  const roll = opts.advantage ? Math.max(r1, r2) : opts.disadvantage ? Math.min(r1, r2) : r1;
  const mod = currentCharacter && currentCharacter.stats ? getModifier(currentCharacter.stats[stat]) : 0;
  return { roll, mod, total: roll + mod, crit: roll === 20, fumble: roll === 1 };
}

function dndCheckVerdict(res, dc) {
  if (res.crit) return { ok: true, label: 'Réussite critique !' };
  if (res.fumble) return { ok: false, label: 'Échec critique !' };
  return res.total >= dc ? { ok: true, label: 'Réussite' } : { ok: false, label: 'Échec' };
}

function dndDamageChar(amount) {
  if (!currentCharacter) return 0;
  if (currentCharacter.mort) return 0;
  const before = currentCharacter.pv;
  currentCharacter.pv = Math.max(0, currentCharacter.pv - amount);
  if (currentCharacter.pv <= 0 && before > 0) {
    currentCharacter.mort = true;
    if (!currentCharacter.etats.includes('Inconscient')) currentCharacter.etats.push('Inconscient');
    dndShowDeathModal();
  }
  return before - currentCharacter.pv;
}

function dndHealChar(amount) {
  if (!currentCharacter || currentCharacter.mort) return;
  currentCharacter.pv = Math.min(currentCharacter.hp, currentCharacter.pv + amount);
  currentCharacter.etats = (currentCharacter.etats || []).filter(e => e !== 'Inconscient');
}

function dndShowDeathModal() {
  if (dndTimer && dndTimer.interval) clearInterval(dndTimer.interval);
  dndTimer = null;
  dndCombat = null;
  ['dnd-pause-overlay', 'dnd-timer-overlay', 'dnd-spell-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const overlay = document.getElementById('dnd-death-overlay');
  if (overlay) overlay.style.display = 'flex';
  dndAddJournal('Le héros succombe... c\'est la fin de son aventure.');
}

function dndDeathNewCharacter() {
  if (typeof resetCharGen === 'function') resetCharGen();
}

function dndDeathBackHome() {
  if (typeof backToUniverses === 'function') backToUniverses();
}

// ============================================================
// RENDU GLOBAL (appelé par renderSheet dans char-gen.js)
// ============================================================
function dndRenderSheet() {
  if (!currentCharacter) return;
  if (currentCharacter.mort || (currentCharacter.pv <= 0 && (currentCharacter.hp || 1) > 0)) {
    dndShowDeathModal();
  }
  dndRenderSkills();
  dndRenderCombat();
  dndRenderShop();
  dndRenderInn();
  dndRenderAdventure();
}

// ============================================================
// COMPÉTENCES
// ============================================================
function dndSetDC(dc) {
  dndDC = dc;
  document.querySelectorAll('#dnd-dc-toggle .bubble-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.dc, 10) === dc);
  });
}

function dndRenderSkills() {
  const list = document.getElementById('dnd-skills-list');
  if (!list || !currentCharacter) return;
  list.innerHTML = DND_SKILLS.map(s => {
    const mod = getModifier(currentCharacter.stats[s.stat]);
    const modStr = (mod >= 0 ? '+' : '') + mod;
    return `<div class="dnd-skill-row">
      <button class="dnd-skill-btn" onclick="dndSkillTest('${s.name.replace(/'/g, "\\'")}')">
        <span class="dnd-skill-name">${escapeHtmlText(s.name)}</span>
        <span class="dnd-skill-stat">${s.stat} ${modStr}</span>
      </button>
    </div>`;
  }).join('');
}

function dndSkillTest(skillName) {
  if (!currentCharacter) return;
  const skill = DND_SKILLS.find(s => s.name === skillName);
  if (!skill) return;
  const res = dndRollCheck(skill.stat);
  const verdict = dndCheckVerdict(res, dndDC);
  const box = document.getElementById('dnd-check-result');
  if (box) {
    const modStr = (res.mod >= 0 ? '+' : '') + res.mod;
    box.innerHTML = `<div class="dnd-check-line ${verdict.ok ? 'ok' : 'ko'}">
      <span class="dnd-check-name">${escapeHtmlText(skill.name)}</span>
      <span class="dnd-check-dice">1D20 = ${res.roll} ${modStr} = <strong>${res.total}</strong> / ${dndDC}</span>
      <span class="dnd-check-verdict">${verdict.label}</span>
    </div>`;
  }
  dndAddJournal(`Test de ${skill.name} : ${verdict.label} (${res.total}/${dndDC}).`);
}

// ============================================================
// COMBAT
// ============================================================
function dndComputeCA() {
  if (!currentCharacter) return 10;
  const armor = currentCharacter.inventaire.find(i => DND_ARMOR.some(a => a.name === i.name));
  let base = 10, dex = true;
  if (armor) {
    const a = DND_ARMOR.find(x => x.name === armor.name);
    base = a.ca; dex = a.dex;
  }
  let ca = base + (dex ? getModifier(currentCharacter.stats["DEX"]) : 0);
  if (currentCharacter.inventaire.some(i => i.name === "Bouclier")) ca += 2;
  currentCharacter.ca = ca;
  return ca;
}

function dndEquippedWeapon() {
  if (!currentCharacter) return DND_WEAPONS[0];
  for (const w of DND_WEAPONS) {
    if (currentCharacter.inventaire.some(i => i.name === w.name)) return w;
  }
  return DND_WEAPONS[0];
}

function dndRenderCombat() {
  const area = document.getElementById('dnd-combat-area');
  const caEl = document.getElementById('dnd-ca');
  const ca = dndComputeCA();
  if (caEl) caEl.textContent = ca;
  if (!area) return;
  if (!dndCombat) {
    area.innerHTML = '<p class="dnd-combat-empty">Rencontre un monstre pour tester ton armement.</p>';
    return;
  }
  const c = dndCombat;
  const weapon = dndEquippedWeapon();
  const pct = Math.max(0, Math.round(c.monsterHp / c.monster.pv * 100));
  area.innerHTML = `
    <div class="dnd-monster-card">
      <div class="dnd-monster-head">
        <strong>${escapeHtmlText(c.monster.name)}</strong>
        <span class="dnd-monster-meta">CA ${c.monster.ca} · ${escapeHtmlText(c.monster.attack)} ${c.monster.dmg}</span>
      </div>
      <div class="dnd-hp-track"><div class="dnd-hp-fill" style="width:${pct}%"></div></div>
      <span class="dnd-hp-label">Monstre : ${c.monsterHp} / ${c.monster.pv} PV</span>
    </div>
    <div class="dnd-combat-actions">
      <button class="action ghost small" onclick="dndAttackMonster()">Attaquer (${escapeHtmlText(weapon.name)})</button>
      <button class="action ghost small" onclick="dndFleeCombat()">Fuir</button>
    </div>
    <div class="dnd-combat-log">${c.log.map(l => `<p>${escapeHtmlText(l)}</p>`).join('')}</div>`;
}

function dndStartCombat() {
  if (!currentCharacter || currentCharacter.mort) return;
  const pool = DND_MONSTERS.filter(m => m.danger <= Math.max(1, currentCharacter.niveau));
  const list = pool.length ? pool : DND_MONSTERS;
  const monster = list[dndPickIndex(list)];
  dndCombat = { monster: monster, monsterHp: monster.pv, log: [] };
  dndAddJournal(`Combat : un ${monster.name} surgit !`);
  renderSheet();
}

function dndAttackMonster() {
  if (!dndCombat) return;
  const c = dndCombat;
  const weapon = dndEquippedWeapon();
  const mod = getModifier(currentCharacter.stats[weapon.mod]);
  const roll = dndRollD20();
  const total = roll + mod;
  c.log.push(`Tu attaques avec ${weapon.name} : ${roll} ${mod >= 0 ? '+' : ''}${mod} = ${total} (CA ${c.monster.ca}).`);
  if (roll === 20 || total >= c.monster.ca) {
    const crit = roll === 20;
    const base = dndRollDice(weapon.dmg);
    const dmg = (crit ? base * 2 : base) + mod;
    c.monsterHp -= dmg;
    c.log.push((crit ? 'Critique ! ' : '') + `Tu infliges ${dmg} dégâts.`);
    if (c.monsterHp <= 0) {
      const reward = 2 + Math.floor(Math.random() * 6);
      currentCharacter.or += reward;
      c.log.push(`${c.monster.name} vaincu ! (+${reward} PO)`);
      dndAddJournal(`Victoire contre ${c.monster.name} (+${reward} PO).`);
      dndCombat = null;
      renderSheet();
      return;
    }
  } else {
    c.log.push('Échec : tu manques ta cible.');
  }
  dndMonsterAttack();
  renderSheet();
}

function dndMonsterAttack() {
  const c = dndCombat;
  if (!c) return;
  const bonus = c.monster.danger + 1;
  const roll = dndRollD20();
  const total = roll + bonus;
  const ca = dndComputeCA();
  c.log.push(`Le ${c.monster.name} riposte : ${roll} + ${bonus} = ${total} (ta CA ${ca}).`);
  if (total >= ca) {
    const dmg = dndRollDice(c.monster.dmg);
    c.log.push(`Tu subis ${dmg} dégâts.`);
    dndDamageChar(dmg);
    if (currentCharacter.pv <= 0) {
      c.log.push('Tu es inconscient ! Le combat est perdu.');
      dndAddJournal(`Défaite contre ${c.monster.name} - inconscient.`);
      dndCombat = null;
    }
  } else {
    c.log.push('Le monstre manque son attaque.');
  }
}

function dndFleeCombat() {
  if (!dndCombat) return;
  const res = dndRollCheck("DEX");
  const verdict = dndCheckVerdict(res, 12);
  dndCombat.log.push(`Tu tentes de fuir : 1D20 ${res.mod >= 0 ? '+' : ''}${res.mod} = ${res.total} (seuil 12) - ${verdict.label}.`);
  if (verdict.ok) {
    dndCombat.log.push("Tu t'éloignes sain et sauf.");
    dndAddJournal('Tu as fui le combat.');
    dndCombat = null;
  } else {
    dndCombat.log.push('La fuite échoue !');
    dndMonsterAttack();
  }
  renderSheet();
}

// ============================================================
// SORTS
// ============================================================
function dndMaxSpells() {
  const maxLvl = currentCharacter.sortsNiveauMax || 1;
  return 3 + (maxLvl - 1);
}

function dndOpenSpellPicker() {
  const modal = document.getElementById('dnd-spell-modal');
  if (!modal || !currentCharacter) return;
  document.getElementById('dnd-spell-modal-title').textContent = 'Choisir mes sorts';
  const body = document.getElementById('dnd-spell-modal-body');
  const cls = currentCharacter.classe;
  const maxLvl = currentCharacter.sortsNiveauMax || 1;
  const maxPicks = dndMaxSpells();
  const levels = [];
  for (let l = 1; l <= maxLvl; l++) {
    const spells = DND_SPELLS.filter(s => s.classes.includes(cls) && s.niveau === l);
    levels.push(`<h4>Niveau ${l}</h4>` + (spells.length
      ? spells.map(sp => {
          const picked = currentCharacter.sorts.some(x => x.nom === sp.nom);
          const disabled = !picked && currentCharacter.sorts.length >= maxPicks;
          return `<label class="dnd-spell-pick ${picked ? 'picked' : ''}">
            <input type="checkbox" ${picked ? 'checked' : ''} ${disabled ? 'disabled' : ''}
              onchange="dndToggleSpellPick('${sp.nom.replace(/'/g, "\\'")}', ${sp.niveau})">
            <span class="dnd-spell-pick-name">${escapeHtmlText(sp.nom)}</span>
            <span class="dnd-spell-pick-meta">${sp.ecole}</span>
            <p class="dnd-spell-pick-effet">${escapeHtmlText(sp.effet)}</p>
          </label>`;
        }).join('')
      : '<p class="dnd-spell-empty">Aucun sort pour cette classe à ce niveau.</p>'));
  }
  body.innerHTML = `<p class="dnd-spell-hint">Classe : ${escapeHtmlText(cls)} - jusqu'à <strong>${maxPicks}</strong> sorts, niveaux débloqués : 1 à ${maxLvl}.</p>` + levels.join('');
  modal.style.display = 'flex';
}

function dndToggleSpellPick(nom, niveau) {
  if (!currentCharacter) return;
  const idx = currentCharacter.sorts.findIndex(x => x.nom === nom);
  if (idx >= 0) {
    currentCharacter.sorts.splice(idx, 1);
  } else {
    if (currentCharacter.sorts.length >= dndMaxSpells()) {
      alert(`Maximum de sorts atteint (${dndMaxSpells()}).`);
      return;
    }
    currentCharacter.sorts.push({ nom: nom, niveau: niveau });
  }
  renderSheet();
  dndOpenSpellPicker();
}

function dndOpenSpellBrowser() {
  const modal = document.getElementById('dnd-spell-modal');
  if (!modal) return;
  document.getElementById('dnd-spell-modal-title').textContent = 'Sorts par niveau';
  const body = document.getElementById('dnd-spell-modal-body');
  const maxUnlocked = currentCharacter ? (currentCharacter.sortsNiveauMax || 1) : 1;
  const levelBtns = Array.from({ length: 9 }, (_, i) => i + 1).map(l =>
    `<button class="bubble-btn ${l === dndBrowserLevel ? 'active' : ''}" onclick="dndSetSpellLevel(${l})">${l}</button>`
  ).join('');
  const spells = DND_SPELLS.filter(s => s.niveau === dndBrowserLevel);
  const unlocked = dndBrowserLevel <= maxUnlocked;
  body.innerHTML = `
    <p class="dnd-spell-hint">Niveaux de sorts débloqués : 1 à ${maxUnlocked}${maxUnlocked >= 3 ? ' (contenu supérieur à venir)' : ''}.</p>
    <div class="dnd-spell-levels">${levelBtns}</div>
    <div class="dnd-spell-browser-list">
      ${spells.length ? spells.map(sp => `
        <div class="dnd-spell-card ${unlocked ? '' : 'locked'}">
          <div class="dnd-spell-card-head">
            <strong>${escapeHtmlText(sp.nom)}</strong>
            <span class="dnd-spell-card-meta">${sp.ecole} - Niv.${sp.niveau}</span>
          </div>
          <div class="dnd-spell-card-detail">${escapeHtmlText(sp.temps)} · ${escapeHtmlText(sp.portee)} · ${escapeHtmlText(sp.duree)}</div>
          <p>${escapeHtmlText(sp.effet)}</p>
          <div class="dnd-spell-card-classes">${sp.classes.map(c => escapeHtmlText(c)).join(', ')}</div>
          ${unlocked ? '' : '<div class="dnd-spell-locknote">Niveau non débloqué (monte de niveau pour l\'ouvrir).</div>'}
        </div>`).join('')
      : `<p class="dnd-spell-empty">Aucun sort de niveau ${dndBrowserLevel} pour l'instant (sélection raisonnable - contenu à venir).</p>`}
    </div>`;
  modal.style.display = 'flex';
}

function dndSetSpellLevel(level) {
  dndBrowserLevel = level;
  dndOpenSpellBrowser();
}

function dndCloseSpellModal() {
  const modal = document.getElementById('dnd-spell-modal');
  if (modal) modal.style.display = 'none';
}

// ============================================================
// BOUTIQUE, MARCHANDAGE, AUBERGE
// ============================================================
function dndRenderShop() {
  const wrapper = document.getElementById('shop-wrapper');
  const shopContainer = document.getElementById('shop-container');
  if (!wrapper || !shopContainer) return;
  if (currentCharacter.aventureCommencee) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = 'block';
  shopContainer.innerHTML = `
    <div class="dnd-shop-tabs">${DND_SHOPS.map(s =>
      `<button class="bubble-btn ${s.id === dndCurrentShop.id ? 'active' : ''}" onclick="dndSelectShop('${s.id}')">${escapeHtmlText(s.name)}</button>`
    ).join('')}</div>
    <div class="dnd-shop-items">
      ${dndCurrentShop.items.map(item => {
        const effCost = dndEffectiveCost(item);
        const canAfford = currentCharacter.or >= effCost;
        const discounted = effCost < item.cost;
        return `<div class="shop-item">
          <span>${escapeHtmlText(item.name)} ${discounted ? `<em class="dnd-price-cut">${item.cost} → ${effCost}</em>` : ''} (${effCost} PO)</span>
          <span class="dnd-shop-btns">
            <button class="action ghost small" onclick="dndBargain('${item.name.replace(/'/g, "\\'")}')">Marchander</button>
            <button class="action ghost small" onclick="buyItem('${item.name.replace(/'/g, "\\'")}', ${effCost})" ${canAfford ? '' : 'disabled'}>Acheter</button>
          </span>
        </div>`;
      }).join('')}
    </div>`;
}

function dndSelectShop(id) {
  const s = DND_SHOPS.find(x => x.id === id);
  if (s) dndCurrentShop = s;
  renderSheet();
}

function dndEffectiveCost(item) {
  const n = dndNegotiatedPrices[item.name];
  return n !== undefined ? n : item.cost;
}

function dndBargain(itemName) {
  if (!currentCharacter) return;
  const item = dndCurrentShop.items.find(i => i.name === itemName);
  if (!item) return;
  const res = dndRollCheck("CHA");
  const verdict = dndCheckVerdict(res, 12);
  if (verdict.ok) {
    const price = Math.max(1, Math.floor(item.cost * 0.8));
    dndNegotiatedPrices[itemName] = price;
    dndAddJournal(`Marchandage réussi sur ${itemName} : ${price} PO.`);
  } else {
    dndAddJournal(`Marchandage raté sur ${itemName}.`);
  }
  renderSheet();
}

function dndRenderInn() {
  const inn = document.getElementById('dnd-inn');
  if (!inn) return;
  inn.innerHTML = `<div class="dnd-inn">
    <h4 class="dnd-inn-title">Auberge</h4>
    <button class="action ghost small" onclick="dndSleep()" ${currentCharacter.or >= 10 ? '' : 'disabled'}>Dormir (10 PO)</button>
  </div>`;
}

function dndSleep() {
  if (!currentCharacter || currentCharacter.mort || currentCharacter.or < 10) return;
  currentCharacter.or -= 10;
  dndHealChar(currentCharacter.hp);
  dndAddJournal('Nuit à l\'auberge : repos complet, PV restaurés.');
  renderSheet();
}

// ============================================================
// AVENTURE (modes A : chapitres / B : quêtes)
// ============================================================
function dndRenderAdventure() {
  const controls = document.getElementById('dnd-adv-controls');
  if (!controls) return;
  dndUpdateProgressUI();
  if (!currentCharacter.aventureCommencee) {
    controls.innerHTML = `
      <p class="dnd-adv-hint">Choisis ton mode d'aventure :</p>
      <div class="dnd-adv-mode-btns">
        <button class="action ghost small" onclick="dndLaunchAdventure('A')">Chapitres (oracle)</button>
        <button class="action ghost small" onclick="dndLaunchAdventure('B')">Quêtes</button>
      </div>`;
  } else {
    const modeLabel = currentCharacter.aventureMode === 'A' ? 'Chapitres (oracle)' : 'Quêtes';
    controls.innerHTML = `
      <div class="dnd-adv-status">
        <span class="dnd-adv-mode">Mode : ${modeLabel} · Niveau ${currentCharacter.niveau}</span>
        <button class="action ghost small" onclick="dndPauseAdventure()">Pause</button>
      </div>`;
  }
}

function dndLaunchAdventure(mode) {
  if (!currentCharacter || currentCharacter.mort) return;
  if (confirm("Une fois l'aventure commencée, les boutiques ferment. Tu pourras dormir à l'auberge, marchander au fil du récit et mettre l'aventure en pause à tout moment. Confirmer ?")) {
    currentCharacter.aventureCommencee = true;
    currentCharacter.aventureMode = mode;
    dndAddJournal(`L'aventure commence en mode ${mode === 'A' ? 'Chapitres' : 'Quêtes'}.`);
    if (mode === 'A') dndNextScene();
    else dndNextQuest();
    renderSheet();
  }
}

function dndContinueAdventure() {
  if (!currentCharacter) return;
  if (currentCharacter.progression >= 20) {
    const scene = document.getElementById('dnd-scene');
    if (scene) scene.innerHTML = `<div class="dnd-scene-result ok"><p>L'aventure est accomplie ! Ton héros entre dans la légende.</p></div>`;
    return;
  }
  if (currentCharacter.aventureMode === 'A') dndNextScene();
  else dndNextQuest();
}

function dndNextScene() {
  if (!currentCharacter) return;
  const lieu = DND_LIEUX[dndPickIndex(DND_LIEUX)];
  const obstacle = DND_OBSTACLES[dndPickIndex(DND_OBSTACLES)];
  const pnj = DND_PNJ[dndPickIndex(DND_PNJ)];
  dndCurrentScene = { lieu: lieu, obstacle: obstacle, pnj: pnj, dc: 15 };
  dndAddJournal(`Scène : ${lieu} - ${obstacle} - ${pnj}.`);
  renderSheet();
  const scene = document.getElementById('dnd-scene');
  if (!scene) return;
  scene.innerHTML = `
    <div class="dnd-scene-card">
      <p class="dnd-scene-loc">Vous êtes à ${escapeHtmlText(dndCap(lieu))}.</p>
      <p class="dnd-scene-obstacle">${escapeHtmlText(dndCap(obstacle))} vous barre la route. ${escapeHtmlText(dndCap(pnj))} vous observe.</p>
      <p class="dnd-scene-approach">Choisis une approche (jet contre 15) :</p>
      <div class="dnd-scene-actions">
        <button class="action ghost small" onclick="dndResolveScene('FOR','Combat')">Combattre (FOR)</button>
        <button class="action ghost small" onclick="dndResolveScene('CHA','Négociation')">Négocier (CHA)</button>
        <button class="action ghost small" onclick="dndResolveScene('DEX','Discrétion')">Discrétion (DEX)</button>
      </div>
    </div>`;
}

function dndResolveScene(stat, label) {
  if (!currentCharacter || !dndCurrentScene) return;
  const dc = dndCurrentScene.dc;
  const res = dndRollCheck(stat);
  const verdict = dndCheckVerdict(res, dc);
  const scene = document.getElementById('dnd-scene');
  if (!scene) return;
  if (verdict.ok) {
    const reward = 1 + Math.floor(Math.random() * 6);
    currentCharacter.or += reward;
    dndAddJournal(`Scène résolue par ${label} : ${verdict.label} (+${reward} PO).`);
    dndAdvanceProgress(1);
    scene.innerHTML = `<div class="dnd-scene-result ok">
      <p>${verdict.label} - L'obstacle est surmonté ! (+${reward} PO)</p>
      <button class="action success" onclick="dndContinueAdventure()">Continuer l'aventure</button>
    </div>`;
    dndMaybeTriggerEvent();
  } else {
    const dmg = 1 + Math.floor(Math.random() * 4);
    dndDamageChar(dmg);
    dndAddJournal(`Scène : échec de ${label} (${verdict.label}), ${dmg} dégâts.`);
    scene.innerHTML = `<div class="dnd-scene-result ko">
      <p>${verdict.label} - Tu subis ${dmg} dégâts. Tu peux tenter une autre approche ou forcer le passage.</p>
      <div class="dnd-scene-actions">
        <button class="action ghost small" onclick="dndResolveScene('${stat}','${label}')">Réessayer</button>
        <button class="action ghost small" onclick="dndContinueAdventure()">Forcer le passage</button>
      </div>
    </div>`;
  }
}

function dndNextQuest() {
  if (!currentCharacter) return;
  const q = DND_QUESTS[dndPickIndex(DND_QUESTS)];
  dndCurrentQuest = q;
  dndAddJournal(`Quête : ${q.titre} (${q.objectif}).`);
  renderSheet();
  const scene = document.getElementById('dnd-scene');
  if (!scene) return;
  scene.innerHTML = `
    <div class="dnd-scene-card">
      <p class="dnd-scene-loc">Quête : <strong>${escapeHtmlText(q.titre)}</strong></p>
      <p class="dnd-scene-obstacle">${escapeHtmlText(q.objectif)}</p>
      <p class="dnd-scene-approach">Récompense : ${q.recompense} - choisis une approche (jet contre ${q.dc}) :</p>
      <div class="dnd-scene-actions">
        <button class="action ghost small" onclick="dndResolveQuest('FOR','Combat')">Combattre (FOR)</button>
        <button class="action ghost small" onclick="dndResolveQuest('CHA','Négociation')">Négocier (CHA)</button>
        <button class="action ghost small" onclick="dndResolveQuest('SAG','Survie')">Survie (SAG)</button>
      </div>
    </div>`;
}

function dndResolveQuest(stat, label) {
  if (!currentCharacter || !dndCurrentQuest) return;
  const q = dndCurrentQuest;
  const res = dndRollCheck(stat);
  const verdict = dndCheckVerdict(res, q.dc);
  const scene = document.getElementById('dnd-scene');
  if (!scene) return;
  if (verdict.ok) {
    const reward = parseInt(q.recompense, 10) || 10;
    currentCharacter.or += reward;
    dndAddJournal(`Quête « ${q.titre} » accomplie par ${label} : ${verdict.label} (+${reward} PO).`);
    dndAdvanceProgress(1);
    scene.innerHTML = `<div class="dnd-scene-result ok">
      <p>Quête accomplie : ${escapeHtmlText(q.titre)} (+${reward} PO)</p>
      <button class="action success" onclick="dndContinueAdventure()">Quête suivante</button>
    </div>`;
    dndMaybeTriggerEvent();
  } else {
    const dmg = 1 + Math.floor(Math.random() * 4);
    dndDamageChar(dmg);
    dndAddJournal(`Quête : échec de ${label} (${verdict.label}), ${dmg} dégâts.`);
    scene.innerHTML = `<div class="dnd-scene-result ko">
      <p>${verdict.label} - Tu subis ${dmg} dégâts. Réessaie ou laisse tomber cette quête.</p>
      <div class="dnd-scene-actions">
        <button class="action ghost small" onclick="dndResolveQuest('${stat}','${label}')">Réessayer</button>
        <button class="action ghost small" onclick="dndContinueAdventure()">Quête suivante</button>
      </div>
    </div>`;
  }
}

function dndAdvanceProgress(steps) {
  currentCharacter.progression = Math.min(20, currentCharacter.progression + steps);
  dndCheckLevelUp();
  dndUpdateProgressUI();
  if (currentCharacter.progression >= 20) {
    dndAddJournal('L\'aventure touche à sa fin triomphale !');
    const scene = document.getElementById('dnd-scene');
    if (scene) scene.innerHTML = `<div class="dnd-scene-result ok"><p>L'aventure est accomplie ! Ton héros entre dans la légende.</p></div>`;
  }
}

function dndCheckLevelUp() {
  if (currentCharacter.mort) return;
  const newLevel = Math.min(5, 1 + Math.floor(currentCharacter.progression / 4));
  while (currentCharacter.niveau < newLevel) {
    currentCharacter.niveau++;
    const cls = DND_CLASSES.find(c => c.name === currentCharacter.classe);
    if (cls) {
      currentCharacter.hp += cls.hitDie;
      currentCharacter.pv = currentCharacter.hp;
    }
    currentCharacter.sortsNiveauMax = Math.min(3, currentCharacter.niveau);
    dndAddJournal(`Niveau ${currentCharacter.niveau} atteint ! Nouveaux sorts débloqués : niveau ${currentCharacter.sortsNiveauMax}.`);
  }
}

function dndUpdateProgressUI() {
  const fill = document.getElementById('dnd-progress-fill');
  const label = document.getElementById('dnd-progress-label');
  if (fill) fill.style.width = (currentCharacter.progression / 20 * 100) + '%';
  if (label) label.textContent = currentCharacter.progression + ' / 20';
}

// ============================================================
// PAUSE & EXPORT
// ============================================================
function dndPauseAdventure() {
  dndPaused = true;
  const overlay = document.getElementById('dnd-pause-overlay');
  if (overlay) overlay.style.display = 'flex';
  dndAddJournal('Aventure mise en pause.');
}

function dndResumeAdventure() {
  dndPaused = false;
  const overlay = document.getElementById('dnd-pause-overlay');
  if (overlay) overlay.style.display = 'none';
  if (dndTimer && !dndTimer.resolved) {
    dndTimer.interval = setInterval(dndTimerTick, 1000);
  }
  dndAddJournal('Aventure reprise.');
}

function dndExportAndResume() {
  if (typeof exportCharacter === 'function') exportCharacter();
  dndResumeAdventure();
}

// ============================================================
// ÉVÉNEMENTS CHRONOMÉTRÉS (urgences)
// ============================================================
function dndMaybeTriggerEvent() {
  if (!currentCharacter || !currentCharacter.aventureCommencee) return;
  if (dndTimer) return;
  if (Math.random() < 0.35) {
    const evt = DND_EVENT_TYPES[dndPickIndex(DND_EVENT_TYPES)];
    dndTriggerEvent(evt.id);
  }
}

function dndTriggerEvent(eventId) {
  const evt = DND_EVENT_TYPES.find(e => e.id === eventId);
  if (!evt) return;
  dndTimer = { event: evt, remaining: evt.timeLimit, resolved: false, interval: null };
  dndRenderTimerOverlay();
  const overlay = document.getElementById('dnd-timer-overlay');
  if (overlay) overlay.style.display = 'flex';
  if (!dndPaused) {
    dndTimer.interval = setInterval(dndTimerTick, 1000);
  }
}

function dndTimerTick() {
  if (!dndTimer || dndTimer.resolved || dndPaused) return;
  dndTimer.remaining--;
  dndRenderTimerOverlay();
  if (dndTimer.remaining <= 0) {
    if (dndTimer.interval) clearInterval(dndTimer.interval);
    dndApplyEventConsequence(null);
  }
}

function dndRenderTimerOverlay() {
  if (!dndTimer) return;
  const evt = dndTimer.event;
  const title = document.getElementById('dnd-timer-title');
  const secs = document.getElementById('dnd-timer-secs');
  const fg = document.getElementById('dnd-timer-ring-fg');
  const actions = document.getElementById('dnd-timer-actions');
  if (title) title.textContent = evt.label + ' !';
  if (secs) secs.textContent = dndTimer.remaining;
  const R = 52, C = 2 * Math.PI * R;
  if (fg) {
    fg.style.strokeDasharray = C;
    fg.style.strokeDashoffset = C * (1 - dndTimer.remaining / evt.timeLimit);
  }
  const box = document.querySelector('.dnd-timer-box');
  if (box) box.classList.toggle('urgent', dndTimer.remaining <= 10);
  if (actions) {
    actions.innerHTML = evt.actions.map((a, i) =>
      `<button class="action ghost small" onclick="dndTimerAction(${i})">${escapeHtmlText(a.label)} (${a.stat})</button>`
    ).join('');
  }
}

function dndTimerAction(index) {
  if (!dndTimer || dndTimer.resolved) return;
  if (dndTimer.interval) clearInterval(dndTimer.interval);
  const action = dndTimer.event.actions[index];
  const res = dndRollCheck(action.stat);
  const verdict = dndCheckVerdict(res, dndTimer.event.dc);
  if (verdict.ok) {
    dndTimer.resolved = true;
    dndAddJournal(`${dndTimer.event.label} : surmonté par ${action.label} (${verdict.label}).`);
    dndCloseTimerOverlay();
  } else {
    dndTimer.resolved = true;
    dndApplyEventConsequence(action.label);
  }
}

function dndApplyEventConsequence(method) {
  const evt = dndTimer ? dndTimer.event : null;
  if (!evt) { dndCloseTimerOverlay(); return; }
  const dmg = dndExtractDamage(evt.consequence);
  const applied = dndDamageChar(dmg);
  dndAddJournal(`${evt.label}${method ? ' (après ' + method + ')' : ''} : ${evt.consequence}${applied > 0 ? ` (${applied} dégâts subis)` : ''}.`);
  dndCloseTimerOverlay();
  renderSheet();
}

function dndCloseTimerOverlay() {
  const overlay = document.getElementById('dnd-timer-overlay');
  if (overlay) overlay.style.display = 'none';
  dndTimer = null;
  renderSheet();
}

// ============================================================
// NETTOYAGE
// ============================================================
function dndReset() {
  if (dndTimer && dndTimer.interval) clearInterval(dndTimer.interval);
  dndTimer = null;
  dndCombat = null;
  dndNegotiatedPrices = {};
  dndDC = 15;
  dndPaused = false;
  dndCurrentScene = null;
  dndCurrentQuest = null;
  dndCurrentShop = DND_SHOPS[0];
  dndBrowserLevel = 1;
  ['dnd-pause-overlay', 'dnd-timer-overlay', 'dnd-spell-modal', 'dnd-death-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function dndStopAll() {
  dndReset();
}

dndCurrentShop = DND_SHOPS[0];
