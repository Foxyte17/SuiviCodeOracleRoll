function rollSelectedDie() {
  if (!selectedDie) return;
  const sides = selectedDie === 'custom'
    ? (parseInt(document.getElementById('custom-sides').value, 10) || 1)
    : selectedDie;
  const count = parseInt(document.getElementById('dice-count').value, 10);
  const mod = parseInt(document.getElementById('dice-mod').value, 10) || 0;
  let rolls = [];
  for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);

  document.getElementById('dice-result').innerHTML = '';
  playDiceSpin(sides, () => displayDiceResult(sides, count, mod, rolls));
}

function playDiceSpin(sides, callback) {
  const stage = document.getElementById('dice-spin-stage');
  const wrap = document.getElementById('dice-spin-icon-wrap');
  const flash = document.getElementById('dice-flash');
  const shape = DIE_SHAPES[sides] || DIE_SHAPES.custom;

  wrap.innerHTML = `<svg class="dice-spin-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">${shape}</svg>`;
  flash.classList.remove('flashing');
  stage.style.display = 'flex';

  setTimeout(() => {
    flash.classList.add('flashing');
    setTimeout(() => {
      stage.style.display = 'none';
      callback();
    }, 150);
  }, 350);
}

function displayDiceResult(sides, count, mod, rolls) {
  const box = document.getElementById('dice-result');
  const modText = mod !== 0 ? (mod > 0 ? ' + ' + mod : ' - ' + Math.abs(mod)) : '';

  if (rolls.length === 1) {
    const total = rolls[0] + mod;
    box.innerHTML =
      `<div class="total">${total}</div>
       <div class="detail">1D${sides} [${rolls[0]}]${modText}</div>`;
    return;
  }

  if (diceMode === 'separation') {
    box.innerHTML =
      `<div class="detail" style="margin-bottom:8px;">${count}D${sides} — lancers séparés</div>
       <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
         ${rolls.map((r, i) => `<div style="text-align:center;">
           <div class="total" style="font-size:1.3rem;">${r}</div>
           <div class="detail">Dé ${i + 1}</div>
         </div>`).join('')}
       </div>`;
  } else if (diceMode === 'soustraction') {
    const maxV = Math.max(...rolls);
    const minV = Math.min(...rolls);
    const total = (maxV - minV) + mod;
    box.innerHTML =
      `<div class="total">${total}</div>
       <div class="detail">${count}D${sides} [${rolls.join(', ')}] — ${maxV} - ${minV}${modText}</div>`;
  } else if (diceMode === 'avantage' || diceMode === 'desavantage') {
    const kept = diceMode === 'avantage' ? Math.min(...rolls) : Math.max(...rolls);
    const total = kept + mod;
    const label = diceMode === 'avantage' ? 'avantage — garde le meilleur' : 'désavantage — garde le pire';
    box.innerHTML =
      `<div class="total">${total}</div>
       <div class="detail">${count}D${sides} [${rolls.join(', ')}] — ${label} (${kept})${modText}</div>`;
  } else {
    const total = rolls.reduce((a, b) => a + b, 0) + mod;
    box.innerHTML =
      `<div class="total">${total}</div>
       <div class="detail">${count}D${sides} [${rolls.join(', ')}]${modText}</div>`;
  }
}
