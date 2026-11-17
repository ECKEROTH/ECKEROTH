// Version 3: flere detaljer på laptop, skyer og hængelås, samt skygger
// (kontaktskygge, kastet skygge på gulv, skyernes skygge på tastatur, låsens skygge på skærm).
const fs = require('fs');

// Deterministisk tilfældighed, så billedet er ens hver gang
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Bilineær interpolation over en firkant [bagV, bagH, forH, forV]
function quad(p, u, v) {
  const [a, b, c, d] = p;
  const t = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const s = [d[0] + (c[0] - d[0]) * u, d[1] + (c[1] - d[1]) * u];
  return [t[0] + (s[0] - t[0]) * v, t[1] + (s[1] - t[1]) * v];
}
const pts = (arr) => arr.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
const qpoly = (p, u0, v0, u1, v1) => [quad(p, u0, v0), quad(p, u1, v0), quad(p, u1, v1), quad(p, u0, v1)];

// ---------- Geometri ----------
const A = [230, 560], B = [640, 590], C = [1000, 690], D = [520, 680]; // base
const base = [A, B, C, D];
const TH = 14; // basens tykkelse
const lid = [[200, 140], [600, 230], B, A];
const disp = [[236, 180], [578, 258], [614, 560], [254, 534]];

// ---------- Tastatur med 3D-taster ----------
const well = qpoly(base, 0.045, 0.06, 0.955, 0.56); // fordybning til tastatur
let keys = '';
const rows = 6, cols = 14;
for (let r = 0; r < rows; r++) {
  for (let k = 0; k < cols; k++) {
    // Mellemrumstast i nederste række
    if (r === rows - 1 && k > 4 && k < 10) { if (k !== 5) continue; }
    const w = (r === rows - 1 && k === 5) ? 5 : 1;
    const gu = 0.86 / cols, gv = 0.46 / rows;
    const u0 = 0.07 + k * gu + 0.007, u1 = 0.07 + (k + w) * gu - 0.007;
    const v0 = 0.08 + r * gv + 0.014, v1 = 0.08 + (r + 1) * gv - 0.014;
    const q = qpoly(base, u0, v0, u1, v1);
    const low = q.map(p => [p[0], p[1] + 2.2]);           // tastens side
    keys += `<polygon points="${pts(low)}" fill="#9ea9b0"/>`;
    keys += `<polygon points="${pts(q)}" fill="url(#key)"/>`;
  }
}
const pad = qpoly(base, 0.37, 0.64, 0.63, 0.9);

// ---------- Skyer ----------
// En "puff" = cirkel med radial gradient. Lag: bagerste lag lidt mørkere/blåligt.
function puffs(list, grad) {
  return list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${grad})"/>`).join('');
}
// Bagerste sky inde i skærmen
const back = [];
for (let i = 0; i < 14; i++) back.push([300 + rnd() * 290, 470 + rnd() * 70, 34 + rnd() * 26]);
// Midterste lag, der vælter ud over hængslet
const mid = [];
for (let i = 0; i < 15; i++) {
  const t = rnd();
  mid.push([270 + t * 330 + rnd() * 30, 540 + t * 60 + rnd() * 30, 30 + rnd() * 26]);
}
// Forreste lag ned over tastaturet
const front = [];
for (let i = 0; i < 16; i++) {
  const t = rnd();
  front.push([300 + t * 300, 585 + t * 35 + rnd() * 20, 20 + rnd() * 22 * (1 - t * 0.5)]);
}
// Småskyer der følger låsens bane (røgspor)
const trail = [];
for (let i = 0; i < 9; i++) {
  const t = i / 8;
  trail.push([470 + t * 110 + (rnd() - 0.5) * 30, 470 - t * 120 + (rnd() - 0.5) * 20, 34 - t * 20]);
}
// Løse skyfnug
let flecks = '';
for (let i = 0; i < 22; i++) {
  let x = 330 + rnd() * 480, y = 300 + rnd() * 300; const r = 3 + rnd() * 7;
  if (x > 470 && x < 760 && y > 180 && y < 560) { continue; }
  flecks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#puff)" opacity="${(0.7 + rnd() * 0.3).toFixed(2)}"/>`;
}
// Skyens skygge på tastatur og gulv (sky forskudt nedad/højre og sløret)
const cloudShadow = [...mid, ...front].map(([x, y, r]) =>
  `<ellipse cx="${x + 22}" cy="${y + r * 0.55 + 10}" rx="${r * 1.05}" ry="${r * 0.45}"/>`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4f9db4"/><stop offset="0.8" stop-color="#7fc2d5"/><stop offset="1" stop-color="#8fcbdc"/>
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#88c8da"/><stop offset="1" stop-color="#b2e0eb"/>
  </linearGradient>
  <radialGradient id="vignette" cx="0.45" cy="0.5" r="0.75">
    <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#14465a" stop-opacity="0.28"/>
  </radialGradient>
  <linearGradient id="lid" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e4eaee"/><stop offset="0.6" stop-color="#c3cdd3"/><stop offset="1" stop-color="#97a4ad"/>
  </linearGradient>
  <linearGradient id="display" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2f6f88"/><stop offset="0.5" stop-color="#4f9bb6"/><stop offset="1" stop-color="#9fd5e6"/>
  </linearGradient>
  <linearGradient id="base" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#d7dfe4"/><stop offset="1" stop-color="#f6f8f9"/>
  </linearGradient>
  <linearGradient id="well" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#bcc7ce"/><stop offset="1" stop-color="#cfd8dd"/>
  </linearGradient>
  <linearGradient id="key" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f2f5f7"/><stop offset="1" stop-color="#dde3e7"/>
  </linearGradient>
  <linearGradient id="pad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e2e8ec"/><stop offset="1" stop-color="#f3f6f8"/>
  </linearGradient>
  <linearGradient id="lockBody" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffb57a"/><stop offset="0.45" stop-color="#f7832f"/><stop offset="1" stop-color="#d45614"/>
  </linearGradient>
  <linearGradient id="lockSide" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#b54810"/><stop offset="1" stop-color="#8f370b"/>
  </linearGradient>
  <linearGradient id="shackle" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.4" stop-color="#e8edf0"/><stop offset="1" stop-color="#94a2ab"/>
  </linearGradient>
  <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fffbe0"/><stop offset="0.3" stop-color="#ffd25a"/><stop offset="0.7" stop-color="#ff8a24"/><stop offset="1" stop-color="#ff6a10" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="flameGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffcf6b" stop-opacity="0.75"/><stop offset="1" stop-color="#ffcf6b" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="puff" cx="0.36" cy="0.3" r="0.78">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#f4f7f9"/><stop offset="0.85" stop-color="#d7e1e7"/><stop offset="1" stop-color="#b8c8d1"/>
  </radialGradient>
  <radialGradient id="puffBack" cx="0.36" cy="0.3" r="0.78">
    <stop offset="0" stop-color="#f4f8fa"/><stop offset="0.6" stop-color="#dbe5ea"/><stop offset="1" stop-color="#a9bdc8"/>
  </radialGradient>
  <filter id="blurXL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="blurL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blurM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="blurS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <filter id="cloudAO" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#5f7f8f" flood-opacity="0.35"/>
  </filter>
  <clipPath id="dispClip"><polygon points="${pts(disp)}"/></clipPath>
  <clipPath id="baseClip"><polygon points="${pts(base)}"/></clipPath>
</defs>

<!-- ===== Baggrund ===== -->
<rect width="1200" height="800" fill="url(#bg)"/>
<rect y="625" width="1200" height="175" fill="url(#floor)"/>
<rect y="612" width="1200" height="26" fill="#9bd3e2" filter="url(#blurL)"/>

<!-- ===== Skygger på gulvet ===== -->
<!-- Bred, blød kastet skygge (lyset fra venstre/oppe) -->
<polygon points="${pts([[260, 600], [700, 620], [1120, 730], [560, 740]])}" fill="#22627a" opacity="0.6" filter="url(#blurXL)"/>
<!-- Skygge fra låget, der falder bagud til højre -->
<polygon points="${pts([[240, 590], [640, 600], [760, 640], [330, 630]])}" fill="#2f7189" opacity="0.3" filter="url(#blurL)"/>
<!-- Tæt kontaktskygge under basen -->
<polygon points="${pts([[A[0] + 4, A[1] + TH], [D[0], D[1] + TH + 2], [C[0], C[1] + TH + 2], [C[0] - 30, C[1] + 4]])}" fill="#164a5c" opacity="0.75" filter="url(#blurM)"/>

<!-- ===== Base ===== -->
<polygon points="${pts([D, C, [C[0], C[1] + TH], [D[0] + 4, D[1] + TH]])}" fill="#a3afb7"/>
<polygon points="${pts([A, D, [D[0] + 4, D[1] + TH], [A[0] + 2, A[1] + TH - 3]])}" fill="#bdc8ce"/>
<!-- Lys kant langs fronten -->
<polyline points="${pts([D, C])}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.9"/>
<polygon points="${pts(base)}" fill="url(#base)"/>
<!-- Porte i venstre side -->
<g fill="#5f6d76">
  <polygon points="${pts([[300, 600], [318, 609], [318, 614], [300, 605]])}"/>
  <polygon points="${pts([[330, 616], [342, 622], [342, 626], [330, 620]])}"/>
  <polygon points="${pts([[352, 627], [362, 632], [362, 636], [352, 631]])}"/>
</g>
<!-- Tastaturfordybning og taster -->
<polygon points="${pts(well)}" fill="url(#well)"/>
${keys}
<!-- Touchpad med indre skygge -->
<polygon points="${pts(pad)}" fill="url(#pad)" stroke="#c2ccd2" stroke-width="1.2"/>
<polyline points="${pts([pad[3], pad[0], pad[1]])}" fill="none" stroke="#b7c2c9" stroke-width="1.5" opacity="0.8"/>

<!-- Skyernes skygge på tastaturet -->
<g clip-path="url(#baseClip)" fill="#3e6273" opacity="0.32" filter="url(#blurL)">${cloudShadow}</g>

<!-- ===== Låg og skærm ===== -->
<!-- Lågets tykkelse (venstre kant) -->
<polygon points="${pts([[188, 147], [200, 140], A, [220, 563]])}" fill="#77858e"/>
<polyline points="${pts([[200, 140], A])}" fill="none" stroke="#eef2f4" stroke-width="1.5" opacity="0.8"/>
<polygon points="${pts(lid)}" fill="url(#lid)"/>
<!-- Lys kant øverst på låget -->
<polyline points="${pts([[200, 140], [600, 230]])}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
<!-- Mørk ramme om skærm og kamera -->
<polygon points="${pts(disp)}" fill="#26353f" transform="translate(-3 -3) scale(1)"/>
<polygon points="${pts(disp)}" fill="url(#display)"/>
<circle cx="406" cy="210" r="3.2" fill="#36444d"/><circle cx="406" cy="210" r="1.2" fill="#6c8ea0"/>
<!-- Hængsel -->
<polygon points="${pts([[290, 552], [580, 576], [580, 584], [290, 560]])}" fill="#7d8b94"/>

<g clip-path="url(#dispClip)">
  <!-- Diagonal refleks på glasset -->
  <polygon points="${pts([[236, 180], [330, 202], [290, 540], [254, 534]])}" fill="#ffffff" opacity="0.12"/>
  <polygon points="${pts([[345, 205], [365, 210], [322, 545], [305, 542]])}" fill="#ffffff" opacity="0.07"/>
  <!-- Lys hvor låsen bryder ud -->
  <ellipse cx="470" cy="440" rx="150" ry="120" fill="#e9f8ff" opacity="0.55" filter="url(#blurL)"/>
  <!-- Låsens skygge på skærmen -->
  <g transform="translate(560 300) rotate(32)" fill="#163f50" opacity="0.35" filter="url(#blurL)">
    <rect x="-80" y="-18" width="160" height="125" rx="24"/>
  </g>
</g>

<!-- ===== Skyer ===== -->
<g filter="url(#cloudAO)">${puffs(back, 'puffBack')}</g>
<g filter="url(#cloudAO)">${puffs(trail, 'puff')}</g>

<!-- ===== Hængelås med flamme ===== -->
<g transform="translate(610 268) rotate(32)">
  <circle cx="0" cy="150" r="90" fill="url(#flameGlow)"/>
  <path d="M-48 96 Q-44 190 0 262 Q44 190 48 96 Z" fill="url(#flame)" filter="url(#blurM)"/>
  <path d="M-30 96 Q-26 170 0 215 Q26 170 30 96 Z" fill="url(#flame)" filter="url(#blurS)"/>
  <path d="M-15 96 Q-12 140 0 168 Q12 140 15 96 Z" fill="#fffef2" filter="url(#blurS)"/>
  <!-- Dyse under låsen -->
  <path d="M-34 104 h68 l-8 14 h-52 Z" fill="#6d7a83"/>
  <!-- Kastet skygge bag låsen -->
  <rect x="-70" y="-6" width="160" height="125" rx="24" fill="#123a4a" opacity="0.25" filter="url(#blurL)"/>
  <!-- Bøjle med 3D-effekt -->
  <path d="M-52 -10 V-62 a52 52 0 0 1 104 0 V-10" fill="none" stroke="#7b8992" stroke-width="31" stroke-linecap="round" transform="translate(5 3)"/>
  <path d="M-52 -10 V-62 a52 52 0 0 1 104 0 V-10" fill="none" stroke="url(#shackle)" stroke-width="26" stroke-linecap="round"/>
  <path d="M-60 -18 V-62 a60 60 0 0 1 32 -52" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
  <path d="M60 -18 V-62" fill="none" stroke="#6f7d86" stroke-width="3" opacity="0.6"/>
  <!-- Låsekrop: side, front, kant og glans -->
  <rect x="-80" y="-18" width="160" height="125" rx="24" fill="url(#lockSide)" transform="translate(12 7)"/>
  <rect x="-80" y="-18" width="160" height="125" rx="24" fill="url(#lockBody)"/>
  <rect x="-80" y="-18" width="160" height="125" rx="24" fill="none" stroke="#ffd3ad" stroke-width="2" opacity="0.6"/>
  <rect x="-66" y="-8" width="70" height="11" rx="5.5" fill="#ffffff" opacity="0.45"/>
  <path d="M-72 80 Q-72 100 -50 100 H50" fill="none" stroke="#a9430f" stroke-width="3" opacity="0.5"/>
  <!-- Nøglehul med fordybning -->
  <circle cx="0" cy="32" r="21" fill="#e3681f"/>
  <circle cx="0" cy="32" r="17" fill="#4d200a"/>
  <path d="M-8 38 L-14 76 h28 L8 38 Z" fill="#4d200a"/>
  <path d="M-12 26 a13 13 0 0 1 14 -10" fill="none" stroke="#7a3510" stroke-width="2.5"/>
</g>

<!-- Forreste skylag oven på låsens flamme og tastaturet -->
<g filter="url(#cloudAO)">${puffs(mid, 'puff')}</g>
<g filter="url(#cloudAO)">${puffs(front, 'puff')}</g>
${flecks}

<!-- Vignet for dybde -->
<rect width="1200" height="800" fill="url(#vignette)"/>
</svg>`;
fs.writeFileSync(process.argv[2], svg);
