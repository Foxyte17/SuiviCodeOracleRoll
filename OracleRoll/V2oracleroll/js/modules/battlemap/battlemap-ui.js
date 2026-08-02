function renderBmConfig() {
  const sizeContainer = document.getElementById('bm-size-buttons');
  sizeContainer.innerHTML = [5, 10, 15].map(s =>
    `<button type="button" class="bm-size-btn ${s === bmState.size ? 'active' : ''}" onclick="setBmSize(${s})">${s}x${s}</button>`
  ).join('');

  const textureContainer = document.getElementById('bm-texture-buttons');
  textureContainer.innerHTML = Object.keys(BM_TERRAINS).map(key =>
    `<button type="button" class="bm-texture-btn ${key === bmState.texture ? 'active' : ''}" style="background:${BM_TERRAINS[key]};" title="${key}" onclick="setBmTexture('${key}')"></button>`
  ).join('');
}

function setBmSize(size) {
  bmState.size = size;
  bmState.pions = [];
  bmState.strokes = [];
  bmState.cellOverrides = {};
  bmSelectedPionId = null;
  persistBattleMap();
  renderBmConfig();
  renderBmGrid();
  renderBmPionList();
  requestAnimationFrame(resizeBmCanvas);
}

function setBmTexture(key) {
  bmState.texture = key;
  persistBattleMap();
  renderBmConfig();
  renderBmGrid();
}

function renderBmGrid() {
  const n = bmState.size;
  const grid = document.getElementById('bm-grid');
  grid.style.gridTemplateColumns = '22px repeat(' + n + ', 1fr)';
  grid.style.gridTemplateRows = '18px repeat(' + n + ', auto)';

  let html = '<div class="bm-corner"></div>';
  for (let c = 0; c < n; c++) html += `<div class="bm-label-col">${bmColLetter(c)}</div>`;
  for (let r = 0; r < n; r++) {
    html += `<div class="bm-label-row">${r + 1}</div>`;
    for (let c = 0; c < n; c++) {
      const available = bmSelectedPionId && !bmOccupied(r, c);
      html += `<div class="bm-cell ${available ? 'available' : ''}" style="background:${bmCellColor(r, c)};" data-r="${r}" data-c="${c}"></div>`;
    }
  }
  grid.innerHTML = html;

  requestAnimationFrame(resizeBmCanvas);
}

function renderBmPionsOverlay() {
  const wrap = document.getElementById('bm-grid-wrap');
  const layer = document.getElementById('bm-pions-layer');
  if (!wrap || !layer) return;
  const wrapRect = wrap.getBoundingClientRect();
  layer.innerHTML = '';
  bmState.pions.forEach(p => {
    const cellEl = document.querySelector(`.bm-cell[data-r="${p.r}"][data-c="${p.c}"]`);
    if (!cellEl) return;
    const cellRect = cellEl.getBoundingClientRect();
    const left = cellRect.left - wrapRect.left;
    const top = cellRect.top - wrapRect.top;
    const shape = p.shape || 'rond';
    const selected = p.id === bmSelectedPionId;
    const dotHtml = shape === 'triangle'
      ? `<svg class="bm-shape-triangle-svg" viewBox="0 0 100 100"><polygon points="50,6 6,94 94,94" fill="${p.color}" stroke="${selected ? 'var(--brass-bright)' : 'var(--ink)'}" stroke-width="${selected ? 2 : 1}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`
      : `<div class="bm-pion-dot bm-shape-${shape}" style="background:${p.color};"></div>`;
    layer.insertAdjacentHTML('beforeend',
      `<div class="bm-pion ${selected ? 'selected' : ''}" data-pion-id="${p.id}" style="position:absolute; left:${left}px; top:${top}px; width:${cellRect.width}px; height:${cellRect.height}px;">
        <div class="bm-pion-name">${escapeHtmlText(p.name)}</div>
        ${dotHtml}
      </div>`
    );
  });
}

function onBmCellPointerDown(r, c) {
  if (bmSelectedPionId) {
    if (!bmOccupied(r, c)) {
      const pion = bmState.pions.find(p => p.id === bmSelectedPionId);
      pion.r = r; pion.c = c;
      bmSelectedPionId = null;
      persistBattleMap();
      renderBmGrid();
    }
    return;
  }
}

function onBmPionPointerDown(pionId) {
  bmSelectedPionId = (bmSelectedPionId === pionId) ? null : pionId;
  renderBmGrid();
}

document.getElementById('bm-grid-wrap').addEventListener('pointerdown', function (e) {
  if (e.pointerType === 'pen' && bmDessinActive) {
    if (bmDrawSelection.type === 'fill') { bmPaintCellAt(e); }
    else if (bmDrawSelection.type === 'erase-stroke' || bmDrawSelection.type === 'erase-precise') {
      bmErasing = true;
      document.getElementById('bm-grid-wrap').setPointerCapture(e.pointerId);
      bmEraseAt(e, bmDrawSelection.type === 'erase-precise');
      e.preventDefault();
    } else { bmStartStroke(e); }
    return;
  }
  const pionEl = e.target.closest('.bm-pion');
  if (pionEl) { onBmPionPointerDown(pionEl.dataset.pionId); return; }
  const cellEl = e.target.closest('.bm-cell');
  if (cellEl) { onBmCellPointerDown(parseInt(cellEl.dataset.r, 10), parseInt(cellEl.dataset.c, 10)); }
});
document.getElementById('bm-grid-wrap').addEventListener('pointermove', function (e) {
  if (bmDrawing) bmContinueStroke(e);
  else if (bmErasing) { bmEraseAt(e, bmDrawSelection.type === 'erase-precise'); e.preventDefault(); }
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
  document.getElementById('bm-grid-wrap').addEventListener(evt, function (e) {
    if (bmDrawing) bmEndStroke();
    if (bmErasing) { bmErasing = false; persistBattleMap(); }
  });
});

function bmPaintCellAt(e) {
  const cellEl = e.target.closest('.bm-cell');
  if (!cellEl) return;
  const r = parseInt(cellEl.dataset.r, 10), c = parseInt(cellEl.dataset.c, 10);
  bmState.cellOverrides[r + '-' + c] = bmDrawSelection.value;
  persistBattleMap();
  renderBmGrid();
  e.preventDefault();
}

function bmEraseAt(e, precise) {
  const grid = document.getElementById('bm-grid');
  const rect = grid.getBoundingClientRect();
  const px = e.clientX - rect.left, py = e.clientY - rect.top;
  const w = rect.width, h = rect.height;

  if (!precise) {
    const tol = 12;
    const before = bmState.strokes.length;
    bmState.strokes = bmState.strokes.filter(stroke => {
      const pts = stroke.points;
      for (let i = 0; i < pts.length - 1; i++) {
        if (bmDistToSegment(px, py, pts[i].x * w, pts[i].y * h, pts[i + 1].x * w, pts[i + 1].y * h) <= tol) return false;
      }
      return true;
    });
    if (bmState.strokes.length !== before) bmRedrawCanvas();
  } else {
    const radius = 16;
    const newStrokes = [];
    let changed = false;
    bmState.strokes.forEach(stroke => {
      let current = [];
      stroke.points.forEach(pt => {
        if (Math.hypot(pt.x * w - px, pt.y * h - py) <= radius) {
          changed = true;
          if (current.length > 1) newStrokes.push({ color: stroke.color, points: current });
          current = [];
        } else { current.push(pt); }
      });
      if (current.length > 1) newStrokes.push({ color: stroke.color, points: current });
      else if (!changed) newStrokes.push(stroke);
    });
    if (changed) { bmState.strokes = newStrokes; bmRedrawCanvas(); }
  }
}

function toggleBmDessin() {
  bmDessinActive = !bmDessinActive;
  document.getElementById('bm-btn-dessin').classList.toggle('active', bmDessinActive);
  const colorRow = document.getElementById('bm-draw-colors');
  colorRow.style.display = bmDessinActive ? 'flex' : 'none';
  if (bmDessinActive) renderBmDrawColors();
}

function renderBmDrawColors() {
  const container = document.getElementById('bm-draw-colors');
  const lineRow = BM_DRAW_COLORS.map(col =>
    `<button type="button" class="bm-pion-swatch ${bmDrawSelection.type === 'line' && col === bmDrawSelection.value ? 'active' : ''}" style="background:${col}; width:26px; height:26px;" onclick="setBmDrawSelection('line','${col}')"></button>`
  ).join('');
  const fillRow = Object.keys(BM_TERRAINS).map(key =>
    `<button type="button" class="bm-pion-swatch ${bmDrawSelection.type === 'fill' && key === bmDrawSelection.value ? 'active' : ''}" style="background:${BM_TERRAINS[key]}; width:26px; height:26px;" title="${key}" onclick="setBmDrawSelection('fill','${key}')"></button>`
  ).join('');
  const eraseRow = `
    <button type="button" class="bm-size-btn ${bmDrawSelection.type === 'erase-stroke' ? 'active' : ''}" onclick="setBmDrawSelection('erase-stroke', null)">Trait entier</button>
    <button type="button" class="bm-size-btn ${bmDrawSelection.type === 'erase-precise' ? 'active' : ''}" onclick="setBmDrawSelection('erase-precise', null)">Mode fin</button>`;
  container.innerHTML =
    `<div><div class="bm-draw-color-label">Trait</div><div class="bm-draw-color-row">${lineRow}</div></div>` +
    `<div><div class="bm-draw-color-label">Colorier une case (texture)</div><div class="bm-draw-color-row">${fillRow}</div></div>` +
    `<div><div class="bm-draw-color-label">Gomme</div><div class="bm-draw-color-row">${eraseRow}</div></div>`;
}

function setBmDrawSelection(type, value) {
  bmDrawSelection = { type, value };
  renderBmDrawColors();
}

function toggleBmPionPanel() {
  bmPionPanelOpen = !bmPionPanelOpen;
  document.getElementById('bm-pion-panel').style.display = bmPionPanelOpen ? 'block' : 'none';
  document.getElementById('bm-btn-pions').classList.toggle('active', bmPionPanelOpen);
  renderBmPionList();
}

function addBattleMapPion() {
  const n = bmState.size;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!bmOccupied(r, c)) {
        bmState.pions.push({
          id: 'bmpion-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          name: 'Pion ' + (bmState.pions.length + 1),
          color: BM_PION_COLORS[bmNextPionColor % BM_PION_COLORS.length],
          shape: 'rond', r, c
        });
        bmNextPionColor++;
        persistBattleMap();
        renderBmPionList();
        renderBmGrid();
        return;
      }
    }
  }
  alert('Plus de case libre sur la grille.');
}

function renderBmPionList() {
  const list = document.getElementById('bm-pion-list');
  if (bmState.pions.length === 0) {
    list.innerHTML = '<p class="legend">Aucun pion pour l\'instant.</p>';
    return;
  }
  list.innerHTML = bmState.pions.map(p => `
    <div class="bm-pion-row" style="flex-wrap:wrap;">
      <input type="text" class="deck-card-field" style="flex:1; min-width:100px;" value="${escapeHtmlText(p.name)}" oninput="updateBmPionName('${p.id}', this.value)">
      <div style="display:flex; gap:4px;">
        ${BM_SHAPES.map(sh => `<button type="button" class="bm-shape-btn ${sh === (p.shape || 'rond') ? 'active' : ''}" title="${sh}" onclick="updateBmPionShape('${p.id}','${sh}')">${BM_SHAPE_LABELS[sh]}</button>`).join('')}
      </div>
      <div style="display:flex; gap:4px; flex-wrap:wrap;">
        ${BM_PION_COLORS.map(col => `<button type="button" class="bm-pion-swatch ${col === p.color ? 'active' : ''}" style="background:${col};" onclick="updateBmPionColor('${p.id}','${col}')"></button>`).join('')}
      </div>
      <button onclick="removeBmPion('${p.id}')">Supprimer</button>
    </div>
  `).join('');
}

function updateBmPionName(id, name) {
  const pion = bmState.pions.find(p => p.id === id);
  if (pion) { pion.name = name; persistBattleMap(); renderBmGrid(); }
}

function updateBmPionColor(id, color) {
  const pion = bmState.pions.find(p => p.id === id);
  if (pion) { pion.color = color; persistBattleMap(); renderBmPionList(); renderBmGrid(); }
}

function updateBmPionShape(id, shape) {
  const pion = bmState.pions.find(p => p.id === id);
  if (pion) { pion.shape = shape; persistBattleMap(); renderBmPionList(); renderBmGrid(); }
}

function removeBmPion(id) {
  bmState.pions = bmState.pions.filter(p => p.id !== id);
  if (bmSelectedPionId === id) bmSelectedPionId = null;
  persistBattleMap();
  renderBmPionList();
  renderBmGrid();
}

function resetBmDrawing() {
  bmState.strokes = [];
  bmState.cellOverrides = {};
  persistBattleMap();
  renderBmGrid();
  bmRedrawCanvas();
}

function resetBmPions() {
  bmState.pions = [];
  bmSelectedPionId = null;
  persistBattleMap();
  renderBmPionList();
  renderBmGrid();
}

function resizeBmCanvas() {
  const wrap = document.getElementById('bm-grid-wrap');
  const grid = document.getElementById('bm-grid');
  const canvas = document.getElementById('bm-canvas');
  if (!wrap || !grid || !canvas) return;
  const rect = grid.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bmRedrawCanvas();
  renderBmPionsOverlay();
}

function bmRedrawCanvas() {
  const canvas = document.getElementById('bm-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const allStrokes = bmCurrentStroke ? bmState.strokes.concat([bmCurrentStroke]) : bmState.strokes;
  allStrokes.forEach(stroke => {
    if (stroke.points.length < 2) return;
    ctx.strokeStyle = stroke.color;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
    for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
    ctx.stroke();
  });
}

function bmStartStroke(e) {
  bmDrawing = true;
  bmCurrentStroke = { color: bmDrawSelection.value, points: [bmPointToRelative(e)] };
  document.getElementById('bm-grid-wrap').setPointerCapture(e.pointerId);
  e.preventDefault();
}

function bmContinueStroke(e) {
  if (!bmCurrentStroke) return;
  bmCurrentStroke.points.push(bmPointToRelative(e));
  bmRedrawCanvas();
  e.preventDefault();
}

function bmEndStroke() {
  if (bmCurrentStroke && bmCurrentStroke.points.length > 1) { bmState.strokes.push(bmCurrentStroke); persistBattleMap(); }
  bmCurrentStroke = null;
  bmDrawing = false;
  bmRedrawCanvas();
}

function exportBattleMapPng() {
  const n = bmState.size;
  const grid = document.getElementById('bm-grid');
  const firstCell = grid.querySelector('.bm-cell[data-r="0"][data-c="0"]');
  if (!firstCell) return;
  const gridRect = grid.getBoundingClientRect();
  const cellRect = firstCell.getBoundingClientRect();

  const SCALE = 3;
  const cellSize = cellRect.width * SCALE;
  const labelColW = (cellRect.left - gridRect.left) * SCALE;
  const labelRowH = (cellRect.top - gridRect.top) * SCALE;
  const totalW = labelColW + n * cellSize;
  const totalH = labelRowH + n * cellSize;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#14181f';
  ctx.fillRect(0, 0, totalW, totalH);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = labelColW + c * cellSize, y = labelRowH + r * cellSize;
      ctx.fillStyle = bmCellColorHex(r, c);
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.strokeStyle = '#3a4453';
      ctx.lineWidth = SCALE;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  const labelFont = Math.max(10, cellSize * 0.22);
  ctx.fillStyle = '#a8a08b';
  ctx.font = labelFont + 'px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let c = 0; c < n; c++) ctx.fillText(bmColLetter(c), labelColW + c * cellSize + cellSize / 2, labelRowH / 2);
  ctx.textAlign = 'right';
  for (let r = 0; r < n; r++) ctx.fillText(String(r + 1), labelColW - 6 * SCALE, labelRowH + r * cellSize + cellSize / 2);

  bmState.strokes.forEach(stroke => {
    if (stroke.points.length < 2) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 3 * SCALE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * totalW, stroke.points[0].y * totalH);
    for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x * totalW, stroke.points[i].y * totalH);
    ctx.stroke();
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const pionFont = Math.max(11, cellSize * 0.24);
  bmState.pions.forEach(p => {
    const cx = labelColW + p.c * cellSize + cellSize / 2;
    const cy = labelRowH + p.r * cellSize + cellSize / 2;
    const rad = cellSize * 0.32;
    ctx.fillStyle = p.color;
    ctx.strokeStyle = '#14181f';
    ctx.lineWidth = 1.5 * SCALE;
    ctx.beginPath();
    if (p.shape === 'carre') { ctx.rect(cx - rad, cy - rad, rad * 2, rad * 2); }
    else if (p.shape === 'triangle') { ctx.moveTo(cx, cy - rad); ctx.lineTo(cx - rad, cy + rad); ctx.lineTo(cx + rad, cy + rad); ctx.closePath(); }
    else { ctx.arc(cx, cy, rad, 0, Math.PI * 2); }
    ctx.fill();
    ctx.stroke();
    ctx.font = pionFont + 'px Georgia, serif';
    ctx.lineWidth = 3 * SCALE;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#14181f';
    ctx.strokeText(p.name, cx, cy - rad - 4 * SCALE);
    ctx.fillStyle = '#e6e0cf';
    ctx.fillText(p.name, cx, cy - rad - 4 * SCALE);
  });

  canvas.toBlob(function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'battlemap-' + new Date().toISOString().slice(0, 10) + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function exportBattleMapJson() {
  const data = { size: bmState.size, texture: bmState.texture, pions: bmState.pions, strokes: bmState.strokes, cellOverrides: bmState.cellOverrides };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'battlemap-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importBattleMapJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const statusBox = document.getElementById('bm-transfer-status');
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      bmState.size = data.size || 10;
      bmState.texture = data.texture || 'blanc';
      bmState.pions = (data.pions || []).map(p => ({ shape: 'rond', ...p }));
      bmState.strokes = (data.strokes || []).map(s => Array.isArray(s) ? { color: '#14181f', points: s } : s);
      bmState.cellOverrides = data.cellOverrides || {};
      bmSelectedPionId = null;
      persistBattleMap();
      renderBmConfig();
      renderBmGrid();
      renderBmPionList();
      requestAnimationFrame(resizeBmCanvas);
      statusBox.style.display = 'block';
      statusBox.innerHTML = '<div class="detail">Battle map importée avec succès.</div>';
    } catch (err) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = '<div class="detail">Ce fichier n\'est pas lisible. Vérifie qu\'il s\'agit bien d\'un export de battle map.</div>';
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

window.addEventListener('resize', () => {
  if (document.getElementById('tab-battlemap').classList.contains('active')) resizeBmCanvas();
});
