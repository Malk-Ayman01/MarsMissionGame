import Phaser from 'phaser';

// Helper to draw snapped pixel blocks (no anti-aliased paths or arcs)
function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Helper to draw a stepped pixel disc using integer grid cells
function pxDisc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  step: number,
  color: string,
  checker = false
) {
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y += step) {
    for (let x = -rx; x <= rx; x += step) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        if (checker && ((Math.round(x / step) + Math.round(y / step)) & 1) === 0) continue;
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), step, step);
      }
    }
  }
}

// Helper to draw a stepped pixel ring outline
function pxRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  step: number,
  color: string,
  dashed = false
) {
  ctx.fillStyle = color;
  for (let y = -rOuter; y <= rOuter; y += step) {
    for (let x = -rOuter; x <= rOuter; x += step) {
      const d2 = x * x + y * y;
      if (d2 <= rOuter * rOuter && d2 >= rInner * rInner) {
        if (dashed) {
          const angle = Math.atan2(y, x);
          if (Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 16) % 2 === 1) continue;
        }
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), step, step);
      }
    }
  }
}

// Helper to draw an ASCII pixel matrix scaled by pixelSize
function pxSprite(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  ps: number,
  rows: string[],
  palette: Record<string, string>
) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const col = palette[ch];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(ox + x * ps), Math.round(oy + y * ps), ps, ps);
      }
    }
  }
}

// Tiny crisp 3x5 pixel font for in-texture labels
const BITMAP_FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['#.#', '###', '###', '###', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  V: ['#.#', '#.#', '#.#', '.#.', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  ' ': ['...', '...', '...', '...', '...'],
};

function pxText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  topY: number,
  scale: number,
  color: string,
  shadowColor?: string
) {
  const totalW = text.length * 4 * scale - scale;
  const startX = Math.round(centerX - totalW / 2);
  for (let i = 0; i < text.length; i++) {
    const glyph = BITMAP_FONT[text[i].toUpperCase()] || BITMAP_FONT[' '];
    const gx = startX + i * 4 * scale;
    for (let ry = 0; ry < 5; ry++) {
      for (let rx = 0; rx < 3; rx++) {
        if (glyph[ry][rx] === '#') {
          if (shadowColor) {
            ctx.fillStyle = shadowColor;
            ctx.fillRect(gx + rx * scale + scale, topY + ry * scale + scale, scale, scale);
          }
          ctx.fillStyle = color;
          ctx.fillRect(gx + rx * scale, topY + ry * scale, scale, scale);
        }
      }
    }
  }
}

export function generateMarsTextures(scene: Phaser.Scene) {
  // 1. Martian ground tile (128x128 on a 4px pixel grid)
  if (!scene.textures.exists('martian_ground')) {
    const canvas = scene.textures.createCanvas('martian_ground', 128, 128);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      px(ctx, 0, 0, 128, 128, '#9e3e22');

      // Subtle 16px regolith checker tiles & pebbles on 4px grid
      for (let y = 0; y < 128; y += 4) {
        for (let x = 0; x < 128; x += 4) {
          const hash = ((x * 73 + y * 151) ^ (x * y)) & 31;
          if (hash < 4) px(ctx, x, y, 4, 4, '#b84c2c');
          else if (hash === 5 || hash === 6) px(ctx, x, y, 4, 4, '#7d2e17');
          else if (hash === 10) px(ctx, x, y, 8, 4, '#cc5c38');
        }
      }

      // Stepped pixel crater rings
      pxRing(ctx, 36, 40, 16, 12, 4, '#6d2612');
      pxRing(ctx, 34, 38, 12, 8, 4, '#c75936');
      pxRing(ctx, 96, 88, 12, 8, 4, '#6d2612');
      px(ctx, 92, 84, 8, 8, '#87331a');

      canvas.refresh();
    }
  }

  // 2. Rough dunes (128x128 stepped pixel ridges)
  if (!scene.textures.exists('rough_dunes')) {
    const canvas = scene.textures.createCanvas('rough_dunes', 128, 128);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      px(ctx, 0, 0, 128, 128, '#7a2b15');

      for (let baseY = 12; baseY < 128; baseY += 24) {
        for (let x = 0; x < 128; x += 4) {
          const wave = Math.round(Math.sin((x / 128) * Math.PI * 2) * 1.5) * 4;
          px(ctx, x, baseY + wave, 4, 4, '#c95c38');
          px(ctx, x, baseY + wave + 4, 4, 4, '#501809');
        }
      }
      canvas.refresh();
    }
  }

  // 3. Astronaut pixel sprite (48x48 on 3px pixel grid -> 16x16 sprite)
  if (!scene.textures.exists('astronaut')) {
    const canvas = scene.textures.createCanvas('astronaut', 48, 48);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;

      // Ground shadow
      pxDisc(ctx, 24, 30, 15, 9, 3, 'rgba(20, 6, 4, 0.55)', true);

      const palette: Record<string, string> = {
        K: '#090608', // dark pixel outline
        R: '#dc2626', // life-support pack stripe
        G: '#64748b', // backpack metal
        W: '#f8fafc', // white spacesuit
        S: '#cbd5e1', // suit shading
        O: '#f97316', // NASA orange accents
        Y: '#fbbf24', // gold visor
        H: '#fef08a', // visor highlight
      };

      const sprite = [
        '....KKKKKKKK....',
        '...KGGGGGGGGK...',
        '...KGRGGGGGGK...',
        '..KKGGGGGGGGKK..',
        '.KSSSSSSSSSSSSK.',
        '.KOWWWWWWWWWWOK.',
        'KOWWWKKKKKKWWWOK',
        'KOWWKWWWWWWKWWOK',
        '.KKKWYYYYYYWKKK.',
        '...KWHYYYYYYK...',
        '...KWYYYYYYWK...',
        '....KKWWWWKK....',
        '.....KSSSSK.....',
        '....KK....KK....',
        '....K......K....',
        '................',
      ];
      pxSprite(ctx, 0, 0, 3, sprite, palette);
      canvas.refresh();
    }
  }

  // 4. Mars Rover pixel sprite (72x100 on 3px grid -> 24x33 sprite)
  if (!scene.textures.exists('rover')) {
    const canvas = scene.textures.createCanvas('rover', 72, 100);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;

      // Dithered shadow beneath rover
      pxDisc(ctx, 36, 52, 30, 40, 3, 'rgba(18, 6, 4, 0.5)', true);

      const palette: Record<string, string> = {
        K: '#0b090c', // pixel outline
        T: '#1e293b', // wheel rubber
        R: '#94a3b8', // wheel tread
        A: '#475569', // suspension arm / chassis trim
        W: '#e2e8f0', // white hull
        S: '#cbd5e1', // hull shadow
        B: '#1d4ed8', // solar panel dark
        C: '#38bdf8', // solar grid / sensor lens
        G: '#f59e0b', // gold RTG foil
        D: '#b45309', // gold shade
        Y: '#fef08a', // headlights
        E: '#ef4444', // rear brake / beacon
      };

      const rows = [
        '........................',
        '......KK........KK......',
        '.KKKK.KYK......KYK.KKKK.',
        '.KTTRK.KK..KK..KK.KTTRK.',
        '.KRTK..KWWKCCKWWK..KRTK.',
        '.KTTKKKWWWWKKWWWWKKKTTK.',
        '.KRTKAAWSBBBBBBBSAAKRTK.',
        '.KTTRK.WSBCBBBCBS.KTTRK.',
        '.KKKK..WSBBBBBBBS..KKKK.',
        '.......WSBCBBBCBS.......',
        '..KKK..WSBBBBBBBS..KKK..',
        '.......WSGGGGGGGS.......',
        '.KKKK..WGGDDDDGGW..KKKK.',
        '.KTTRKAAWGDDDDGGWAAKTRK.',
        '.KRTKAAAWGDDDDGGWAAKRTK.',
        '.KTTRKAAWGGGGGGGWAAKTRK.',
        '.KKKK..WSSSSSSSSW..KKKK.',
        '.......WSSWWWWSSW.......',
        '.......WSWKEEKWSW.......',
        '.......WSWKAAKWSW.......',
        '.KKKK..WSWKKKKWSW..KKKK.',
        '.KTTRKAAWSSSSSSSWAAKTRK.',
        '.KRTK..KWWWWWWWWK..KRTK.',
        '.KTTRK..KKKKKKKK..KTTRK.',
        '.KKKK..............KKKK.',
      ];
      pxSprite(ctx, 0, 12, 3, rows, palette);
      canvas.refresh();
    }
  }

  // 5. Pixel-art Mars boulders (rock_1, rock_2, rock_3)
  const rockDefs = [
    { key: 'rock_1', w: 60, h: 50, rx: 22, ry: 17, seed: 3 },
    { key: 'rock_2', w: 75, h: 65, rx: 30, ry: 24, seed: 7 },
    { key: 'rock_3', w: 45, h: 40, rx: 16, ry: 13, seed: 11 },
  ];

  rockDefs.forEach((r) => {
    if (!scene.textures.exists(r.key)) {
      const canvas = scene.textures.createCanvas(r.key, r.w, r.h);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;
        const cx = Math.floor(r.w / 2);
        const cy = Math.floor(r.h / 2);

        // Stepped shadow
        pxDisc(ctx, cx + 2, cy + 4, r.rx + 2, r.ry + 1, 3, 'rgba(18, 6, 4, 0.6)', true);
        // Dark pixel outline
        pxDisc(ctx, cx, cy, r.rx, r.ry, 3, '#18181b');
        // Mid basalt body
        pxDisc(ctx, cx, cy, r.rx - 3, r.ry - 3, 3, '#52525b');
        // Upper-left rusty highlight
        pxDisc(ctx, cx - 3, cy - 3, Math.max(4, r.rx - 7), Math.max(4, r.ry - 7), 3, '#a85134');
        // Top highlight pixels
        px(ctx, cx - 6, cy - Math.floor(r.ry / 2), 9, 3, '#d97757');
        px(ctx, cx + r.seed, cy + 3, 6, 3, '#27272a');

        canvas.refresh();
      }
    }
  });

  // 6. Habitat safe base (180x180 pixel dome + airlock)
  if (!scene.textures.exists('habitat_base')) {
    const canvas = scene.textures.createCanvas('habitat_base', 180, 180);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 90;
      const cy = 90;

      // Dithered ground shadow
      pxDisc(ctx, cx + 4, cy + 6, 80, 80, 4, 'rgba(18, 6, 4, 0.45)', true);
      // Dark outline ring
      pxDisc(ctx, cx, cy, 68, 68, 4, '#0f172a');
      // Dome base white
      pxDisc(ctx, cx, cy, 64, 64, 4, '#e2e8f0');
      // Shaded lower rim
      pxRing(ctx, cx, cy, 60, 52, 4, '#94a3b8');
      // Structural ribs (cross & stepped rings)
      pxRing(ctx, cx, cy, 44, 40, 4, '#cbd5e1');
      pxRing(ctx, cx, cy, 24, 20, 4, '#cbd5e1');
      px(ctx, cx - 60, cy - 2, 120, 4, '#94a3b8');
      px(ctx, cx - 2, cy - 60, 4, 120, '#94a3b8');
      // Center skylight cupola
      pxDisc(ctx, cx, cy, 16, 16, 4, '#0369a1');
      pxDisc(ctx, cx - 2, cy - 2, 8, 8, 4, '#38bdf8');
      // Airlock corridor
      px(ctx, cx - 20, cy + 44, 40, 36, '#0f172a');
      px(ctx, cx - 16, cy + 48, 32, 28, '#475569');
      px(ctx, cx - 12, cy + 68, 24, 6, '#22c55e');

      // Pixel bitmap text "SAFE BASE"
      pxText(ctx, 'SAFE BASE', cx, cy - 48, 2, '#ef4444', '#0f172a');

      canvas.refresh();
    }
  }

  // 7. Supply crate (44x44 pixel chest)
  if (!scene.textures.exists('supply_crate')) {
    const canvas = scene.textures.createCanvas('supply_crate', 44, 44);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;

      px(ctx, 4, 6, 36, 36, 'rgba(18, 6, 4, 0.5)');
      px(ctx, 3, 3, 38, 36, '#090608');
      px(ctx, 5, 5, 34, 32, '#ea580c');
      px(ctx, 5, 5, 34, 4, '#fdba74');
      px(ctx, 5, 33, 34, 4, '#9a3412');
      // Corner steel brackets
      px(ctx, 5, 5, 8, 8, '#1e293b');
      px(ctx, 31, 5, 8, 8, '#1e293b');
      px(ctx, 5, 29, 8, 8, '#1e293b');
      px(ctx, 31, 29, 8, 8, '#1e293b');
      // Glowing cyan coupler core
      px(ctx, 16, 14, 12, 12, '#ffffff');
      px(ctx, 18, 16, 8, 8, '#06b6d4');
      px(ctx, 20, 18, 4, 4, '#cffafe');

      pxText(ctx, 'SPARE', 22, 31, 1, '#ffffff', '#090608');
      canvas.refresh();
    }
  }

  // 8. Relay tower (90x90 pixel comm dish)
  if (!scene.textures.exists('relay_tower')) {
    const canvas = scene.textures.createCanvas('relay_tower', 90, 90);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 45;
      const cy = 45;

      pxDisc(ctx, cx + 6, cy + 10, 34, 22, 3, 'rgba(18, 6, 4, 0.5)', true);
      // Octagonal steel base
      pxDisc(ctx, cx, cy, 36, 36, 3, '#0f172a');
      pxDisc(ctx, cx, cy, 32, 32, 3, '#334155');
      pxRing(ctx, cx, cy, 32, 28, 3, '#64748b');

      // Truss struts
      px(ctx, cx - 24, cy + 15, 12, 6, '#94a3b8');
      px(ctx, cx + 12, cy + 15, 12, 6, '#94a3b8');
      px(ctx, cx - 3, cy - 26, 6, 26, '#94a3b8');

      // Dish saucer
      pxDisc(ctx, cx, cy - 4, 24, 16, 3, '#0284c7');
      pxDisc(ctx, cx, cy - 4, 20, 12, 3, '#f8fafc');
      px(ctx, cx + 2, cy - 8, 8, 8, '#38bdf8');
      // Warning LED
      px(ctx, cx - 22, cy + 18, 6, 6, '#ef4444');

      canvas.refresh();
    }
  }

  // 9. Dust particle (8x8 sharp pixel square)
  if (!scene.textures.exists('dust_particle')) {
    const canvas = scene.textures.createCanvas('dust_particle', 8, 8);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      px(ctx, 2, 2, 4, 4, '#ea580c');
      px(ctx, 3, 3, 2, 2, '#fdba74');
      canvas.refresh();
    }
  }

  // 10. Dithered pixel headlight cone (160x240)
  if (!scene.textures.exists('headlight_cone')) {
    const canvas = scene.textures.createCanvas('headlight_cone', 160, 240);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const step = 4;
      for (let y = 12; y < 236; y += step) {
        const progress = (y - 12) / 224;
        const halfW = Math.round(10 + progress * 64);
        for (let x = 80 - halfW; x <= 80 + halfW; x += step) {
          const check = ((x / step) + (y / step)) & 1;
          const check4 = (((x / step) & 3) === 0 && ((y / step) & 1) === 0);
          if (progress < 0.35) {
            ctx.fillStyle = check ? 'rgba(254, 240, 138, 0.36)' : 'rgba(254, 240, 138, 0.16)';
            ctx.fillRect(x, y, step, step);
          } else if (progress < 0.7 && check) {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
            ctx.fillRect(x, y, step, step);
          } else if (check4) {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      canvas.refresh();
    }
  }

  // 11. Subsurface lava tube rock tile (128x128)
  if (!scene.textures.exists('subsurface_rock')) {
    const canvas = scene.textures.createCanvas('subsurface_rock', 128, 128);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      px(ctx, 0, 0, 128, 128, '#171412');

      for (let y = 0; y < 128; y += 4) {
        for (let x = 0; x < 128; x += 4) {
          const hash = ((x * 59 + y * 97) ^ (x + y * 13)) & 31;
          if (hash < 3) px(ctx, x, y, 4, 4, '#292524');
          else if (hash === 8) px(ctx, x, y, 4, 4, '#065f46'); // glowing mineral specks
          else if (hash === 14) px(ctx, x, y, 8, 4, '#3f3a36');
        }
      }

      for (let y = 16; y < 128; y += 32) {
        px(ctx, 0, y, 48, 4, '#292524');
        px(ctx, 48, y + 4, 40, 4, '#292524');
        px(ctx, 88, y, 40, 4, '#292524');
      }

      canvas.refresh();
    }
  }

  // 12. Lava cave skylight portal (160x160)
  if (!scene.textures.exists('lava_skylight')) {
    const canvas = scene.textures.createCanvas('lava_skylight', 160, 160);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 80;
      const cy = 80;

      pxDisc(ctx, cx, cy, 76, 56, 4, '#f59e0b');
      pxDisc(ctx, cx, cy, 70, 50, 4, '#78350f');
      pxDisc(ctx, cx, cy, 60, 42, 4, '#09090b');
      pxDisc(ctx, cx, cy + 4, 24, 16, 4, 'rgba(6, 182, 212, 0.3)', true);
      pxText(ctx, 'CAVE HOLE', cx, cy - 34, 2, '#f59e0b', '#09090b');
      canvas.refresh();
    }
  }

  // 13. Seismic beacon (40x40 pixel tripod)
  if (!scene.textures.exists('seismic_beacon')) {
    const canvas = scene.textures.createCanvas('seismic_beacon', 40, 40);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 20;
      const cy = 20;

      px(ctx, cx - 2, 2, 4, 10, '#38bdf8');
      px(ctx, cx - 3, 1, 6, 4, '#bae6fd');
      px(ctx, cx - 8, cy - 10, 16, 14, '#090608');
      px(ctx, cx - 6, cy - 8, 12, 10, '#f59e0b');
      px(ctx, cx - 2, cy + 4, 4, 12, '#94a3b8');
      px(ctx, cx - 10, cy + 10, 4, 6, '#94a3b8');
      px(ctx, cx + 6, cy + 10, 4, 6, '#94a3b8');
      canvas.refresh();
    }
  }

  // 14. Anomaly relic (64x64 pixel glowing core)
  if (!scene.textures.exists('anomaly_relic')) {
    const canvas = scene.textures.createCanvas('anomaly_relic', 64, 64);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 32;
      const cy = 32;

      pxDisc(ctx, cx, cy, 28, 28, 4, 'rgba(6, 182, 212, 0.28)', true);
      pxDisc(ctx, cx, cy, 22, 22, 2, '#06b6d4');
      pxDisc(ctx, cx, cy, 18, 18, 2, '#1e293b');
      px(ctx, cx - 10, cy - 14, 20, 6, '#d97706');
      px(ctx, cx - 10, cy + 8, 20, 6, '#d97706');
      pxDisc(ctx, cx, cy, 10, 10, 2, '#22d3ee');
      px(ctx, cx - 4, cy - 4, 8, 8, '#ffffff');
      px(ctx, cx - 2, cy - 28, 4, 10, '#e2e8f0');

      canvas.refresh();
    }
  }

  // 15. Stalactite cave rock (48x52)
  if (!scene.textures.exists('stalactite_rock')) {
    const canvas = scene.textures.createCanvas('stalactite_rock', 48, 52);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      pxDisc(ctx, 24, 26, 20, 22, 3, '#09090b');
      pxDisc(ctx, 24, 26, 16, 18, 3, '#27272a');
      pxDisc(ctx, 22, 22, 10, 12, 3, '#52525b');
      px(ctx, 21, 12, 6, 15, '#71717a');
      canvas.refresh();
    }
  }

  // 16. MAV Rocket sprite (80x140 pixel rocket)
  if (!scene.textures.exists('mav_rocket')) {
    const canvas = scene.textures.createCanvas('mav_rocket', 80, 140);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 40;
      const cy = 70;

      // Shadow
      pxDisc(ctx, cx, cy + 50, 28, 12, 4, 'rgba(18, 6, 4, 0.5)', true);

      // Fins
      px(ctx, cx - 28, cy + 24, 12, 20, '#090608');
      px(ctx, cx - 24, cy + 28, 8, 12, '#334155');
      px(ctx, cx + 16, cy + 24, 12, 20, '#090608');
      px(ctx, cx + 16, cy + 28, 8, 12, '#334155');

      // Engine bell
      px(ctx, cx - 16, cy + 40, 32, 16, '#090608');
      px(ctx, cx - 12, cy + 40, 24, 12, '#334155');

      // Stage 1 body
      px(ctx, cx - 20, cy - 12, 40, 56, '#090608');
      px(ctx, cx - 16, cy - 8, 32, 48, '#f8fafc');
      px(ctx, cx - 16, cy - 8, 8, 48, '#cbd5e1');
      // Orange booster stripe
      px(ctx, cx - 16, cy + 12, 32, 12, '#d97706');

      // Interstage collar
      px(ctx, cx - 18, cy - 20, 36, 10, '#0f172a');

      // Stage 2 capsule
      px(ctx, cx - 16, cy - 44, 32, 26, '#090608');
      px(ctx, cx - 12, cy - 42, 24, 22, '#e2e8f0');
      px(ctx, cx - 4, cy - 34, 8, 8, '#ef4444');

      // Stepped nose cone
      px(ctx, cx - 12, cy - 50, 24, 8, '#cbd5e1');
      px(ctx, cx - 8, cy - 58, 16, 8, '#cbd5e1');
      px(ctx, cx - 4, cy - 64, 8, 6, '#e2e8f0');
      px(ctx, cx - 2, cy - 72, 4, 8, '#38bdf8');

      canvas.refresh();
    }
  }

  // 17. MAV Launchpad (180x180)
  if (!scene.textures.exists('mav_launchpad')) {
    const canvas = scene.textures.createCanvas('mav_launchpad', 180, 180);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 90;
      const cy = 90;

      px(ctx, 10, 10, 160, 160, '#f59e0b');
      px(ctx, 14, 14, 152, 152, '#18181b');
      pxDisc(ctx, cx, cy, 42, 42, 4, '#09090b');

      for (let i = -32; i <= 32; i += 12) {
        px(ctx, cx + i, cy - 28, 4, 56, '#3f3f46');
      }

      // Red gantry tower
      px(ctx, cx + 40, cy - 60, 16, 112, '#ffffff');
      px(ctx, cx + 42, cy - 58, 12, 108, '#ef4444');
      px(ctx, cx, cy - 36, 44, 8, '#94a3b8');

      // Pad floodlights
      px(ctx, cx - 58, cy - 58, 8, 8, '#fef08a');
      px(ctx, cx + 50, cy - 58, 8, 8, '#fef08a');

      pxText(ctx, 'MARS ROCKET PAD', cx, cy + 62, 2, '#fbbf24', '#09090b');
      canvas.refresh();
    }
  }

  // 18. Dust devil (80x80 stepped pixel spiral)
  if (!scene.textures.exists('dust_devil')) {
    const canvas = scene.textures.createCanvas('dust_devil', 80, 80);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 40;
      const cy = 40;

      pxRing(ctx, cx, cy, 36, 32, 4, 'rgba(234, 88, 12, 0.5)', true);
      pxRing(ctx, cx, cy, 24, 20, 4, 'rgba(249, 115, 22, 0.7)', true);
      pxRing(ctx, cx, cy, 14, 10, 4, 'rgba(251, 146, 60, 0.85)', true);
      pxDisc(ctx, cx, cy, 8, 8, 4, '#fed7aa');

      canvas.refresh();
    }
  }

  // 19. Earth Return Orbiter (160x100 pixel spacecraft)
  if (!scene.textures.exists('earth_return_orbiter')) {
    const canvas = scene.textures.createCanvas('earth_return_orbiter', 160, 100);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const cx = 80;
      const cy = 50;

      // Solar arrays
      px(ctx, cx - 74, cy - 16, 48, 32, '#38bdf8');
      px(ctx, cx - 72, cy - 14, 44, 28, '#1e3a8a');
      for (let x = cx - 64; x < cx - 28; x += 10) {
        px(ctx, x, cy - 14, 2, 28, '#38bdf8');
      }

      px(ctx, cx + 26, cy - 16, 48, 32, '#38bdf8');
      px(ctx, cx + 28, cy - 14, 44, 28, '#1e3a8a');
      for (let x = cx + 36; x < cx + 72; x += 10) {
        px(ctx, x, cy - 14, 2, 28, '#38bdf8');
      }

      // Main chassis
      px(ctx, cx - 26, cy - 18, 52, 36, '#0f172a');
      px(ctx, cx - 24, cy - 16, 48, 32, '#e2e8f0');
      px(ctx, cx - 18, cy - 10, 36, 20, '#f59e0b');

      // Docking collar + green crosshair
      pxRing(ctx, cx, cy, 14, 10, 2, '#06b6d4');
      px(ctx, cx - 10, cy - 1, 20, 2, '#22c55e');
      px(ctx, cx - 1, cy - 10, 2, 20, '#22c55e');

      // High-gain antenna dish
      px(ctx, cx - 12, cy - 28, 24, 10, '#cbd5e1');
      px(ctx, cx - 8, cy - 32, 16, 4, '#ffffff');

      canvas.refresh();
    }
  }

  // 20. Rocket flame particle (24x24 pixel fire cluster)
  if (!scene.textures.exists('rocket_flame')) {
    const canvas = scene.textures.createCanvas('rocket_flame', 24, 24);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      pxDisc(ctx, 12, 12, 10, 10, 2, '#ea580c', true);
      pxDisc(ctx, 12, 12, 8, 8, 2, '#f97316');
      pxDisc(ctx, 12, 12, 5, 5, 2, '#fde047');
      px(ctx, 10, 10, 4, 4, '#ffffff');
      canvas.refresh();
    }
  }

  // 21. Safe zone pixel ring (280x280 stepped 4px green ring + dithered fill)
  if (!scene.textures.exists('pixel_safe_ring')) {
    const canvas = scene.textures.createCanvas('pixel_safe_ring', 284, 284);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      pxDisc(ctx, 142, 142, 136, 136, 4, 'rgba(34, 197, 94, 0.14)', true);
      pxRing(ctx, 142, 142, 140, 134, 4, '#22c55e', true);
      canvas.refresh();
    }
  }

  // 22. Interactive pixel pad rings (sky, cyan, amber)
  const padSpecs = [
    { key: 'pixel_pad_sky', size: 76, r: 34, fill: 'rgba(56, 189, 248, 0.24)', ring: '#38bdf8' },
    { key: 'pixel_pad_cyan', size: 100, r: 46, fill: 'rgba(6, 182, 212, 0.26)', ring: '#06b6d4' },
    { key: 'pixel_pad_amber', size: 96, r: 44, fill: 'rgba(245, 158, 11, 0.22)', ring: '#f59e0b' },
    { key: 'pixel_glow_cyan', size: 88, r: 40, fill: 'rgba(6, 182, 212, 0.34)', ring: '#22d3ee' },
    { key: 'pixel_dock_ring_ok', size: 96, r: 42, fill: 'rgba(34, 197, 94, 0.25)', ring: '#22c55e' },
  ];
  padSpecs.forEach((p) => {
    if (!scene.textures.exists(p.key)) {
      const canvas = scene.textures.createCanvas(p.key, p.size, p.size);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;
        const c = Math.floor(p.size / 2);
        pxDisc(ctx, c, c, p.r, p.r, 4, p.fill, true);
        pxRing(ctx, c, c, p.r, p.r - 4, 4, p.ring);
        canvas.refresh();
      }
    }
  });

  // 23. Docking crosshair pixel sprite (24x24)
  if (!scene.textures.exists('pixel_dock_crosshair')) {
    const canvas = scene.textures.createCanvas('pixel_dock_crosshair', 24, 24);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      pxRing(ctx, 12, 12, 10, 8, 2, '#22c55e');
      px(ctx, 10, 2, 4, 6, '#4ade80');
      px(ctx, 10, 16, 4, 6, '#4ade80');
      px(ctx, 2, 10, 6, 4, '#4ade80');
      px(ctx, 16, 10, 6, 4, '#4ade80');
      px(ctx, 10, 10, 4, 4, '#ffffff');
      canvas.refresh();
    }
  }

  // 24. Pixel Mars orbital horizon limb (1600x360 curved stepped pixel horizon)
  if (!scene.textures.exists('pixel_mars_limb')) {
    const canvas = scene.textures.createCanvas('pixel_mars_limb', 1600, 360);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      const step = 8;
      for (let x = 0; x < 1600; x += step) {
        const dx = (x - 800) / 800;
        const curveY = Math.round((dx * dx * 180) / step) * step;
        const topY = 48 + curveY;
        // Orange atmospheric glow band
        px(ctx, x, topY - 16, step, 8, 'rgba(249, 115, 22, 0.35)');
        px(ctx, x, topY - 8, step, 8, '#f97316');
        // Planet surface below curve
        px(ctx, x, topY, step, 360 - topY, '#b44a2c');
        if (((x / step) & 3) === 0) {
          px(ctx, x, topY + 24, step, 16, '#8e351b');
        }
      }
      canvas.refresh();
    }
  }

  // 25. Collectible Solar Power Cell (32x32 glowing energy canister)
  if (!scene.textures.exists('pickup_cell')) {
    const canvas = scene.textures.createCanvas('pickup_cell', 32, 32);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      pxDisc(ctx, 16, 16, 13, 13, 2, 'rgba(250, 204, 21, 0.24)', true);
      px(ctx, 9, 5, 14, 22, '#090608');
      px(ctx, 11, 7, 10, 18, '#f59e0b');
      px(ctx, 11, 7, 10, 4, '#fef08a');
      px(ctx, 13, 11, 6, 10, '#38bdf8');
      px(ctx, 14, 13, 4, 6, '#e0f2fe');
      px(ctx, 12, 3, 8, 3, '#cbd5e1');
      canvas.refresh();
    }
  }

  // 26. Collectible Ice / Mineral Crystal (32x32 glowing cave sample)
  if (!scene.textures.exists('pickup_crystal')) {
    const canvas = scene.textures.createCanvas('pickup_crystal', 32, 32);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.imageSmoothingEnabled = false;
      pxDisc(ctx, 16, 16, 13, 13, 2, 'rgba(34, 211, 238, 0.25)', true);
      px(ctx, 13, 4, 6, 4, '#090608');
      px(ctx, 10, 8, 12, 16, '#090608');
      px(ctx, 12, 10, 8, 12, '#06b6d4');
      px(ctx, 14, 6, 4, 14, '#67e8f9');
      px(ctx, 15, 11, 2, 6, '#ffffff');
      px(ctx, 7, 15, 4, 8, '#0284c7');
      px(ctx, 21, 14, 4, 9, '#0284c7');
      canvas.refresh();
    }
  }
}
