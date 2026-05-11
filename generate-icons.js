/**
 * Genera íconos PWA en PNG usando Canvas API de Node.js (via canvas package)
 * o como fallback crea SVGs que el navegador puede usar directamente.
 */
const fs = require('fs');
const path = require('path');

// SVG base del ícono (fondo azul + letra P blanca)
function makeSVG(size) {
  const r = Math.round(size * 0.15);
  const fontSize = Math.round(size * 0.52);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#2563eb"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui,sans-serif" font-weight="bold" font-size="${fontSize}" fill="#ffffff">P</text>
</svg>`;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const dir = path.join(__dirname, 'img', 'icons');

sizes.forEach(s => {
  const svgPath = path.join(dir, `icon-${s}x${s}.svg`);
  fs.writeFileSync(svgPath, makeSVG(s));
  console.log(`✅ icon-${s}x${s}.svg`);
});

console.log('\nÍconos SVG generados en img/icons/');
