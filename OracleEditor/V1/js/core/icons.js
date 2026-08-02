const TYPE_ICONS = {
  event: {
    label: 'Événement',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.62);
      ctx.lineTo(cx, cy + r * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.48, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  quest: {
    label: 'Quête',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.32, cy - r * 0.4);
      ctx.bezierCurveTo(cx - r * 0.32, cy - r * 0.78, cx + r * 0.45, cy - r * 0.78, cx + r * 0.45, cy - r * 0.36);
      ctx.bezierCurveTo(cx + r * 0.45, cy - r * 0.02, cx, cy - r * 0.08, cx, cy + r * 0.24);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.54, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  danger: {
    label: 'Danger',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.68);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.38);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.12);
      ctx.bezierCurveTo(cx + r * 0.55, cy + r * 0.55, cx + r * 0.28, cy + r * 0.72, cx, cy + r * 0.78);
      ctx.bezierCurveTo(cx - r * 0.28, cy + r * 0.72, cx - r * 0.55, cy + r * 0.55, cx - r * 0.55, cy + r * 0.12);
      ctx.lineTo(cx - r * 0.55, cy - r * 0.38);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.18);
      ctx.lineTo(cx, cy + r * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.4, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  unexpected: {
    label: 'Inattendu',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.22, cy - r * 0.68);
      ctx.lineTo(cx - r * 0.38, cy + r * 0.05);
      ctx.lineTo(cx, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.22, cy + r * 0.68);
      ctx.lineTo(cx + r * 0.38, cy - r * 0.1);
      ctx.lineTo(cx, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }
  }
};

const CATEGORY_ICONS = {
  pnj: {
    label: 'PNJ',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.35, r * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cy + r * 0.62);
      ctx.bezierCurveTo(cx - r * 0.45, cy + r * 0.12, cx - r * 0.24, cy + r * 0.18, cx, cy + r * 0.18);
      ctx.bezierCurveTo(cx + r * 0.24, cy + r * 0.18, cx + r * 0.45, cy + r * 0.12, cx + r * 0.45, cy + r * 0.62);
      ctx.stroke();
    }
  },
  monstre: {
    label: 'Monstre',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy - r * 0.55);
      ctx.lineTo(cx - r * 0.3, cy - r * 0.1);
      ctx.moveTo(cx + r * 0.5, cy - r * 0.55);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - r * 0.18, cy - r * 0.05, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.18, cy - r * 0.05, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.25, cy + r * 0.25);
      ctx.lineTo(cx - r * 0.08, cy + r * 0.15);
      ctx.lineTo(cx + r * 0.08, cy + r * 0.3);
      ctx.lineTo(cx + r * 0.25, cy + r * 0.15);
      ctx.stroke();
    }
  },
  animal: {
    label: 'Animal',
    draw(ctx, cx, cy, r) {
      const p = (x, y, rr) => { ctx.beginPath(); ctx.arc(cx + x, cy + y, rr, 0, Math.PI * 2); ctx.fill(); };
      p(-r * 0.28, -r * 0.05, r * 0.13);
      p(r * 0.28, -r * 0.05, r * 0.13);
      p(-r * 0.1, -r * 0.35, r * 0.11);
      p(r * 0.1, -r * 0.35, r * 0.11);
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.32, r * 0.32, r * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  objet: {
    label: 'Objet',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.32, cy + r * 0.55);
      ctx.lineTo(cx - r * 0.32, cy + r * 0.55);
      ctx.lineTo(cx - r * 0.55, cy - r * 0.15);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.15);
      ctx.moveTo(cx, cy - r * 0.6);
      ctx.lineTo(cx, cy + r * 0.55);
      ctx.stroke();
    }
  },
  arme: {
    label: 'Arme',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.1, cy - r * 0.68);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.68);
      ctx.lineTo(cx + r * 0.1, cy + r * 0.3);
      ctx.lineTo(cx - r * 0.1, cy + r * 0.3);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy + r * 0.15);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.3);
      ctx.lineTo(cx, cy + r * 0.62);
      ctx.stroke();
    }
  },
  relique: {
    label: 'Relique',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cy - r * 0.55);
      ctx.lineTo(cx + r * 0.45, cy - r * 0.55);
      ctx.bezierCurveTo(cx + r * 0.45, cy + r * 0.05, cx + r * 0.15, cy + r * 0.3, cx, cy + r * 0.32);
      ctx.bezierCurveTo(cx - r * 0.15, cy + r * 0.3, cx - r * 0.45, cy + r * 0.05, cx - r * 0.45, cy - r * 0.55);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.32);
      ctx.lineTo(cx, cy + r * 0.58);
      ctx.moveTo(cx - r * 0.22, cy + r * 0.65);
      ctx.lineTo(cx + r * 0.22, cy + r * 0.65);
      ctx.stroke();
    }
  },
  environnement: {
    label: 'Environnement',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.62, cy + r * 0.42);
      ctx.lineTo(cx - r * 0.22, cy - r * 0.35);
      ctx.lineTo(cx + r * 0.05, cy + r * 0.05);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.55);
      ctx.lineTo(cx + r * 0.62, cy + r * 0.42);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + r * 0.42, cy - r * 0.55, r * 0.13, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};
