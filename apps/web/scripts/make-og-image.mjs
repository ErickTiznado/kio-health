/**
 * Genera la imagen Open Graph de la landing: apps/web/public/og.png (1200x630).
 *
 *   cd apps/web && node scripts/make-og-image.mjs
 *
 * Vive en el repo a propósito. El guion que toma las capturas de producto de
 * `public/landing/` quedó fuera, y por eso nadie ha podido regenerarlas; esta
 * imagen no repite ese error.
 *
 * La tarjeta no inventa nada: el titular es el de la propia landing, y el
 * mensaje de cifrado es el que el producto sostiene. Sin métricas, sin
 * testimonios, sin logos de clientes (PRODUCT.md los prohíbe).
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../public/og.png');
const logo = readFileSync(resolve(here, '../public/logo.png')).toString('base64');

// Tokens tomados de DESIGN.md, no reinventados.
const LINO = '#f5f3ef';
const PIZARRA = '#213547';
const KANJI_HONDO = '#5b46a8';
const GRIS = '#64748b';
const BORDE = '#e2e8f0';

const html = `<!doctype html><html lang="es"><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${LINO};color:${PIZARRA};
       font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
       display:flex;flex-direction:column;justify-content:space-between;
       padding:72px 80px;overflow:hidden}
  .mark{display:flex;align-items:center;gap:14px}
  .mark img{width:44px;height:44px;object-fit:contain}
  .mark span{font-size:26px;font-weight:700;letter-spacing:-0.01em}
  h1{font-size:78px;font-weight:700;line-height:1.06;letter-spacing:-0.03em;max-width:17ch}
  h1 em{font-style:normal;color:${KANJI_HONDO}}
  p{margin-top:26px;font-size:27px;font-weight:500;line-height:1.5;color:${GRIS};max-width:44ch}
  footer{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;
         letter-spacing:0.05em;text-transform:uppercase;color:${GRIS};
         border-top:1px solid ${BORDE};padding-top:24px}
  footer svg{width:20px;height:20px;stroke:${KANJI_HONDO};stroke-width:2;fill:none;
             stroke-linecap:round;stroke-linejoin:round}
</style>
<div class="mark"><img src="data:image/png;base64,${logo}" alt=""><span>Health</span></div>
<div>
  <h1>Agenda, sesión, nota y cobro son <em>un solo recorrido</em></h1>
  <p>La plataforma de gestión clínica para psicólogos.</p>
</div>
<footer>
  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  Notas y datos de contacto cifrados con AES-256-GCM
</footer>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: out });
await browser.close();
console.log(`✅ ${out}`);
