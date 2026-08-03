// ---- Normalisation de taille : toutes les icônes (type + catégorie) occupent la même empreinte ----
function _measureIcon(iconDef, r) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let lineW = 0;
  let current = null;
  const stack = [];
  let tx = 0, ty = 0, sx = 1, sy = 1;
  function includePoint(px, py) {
    const x = tx + px * sx, y = ty + py * sy;
    const m = lineW / 2;
    if (x - m < minX) minX = x - m;
    if (x + m > maxX) maxX = x + m;
    if (y - m < minY) minY = y - m;
    if (y + m > maxY) maxY = y + m;
  }
  function includeArc(x, y, rad, a0, a1) {
    const cx0 = tx + x * sx, cy0 = ty + y * sy;
    const rr = rad * sx;
    let span = a1 - a0;
    while (span < 0) span += Math.PI * 2;
    includePoint(cx0 + Math.cos(a0) * rr, cy0 + Math.sin(a0) * rr);
    includePoint(cx0 + Math.cos(a1) * rr, cy0 + Math.sin(a1) * rr);
    for (const t of [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]) {
      if (t >= a0 && t <= a0 + span) includePoint(cx0 + Math.cos(t) * rr, cy0 + Math.sin(t) * rr);
    }
  }
  function includeCmd(p) {
    const t = p[0];
    if (t === 'M' || t === 'L') includePoint(p[1], p[2]);
    else if (t === 'A') includeArc(p[1], p[2], p[3], p[4], p[5]);
    else if (t === 'Q') { includePoint(p[1], p[2]); includePoint(p[3], p[4]); }
    else if (t === 'B') { includePoint(p[1], p[2]); includePoint(p[3], p[4]); includePoint(p[5], p[6]); }
  }
  const rec = {
    save() { stack.push({ tx, ty, sx, sy }); },
    restore() { const s = stack.pop(); if (s) { tx = s.tx; ty = s.ty; sx = s.sx; sy = s.sy; } },
    translate(x, y) { tx += x; ty += y; },
    scale(x, y) { sx *= x; sy *= y; },
    beginPath() { current = []; },
    moveTo(x, y) { if (current) current.push(['M', x, y]); },
    lineTo(x, y) { if (current) current.push(['L', x, y]); },
    arc(x, y, rad, a0, a1) { if (current) current.push(['A', x, y, rad, a0, a1]); },
    quadraticCurveTo(x1, y1, x, y) { if (current) current.push(['Q', x1, y1, x, y]); },
    bezierCurveTo(x1, y1, x2, y2, x, y) { if (current) current.push(['B', x1, y1, x2, y2, x, y]); },
    closePath() {},
    stroke() { if (current) { current.forEach(includeCmd); current = null; } },
    fill() { if (current) { current.forEach(includeCmd); current = null; } },
    set lineWidth(v) { lineW = v; }
  };
  iconDef.draw(rec, 0, 0, r);
  if (current) current.forEach(includeCmd);
  return { minX, maxX, minY, maxY };
}

function _normalizeIcon(iconDef, targetHalf) {
  const bb = _measureIcon(iconDef, 1);
  const extent = Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY) / 2;
  if (!(extent > 0)) return iconDef;
  const scale = targetHalf / extent;
  return {
    label: iconDef.label,
    draw(ctx, cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      iconDef.draw(ctx, 0, 0, r);
      ctx.restore();
    }
  };
}

const TYPE_ICONS = {
  event: _normalizeIcon({
    label: 'Événement',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.6);
      ctx.lineTo(cx, cy + r * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.55, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.6),
  quest: _normalizeIcon({
    label: 'Quête',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.25, r * 0.35, Math.PI * 1.1, Math.PI * 2.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.02);
      ctx.lineTo(cx, cy + r * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.55, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.6),
  danger: _normalizeIcon({
    label: 'Danger',
    draw(ctx, cx, cy, r) {
      // Logo biohazard : 3 bras à 120° + pastilles aux extrémités + « ! » central
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.11;
      const armR = r * 0.52;
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(cx, cy, armR, a - Math.PI * 0.33, a + Math.PI * 0.33);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * armR, cy + Math.sin(a) * armR, r * 0.13, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineWidth = r * 0.13;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.22);
      ctx.lineTo(cx, cy + r * 0.04);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.15, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.6),
  unexpected: _normalizeIcon({
    label: 'Inattendu',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.1, cy - r * 0.65);
      ctx.lineTo(cx - r * 0.45, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.25, cy + r * 0.65);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.6)
};

const CATEGORY_ICONS = {
  npc: _normalizeIcon({
    label: 'PNJ',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.32, r * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy + r * 0.65);
      ctx.bezierCurveTo(cx - r * 0.5, cy + r * 0.05, cx - r * 0.28, cy + r * 0.2, cx, cy + r * 0.2);
      ctx.bezierCurveTo(cx + r * 0.28, cy + r * 0.2, cx + r * 0.5, cy + r * 0.05, cx + r * 0.5, cy + r * 0.65);
      ctx.stroke();
    }
  }, 0.6),
  monster: _normalizeIcon({
    label: 'Monstre',
    draw: function (ctx, cx, cy, r) {
      var S = 0.0101;
      var CX = 80.5809, CY = 98.5602;
      var P = [[['M',32.7901,0],['C',13.0357,9.0942,0,23.7162,0,40.1162],['C',0,50.9104,5.548,60.9058,14.9738,69.0715],['C',10.1517,79.5714,7.1231,91.3586,6.3707,103.8858],['C',13.4789,104.1181,20.2324,105.6242,26.2938,108.7227],['C',43.4777,117.5077,51.5462,136.3981,50.1836,158.7839],['C',53.3115,159.5404,56.5022,160.1709,59.7425,160.6773],['C',60.1121,153.7486,60.0856,146.8413,59.5375,139.9563],['L',67.2393,139.3424],['C',67.8338,146.7983,67.8454,154.231,67.4286,161.641],['C',70.745,161.9552,74.1011,162.1412,77.4836,162.2123],['L',77.4836,138.9641],['L',85.2091,138.9641],['L',85.2091,162.1689],['C',88.4461,162.0656,91.6967,161.8568,94.9511,161.543],['C',94.5398,154.1657,94.5542,146.7656,95.1454,139.3428],['L',102.8473,139.9567],['C',102.3003,146.8181,102.2726,153.7014,102.6389,160.6066],['C',105.6597,160.1643,108.6747,159.6331,111.6773,159.0179],['C',110.244,136.5304,118.3084,117.5391,135.551,108.7239],['C',141.6116,105.6246,148.3659,104.1177,155.4733,103.8862],['C',154.7114,91.1878,151.6108,79.2493,146.6743,68.642],['C',155.8024,60.5557,161.1618,50.7223,161.1618,40.1166],['C',161.1618,23.7166,148.1262,9.0942,128.3717,0.0012],['C',133.7688,6.8502,137.0914,15.0564,137.0914,23.7215],['C',137.0914,41.3693,124.0648,56.6349,105.248,63.8828],['L',102.7096,57.971],['C',107.3183,56.1355,111.4876,53.7555,115.0607,50.9579],['C',119.2361,47.6899,122.5856,43.894,124.9454,39.7321],['C',112.605,29.2592,97.3948,23.0787,80.922,23.0787],['C',64.245,23.0787,48.8603,29.4097,36.4389,40.1208],['C',38.7846,44.1308,42.0563,47.7916,46.1012,50.9579],['C',50.0989,54.0874,54.8428,56.6948,60.1133,58.6019],['L',57.5812,64.4988],['C',37.871,57.5274,24.0701,41.8868,24.0701,23.7215],['C',24.0701,15.0564,27.3931,6.8502,32.7901,0.0012],['Z'],['M',37.0425,75.7072],['C',37.0648,75.7055,37.0838,75.7089,37.095,75.7225],['C',44.7076,85.3757,58.5635,92.1337,74.751,93.5662],['C',72.3152,101.7096,63.593,107.8413,52.9766,107.8413],['C',40.4874,107.8413,30.1778,99.3316,30.1778,89.024],['C',30.1786,83.8709,32.743,79.1034,36.8379,75.7233],['C',36.8722,75.7622,36.9743,75.7122,37.0421,75.7068],['Z'],['M',124.5485,75.708],['C',124.5704,75.7068,124.5898,75.7105,124.6056,75.7246],['C',128.7012,79.1042,131.2665,83.8717,131.2665,89.0253],['C',131.2665,99.3316,120.9572,107.8417,108.4668,107.8417],['C',97.8504,107.8417,89.1291,101.7108,86.6924,93.5666],['C',102.88,92.1337,116.7363,85.3757,124.3488,75.7238],['C',124.3951,75.7589,124.482,75.7114,124.5485,75.708],['Z'],['M',80.9005,93.9618],['C',83.2259,105.2976,86.6585,116.6333,94.5059,127.969],['C',86.1244,130.2147,75.9776,130.2953,67.2951,127.969],['C',74.7233,116.6333,78.3886,105.2976,80.9005,93.9618],['Z'],['M',49.3531,166.5321],['C',48.3857,172.8986,46.7019,179.4718,44.2888,186.1162],['C',47.921,188.4892,51.7455,190.5169,55.725,192.1673],['C',57.2244,184.2194,58.4274,176.3022,59.1687,168.4147],['C',55.8531,167.9104,52.5773,167.2849,49.3526,166.5325],['Z'],['M',112.5232,166.7305],['C',109.4308,167.3523,106.3241,167.8909,103.2107,168.3378],['C',103.9453,176.1811,105.1351,184.0537,106.6205,191.956],['C',110.4206,190.345,114.0764,188.3883,117.556,186.1162],['C',115.1682,179.5405,113.4947,173.0342,112.5232,166.7301],['Z'],['M',95.5344,169.2585],['C',92.0886,169.5892,88.6437,169.8055,85.2095,169.9117],['L',85.2095,197.0704],['C',90.0232,196.7545,94.7204,195.9103,99.2543,194.5857],['C',97.6428,186.1757,96.3364,177.7326,95.5344,169.2581],['Z'],['M',66.8428,169.3565],['C',66.0355,177.848,64.722,186.3072,63.1044,194.7338],['C',67.7457,196.0484,72.555,196.8612,77.4841,197.1204],['L',77.4841,169.9539],['C',73.9114,169.8828,70.3593,169.6872,66.8428,169.3565],['Z'],['M',3.0427,54.7688],['L',4.6096,60.6163]]];
      var H = [[['M',12.5217,68.9308],['L',18.2879,56.5242],['L',10.4653,65.8903],['Z']],[['M',25.3339,32.4115],['L',22.5557,37.3724],['L',26.7891,32.6099],['Z']],[['M',129.5797,33.2052],['L',147.3729,40.0182],['L',130.5719,26.8552],['Z']],[['M',154.649,19.4469],['C',154.649,19.4469,151.9688,19.9335,150.3081,20.0753],['C',149.0686,20.1811,147.5166,20.6156,146.4401,21.3874],['C',145.7295,21.897,144.7601,23.3826,144.7601,23.3826],['C',144.7601,23.3826,145.8299,22.0063,146.5708,21.5217],['C',147.3961,20.982,148.2457,20.7427,149.2177,20.5942],['C',151.2457,20.2842,155.3435,20.0753,155.3435,20.0753],['Z']]];
      function fillPaths(list, color) {
        for (var i = 0; i < list.length; i++) {
          ctx.beginPath();
          var a = list[i];
          for (var j = 0; j < a.length; j++) {
            var s = a[j];
            if (s[0] === 'M') ctx.moveTo(s[1], s[2]);
            else if (s[0] === 'L') ctx.lineTo(s[1], s[2]);
            else if (s[0] === 'C') ctx.bezierCurveTo(s[1], s[2], s[3], s[4], s[5], s[6]);
            else if (s[0] === 'Z') ctx.closePath();
          }
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(r * S, r * S);
      ctx.translate(-CX, -CY);
      fillPaths(P, COLORS.parchment);
      fillPaths(H, COLORS.ink);
      ctx.restore();
    }
  }, 0.6),
  animal: _normalizeIcon({
    label: 'Animal',
    draw(ctx, cx, cy, r) {
      // Forme de patte : coussinet central + trois doigts arrondis
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.12;
      const toeR = r * 0.14;
      const toes = [
        [-0.32, -0.34],
        [0, -0.46],
        [0.32, -0.34]
      ];
      for (const [dx, dy] of toes) {
        ctx.beginPath();
        ctx.arc(cx + dx * r, cy + dy * r, toeR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy - r * 0.05);
      ctx.bezierCurveTo(cx - r * 0.5, cy + r * 0.5, cx + r * 0.5, cy + r * 0.5, cx + r * 0.5, cy - r * 0.05);
      ctx.bezierCurveTo(cx + r * 0.5, cy - r * 0.22, cx + r * 0.22, cy - r * 0.24, cx, cy - r * 0.24);
      ctx.bezierCurveTo(cx - r * 0.22, cy - r * 0.24, cx - r * 0.5, cy - r * 0.22, cx - r * 0.5, cy - r * 0.05);
      ctx.stroke();
    }
  }, 0.6),
  object: _normalizeIcon({
    label: 'Objet',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.35, cy - r * 0.35);
      ctx.lineTo(cx + r * 0.05, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.05, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.6),
  weapon: _normalizeIcon({
    label: 'Arme',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.15, cy - r * 0.65);
      ctx.lineTo(cx + r * 0.65, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.15, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.05, cy + r * 0.15);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.05, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.55, cy + r * 0.55);
      ctx.stroke();
    }
  }, 0.6),
  relic: _normalizeIcon({
    label: 'Relique',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.35);
      ctx.lineTo(cx - r * 0.4, cy - r * 0.35);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy - r * 0.3);
      ctx.bezierCurveTo(cx - r * 0.35, cy + r * 0.5, cx - r * 0.1, cy + r * 0.65, cx, cy + r * 0.65);
      ctx.bezierCurveTo(cx + r * 0.1, cy + r * 0.65, cx + r * 0.35, cy + r * 0.5, cx + r * 0.35, cy - r * 0.3);
      ctx.stroke();
    }
  }, 0.6),
  environment: _normalizeIcon({
    label: 'Environnement',
    draw(ctx, cx, cy, r) {
      // Forme de montagne : double pic asymétrique (pic droit nettement plus haut)
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy + r * 0.42);
      ctx.lineTo(cx - r * 0.15, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.02, cy - r * 0.02);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.55);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.42);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.6)
};

// Migration : anciennes clés françaises (fichiers de projet sauvegardés avant le passage en anglais) -> clés actuelles.
const CATEGORY_ICON_ALIASES = {
  pnj: 'npc',
  monstre: 'monster',
  animal: 'animal',
  objet: 'object',
  arme: 'weapon',
  relique: 'relic',
  environnement: 'environment'
};
