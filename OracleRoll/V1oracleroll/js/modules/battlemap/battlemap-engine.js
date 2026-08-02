const BM_TERRAINS = {
  glace: 'var(--terrain-glace)', blanc: 'var(--terrain-blanc)', herbe: 'var(--terrain-herbe)',
  sable: 'var(--terrain-sable)', eau: 'var(--terrain-eau)', lave: 'var(--terrain-lave)'
};
const BM_PION_COLORS = ['#c19a49', '#8b4a4a', '#4a7a5a', '#3f6d8b', '#b0793f', '#8b4a8b', '#a9c9d4', '#3f8b7a'];
const BM_DRAW_COLORS = ['#14181f', '#f5f2e8', '#7ec98a', '#e0b968', '#5f9dc4', '#b0555f'];
const BM_SHAPES = ['rond', 'carre', 'triangle'];
const BM_TERRAIN_HEX = {
  blanc: '#e6e0cf', herbe: '#4a7a5a', sable: '#b0793f',
  glace: '#a9c9d4', eau: '#3f6d8b', lave: '#8b3a2f'
};
const BM_SHAPE_LABELS = { rond: '○', carre: '▢', triangle: '△' };

let bmState = { size: 10, texture: 'blanc', pions: [], strokes: [], cellOverrides: {} };
let bmDessinActive = false;
let bmDrawSelection = { type: 'line', value: BM_DRAW_COLORS[0] };
let bmPionPanelOpen = false;
let bmSelectedPionId = null;
let bmNextPionColor = 0;
let bmDrawing = false;
let bmCurrentStroke = null;
let bmErasing = false;

function loadBattleMap() {
  const saved = StorageService.loadBattleMap();
  if (saved) {
    bmState.size = saved.size || 10;
    bmState.texture = saved.texture || 'blanc';
    bmState.pions = (saved.pions || []).map(p => ({ shape: 'rond', ...p }));
    bmState.strokes = (saved.strokes || []).map(s => Array.isArray(s) ? { color: '#14181f', points: s } : s);
    bmState.cellOverrides = saved.cellOverrides || {};
  }
}

function persistBattleMap() {
  StorageService.saveBattleMap(bmState);
}

function bmColLetter(i) { return String.fromCharCode(65 + i); }

function bmOccupied(r, c) { return bmState.pions.some(p => p.r === r && p.c === c); }

function bmCellColor(r, c) {
  const override = bmState.cellOverrides[r + '-' + c];
  return BM_TERRAINS[override || bmState.texture];
}

function bmCellColorHex(r, c) {
  const override = bmState.cellOverrides[r + '-' + c];
  return BM_TERRAIN_HEX[override || bmState.texture];
}

function bmDistToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function bmPointToRelative(e) {
  const grid = document.getElementById('bm-grid');
  const rect = grid.getBoundingClientRect();
  return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
}
