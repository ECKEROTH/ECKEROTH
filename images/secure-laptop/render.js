// Renderer SVG til PNG med Playwright i 2x opløsning
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync(process.argv[2], 'utf8');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await p.screenshot({ path: process.argv[3], clip: { x: 0, y: 0, width: 1200, height: 800 } });
  await b.close();
})();
