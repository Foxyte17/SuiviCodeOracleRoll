// ---------- NOYAU UTILITAIRES & CONSTANTES SVG ----------

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function bmColLetter(i) {
  return String.fromCharCode(65 + i);
}

function bmDistToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

const DIE_SHAPES = {
  4: `<polygon points="12,3 21,20 3,20"/>`,
  6: `<rect x="4" y="4" width="16" height="16" rx="2.5"/>
      <circle cx="8.3" cy="8.3" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="8.3" cy="12" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="8.3" cy="15.7" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="15.7" cy="8.3" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="15.7" cy="12" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="15.7" cy="15.7" r="1.15" fill="currentColor" stroke="none"/>`,
  8: `<polygon points="12,2 21,12 12,22 3,12"/><line x1="3" y1="12" x2="21" y2="12"/>`,
  10: `<polygon points="12,2 20,9 12,13 4,9"/>
       <polygon points="4,9 12,13 12,22 7.5,15.5"/>
       <polygon points="20,9 12,13 12,22 16.5,15.5"/>`,
  12: `<polygon points="12,2 21,9 17,20 7,20 3,9"/>`,
  20: `<polygon points="12,2 20,7 20,17 12,22 4,17 4,7"/>
       <line x1="12" y1="2" x2="12" y2="22"/>
       <line x1="4" y1="7" x2="20" y2="17"/>
       <line x1="20" y1="7" x2="4" y2="17"/>`,
  100: `<polygon points="12,2 20,9 12,13 4,9"/>
        <polygon points="4,9 12,13 12,22 7.5,15.5"/>
        <polygon points="20,9 12,13 12,22 16.5,15.5"/>`,
  custom: `<circle cx="12" cy="12" r="3"/>
           <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/>`
};

const ICON_LIBRARY = {
  skull: `<path d="M12 3c-4 0-7 3-7 7 0 3 1.4 5.2 3 6.2v2.8h1.5v-1.8h1v1.8h1v-1.8h1v1.8h1.5v-2.8c1.6-1 3-3.2 3-6.2 0-4-3-7-7-7z"/>
          <circle cx="9.3" cy="10" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="14.7" cy="10" r="1.2" fill="currentColor" stroke="none"/>
          <path d="M11.3 12.8h1.4l-0.7 1.4z"/>`,
  ghost: `<path d="M6 21v-9.5a6 6 0 0 1 12 0V21l-2-1.8-2 1.8-2-1.8-2 1.8-2-1.8z"/>
          <circle cx="9.3" cy="11" r="1" fill="currentColor" stroke="none"/>
          <circle cx="14.7" cy="11" r="1" fill="currentColor" stroke="none"/>`,
  car: `<path d="M4.5 15.5l1.3-4.3A2 2 0 0 1 7.7 9.8h8.6a2 2 0 0 1 1.9 1.4l1.3 4.3"/>
        <rect x="3" y="15.5" width="18" height="3" rx="1"/>
        <circle cx="7.5" cy="18.7" r="1.3"/><circle cx="16.5" cy="18.7" r="1.3"/>`,
  sword: `<path d="M12 2l1.3 3.2v8.3h-2.6V5.2z"/>
          <rect x="10.3" y="13.5" width="3.4" height="6.5" rx="1.2"/>`,
  shield: `<path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z"/>`,
  tree: `<path d="M12 2.5l3.8 5.8h-2.2l3.2 4.8h-2.2l2.8 4.4H6.6l2.8-4.4H7.2l3.2-4.8H8.2z"/>
         <line x1="12" y1="17.5" x2="12" y2="21.5"/>`,
  flame: `<path d="M12 2.3c2.6 3 4.8 6.2 4.8 9.7a4.8 4.8 0 0 1-9.6 0c0-1.8.7-3.2 1.6-4.5-.1 1.4.7 2.4 1.7 2.4a1.6 1.6 0 0 0 1.5-2.2c-.9-1.7-.9-3.4 0-5.4z"/>`,
  lightning: `<polygon points="13,2 5,14 11,14 9,22 19,9 13,9"/>`,
  book: `<path d="M4 4.5c2-1 5-1 8 1v13.5c-3-2-6-2-8-1z"/>
         <path d="M20 4.5c-2-1-5-1-8 1v13.5c3-2 6-2 8-1z"/>`,
  eye: `<path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>`,
  web: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.3"/>
        <line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/><line x1="18.5" y1="5.5" x2="5.5" y2="18.5"/>`,
  radioactive: `<circle cx="12" cy="12" r="9.5"/>
                <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
                <path d="M12 12L12 4.8A7.2 7.2 0 0 1 18.2 8.4z"/>
                <path d="M12 12l6.2 3.6A7.2 7.2 0 0 1 5.8 15.6z"/>
                <path d="M12 12L5.8 8.4A7.2 7.2 0 0 1 12 4.8z"/>`,
  heart: `<path d="M12 20s-8-4.9-8-10.8A4.4 4.4 0 0 1 12 6.4a4.4 4.4 0 0 1 8 2.8C20 15.1 12 20 12 20z"/>`,
  mountain: `<path d="M3 18.5l5.5-9.5 3.5 5.5 2-3 6 7z"/><circle cx="17" cy="6.5" r="1.4" fill="currentColor" stroke="none"/>`,
  moon: `<path d="M15.5 3a9 9 0 1 0 5.5 14.8A7 7 0 0 1 15.5 3z"/>`,
  anchor: `<circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="19"/>
           <line x1="7" y1="9" x2="17" y2="9"/><path d="M5 13a7 7 0 0 0 14 0"/>`,
  rocket: `<path d="M12 2c3 2.6 4.2 6.6 4.2 10.4l-4.2 4-4.2-4C7.8 8.6 9 4.6 12 2z"/>
           <circle cx="12" cy="9.5" r="1.3" fill="currentColor" stroke="none"/>
           <path d="M8 15.5l-2.6 4.3M16 15.5l2.6 4.3"/>`,
  star: `<polygon points="12,2 14.4,9.2 22,9.6 15.9,14.1 18,21.5 12,17.1 6,21.5 8.1,14.1 2,9.6 9.6,9.2"/>`,
  coin: `<circle cx="12" cy="12" r="9"/>
         <circle cx="12" cy="12" r="6.7"/>
         <path d="M12 8.2l1.1 2.3 2.5.3-1.9 1.7.5 2.5-2.2-1.3-2.2 1.3.5-2.5-1.9-1.7 2.5-.3z"/>`,
  tower: `<path d="M6 21V12h2V9h2v2h2V7h2v4h2V9h2v3h2v9z"/>
          <rect x="10" y="15.5" width="4" height="5.5"/>
          <line x1="12" y1="7" x2="12" y2="3.5"/>
          <path d="M12 3.5l3 1.3-3 1.3z"/>`
};

const ICON_LABELS = {
  skull: "Crâne", ghost: "Fantôme", car: "Voiture", sword: "Épée", shield: "Bouclier",
  tree: "Arbre", flame: "Flamme", lightning: "Éclair", book: "Livre", eye: "Œil",
  web: "Toile", radioactive: "Radioactif", heart: "Cœur", mountain: "Montagne", moon: "Lune",
  anchor: "Ancre", rocket: "Fusée", star: "Étoile", coin: "Pièce", tower: "Tour"
};

const DEFAULT_UNIVERSE_ICON = `<circle cx="12" cy="12" r="9"/><path d="M8 9h8M8 12h8M8 15h5"/>`;

const CARD_EMBLEM_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" style="width:100%;height:100%;">
  <polygon points="12,2 20,7 20,17 12,22 4,17 4,7"/>
  <polygon points="12,9 14,12 12,15 10,12" fill="currentColor" stroke="none"/>
</svg>`;

const gearIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/>
</svg>`;

const cardIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" style="width:16px;height:16px;">
  <rect x="3.5" y="6.5" width="13" height="17" rx="2" transform="rotate(-8 3.5 6.5)"/>
  <rect x="7.5" y="4" width="13" height="17" rx="2"/>
</svg>`;
