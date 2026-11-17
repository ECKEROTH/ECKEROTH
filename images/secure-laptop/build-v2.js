// Genererer v2 af illustrationen: laptop i perspektiv med tastatur,
// og en hængelås der "letter" fra skærmen som raketten i originalen.
const fs = require('fs');

// Bilineær interpolation over en firkant (bruges til tastaturgitter)
function quad(p, u, v) {
  const [a, b, c, d] = p; // a=bagved venstre, b=bagved højre, c=forrest højre, d=forrest venstre
  const top = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const bot = [d[0] + (c[0] - d[0]) * u, d[1] + (c[1] - d[1]) * u];
  return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
}
const pts = (arr) => arr.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');

// Geometri for base (tastaturdel): hængsel A-B, front D-C
const A = [230, 560], B = [640, 590], C = [1000, 690], D = [520, 680];
const base = [A, B, C, D];

// Tastaturtaster: 5 rækker x 13 taster i området u 0.06-0.94, v 0.08-0.55
let keys = '';
const rows = 5, cols = 13;
for (let r = 0; r < rows; r++) {
  for (let k = 0; k < cols; k++) {
    const u0 = 0.06 + k * (0.88 / cols) + 0.006, u1 = u0 + 0.88 / cols - 0.012;
    const v0 = 0.08 + r * (0.47 / rows) + 0.012, v1 = v0 + 0.47 / rows - 0.024;
    const q = [quad(base, u0, v0), quad(base, u1, v0), quad(base, u1, v1), quad(base, u0, v1)];
    keys += `<polygon points="${pts(q)}" fill="#dfe5e9" stroke="#b7c2c9" stroke-width="0.8"/>`;
  }
}
// Mellemrumstast og touchpad
const space = [quad(base, 0.3, 0.5), quad(base, 0.7, 0.5), quad(base, 0.7, 0.55), quad(base, 0.3, 0.55)];
const pad = [quad(base, 0.36, 0.63), quad(base, 0.64, 0.63), quad(base, 0.64, 0.9), quad(base, 0.36, 0.9)];

// Skærmlåg: bundkant = hængsel A-B, vippet bagud
const lid = [[200, 140], [600, 230], B, A];
const disp = [[232, 176], [580, 256], [618, 566], [252, 538]];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5aa7bd"/><stop offset="1" stop-color="#8ccbdc"/>
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8fcde0"/><stop offset="1" stop-color="#b4e1ec"/>
  </linearGradient>
  <linearGradient id="lid" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#d9e1e6"/><stop offset="1" stop-color="#9eabb4"/>
  </linearGradient>
  <linearGradient id="display" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3e7f97"/><stop offset="0.55" stop-color="#5fa9c2"/><stop offset="1" stop-color="#a7dbe9"/>
  </linearGradient>
  <linearGradient id="base" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#e3e9ec"/><stop offset="1" stop-color="#f7f9fa"/>
  </linearGradient>
  <linearGradient id="lockBody" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffb070"/><stop offset="0.5" stop-color="#f6822f"/><stop offset="1" stop-color="#d65a17"/>
  </linearGradient>
  <linearGradient id="lockSide" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#b94a12"/><stop offset="1" stop-color="#9a3c0e"/>
  </linearGradient>
  <linearGradient id="shackle" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#e6ecef"/><stop offset="1" stop-color="#9eabb3"/>
  </linearGradient>
  <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff6c8"/><stop offset="0.35" stop-color="#ffc24a"/><stop offset="1" stop-color="#ff7a1f" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="puff" cx="0.38" cy="0.3" r="0.75">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#f3f6f8"/><stop offset="1" stop-color="#c6d4dc"/>
  </radialGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="blurS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="drop" x="-30%" y="-30%" width="160%" height="170%">
    <feDropShadow dx="4" dy="10" stdDeviation="9" flood-color="#2a6478" flood-opacity="0.35"/>
  </filter>
</defs>

<!-- Baggrund med blød horisont -->
<rect width="1200" height="800" fill="url(#bg)"/>
<rect y="620" width="1200" height="180" fill="url(#floor)"/>
<rect y="610" width="1200" height="24" fill="#9fd5e4" filter="url(#blur)"/>

<!-- Skygge under laptop -->
<polygon points="${pts([[230,580],[660,610],[1030,715],[500,705]])}" fill="#3d849c" opacity="0.4" filter="url(#blur)"/>

<!-- Base: tykkelse (front og højre side) og overflade -->
<polygon points="${pts([D, C, [C[0], C[1] + 13], [D[0], D[1] + 13]])}" fill="#aab6be"/>
<polygon points="${pts([A, D, [D[0], D[1] + 13], [A[0], A[1] + 10]])}" fill="#c3cdd3"/>
<polygon points="${pts(base)}" fill="url(#base)"/>
${keys}
<polygon points="${pts(space)}" fill="#dfe5e9" stroke="#b7c2c9" stroke-width="0.8"/>
<polygon points="${pts(pad)}" fill="#e9eef1" stroke="#c4ced4" stroke-width="1"/>

<!-- Skærmlåg og skærm -->
<polygon points="${pts([[190, 146], [200, 140], A, [222, 562]])}" fill="#7f8d96"/>
<polygon points="${pts(lid)}" fill="url(#lid)"/>
<polygon points="${pts(disp)}" fill="url(#display)"/>
<polygon points="${pts([disp[0], [330, 198], [300, 545], disp[3]])}" fill="#ffffff" opacity="0.12"/>

<!-- Lysskær ved skærmen -->
<ellipse cx="470" cy="420" rx="170" ry="130" fill="#ffffff" opacity="0.35" filter="url(#blur)"/>

<!-- Skyer der vælter ud af skærmen og ned over tastaturet -->
<g filter="url(#drop)">
  <circle cx="300" cy="545" r="42" fill="url(#puff)"/>
  <circle cx="360" cy="505" r="52" fill="url(#puff)"/>
  <circle cx="430" cy="470" r="58" fill="url(#puff)"/>
  <circle cx="500" cy="480" r="55" fill="url(#puff)"/>
  <circle cx="560" cy="520" r="50" fill="url(#puff)"/>
  <circle cx="340" cy="580" r="46" fill="url(#puff)"/>
  <circle cx="415" cy="555" r="56" fill="url(#puff)"/>
  <circle cx="495" cy="565" r="54" fill="url(#puff)"/>
  <circle cx="575" cy="585" r="46" fill="url(#puff)"/>
  <circle cx="640" cy="610" r="38" fill="url(#puff)"/>
  <circle cx="700" cy="628" r="28" fill="url(#puff)"/>
  <circle cx="455" cy="610" r="40" fill="url(#puff)"/>
  <circle cx="540" cy="625" r="34" fill="url(#puff)"/>
</g>

<!-- Hængelås der letter diagonalt med flammehale -->
<g transform="translate(610 270) rotate(32)">
  <!-- Flamme (bag låsen) -->
  <path d="M-46 95 Q-40 190 0 250 Q40 190 46 95 Z" fill="url(#flame)" filter="url(#blurS)"/>
  <path d="M-26 95 Q-20 160 0 200 Q20 160 26 95 Z" fill="#fffbe6" opacity="0.9" filter="url(#blurS)"/>
  <g filter="url(#drop)">
    <!-- Bøjle -->
    <path d="M-52 -10 V-62 a52 52 0 0 1 104 0 V-10" fill="none" stroke="#8a979f" stroke-width="30" stroke-linecap="round" transform="translate(5 3)"/>
    <path d="M-52 -10 V-62 a52 52 0 0 1 104 0 V-10" fill="none" stroke="url(#shackle)" stroke-width="26" stroke-linecap="round"/>
    <path d="M-60 -20 V-62 a60 60 0 0 1 32 -52" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <!-- Låsekrop -->
    <rect x="-80" y="-18" width="160" height="125" rx="24" fill="url(#lockSide)" transform="translate(12 6)"/>
    <rect x="-80" y="-18" width="160" height="125" rx="24" fill="url(#lockBody)"/>
    <rect x="-66" y="-8" width="64" height="11" rx="5.5" fill="#ffffff" opacity="0.4"/>
    <!-- Nøglehul -->
    <circle cx="0" cy="32" r="17" fill="#55250c"/>
    <path d="M-8 38 L-14 76 h28 L8 38 Z" fill="#55250c"/>
  </g>
</g>

<!-- Svævende skyfnug -->
<g fill="#ffffff">
  <circle cx="420" cy="380" r="8" opacity="0.9"/><circle cx="455" cy="350" r="5" opacity="0.85"/>
  <circle cx="380" cy="420" r="6" opacity="0.85"/><circle cx="520" cy="395" r="7" opacity="0.9"/>
  <circle cx="680" cy="480" r="9" opacity="0.9"/><circle cx="720" cy="520" r="6" opacity="0.8"/>
  <circle cx="760" cy="430" r="5" opacity="0.8"/><circle cx="330" cy="460" r="5" opacity="0.8"/>
</g>
</svg>`;
fs.writeFileSync(process.argv[2], svg);
