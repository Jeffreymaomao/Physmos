const fs = require('node:fs/promises');

module.exports = async function writeDesmosAssets(directory, source) {
    const match = source.match(/elt\.innerHTML = ("(?:[^"\\]|\\.)*");/);
    if (!match) throw new Error('Desmos embedded stylesheet not found.');
    const css = JSON.parse(match[1]);
    await fs.writeFile(`${directory}/calculator.css`, css);
    const icons = [...css.matchAll(/\.dcg-icon-([\w-]+):before\{content:"([^"}]+)"\}/g)];
    const unique = [...new Map(icons.map(([, name, code]) => [name, code])).entries()];
    const cards = unique.map(([name, code]) => `<div><i class="dcg-icon-${name}"></i><code>${name}</code><small>${code}</small></div>`).join('\n');
    await fs.writeFile(`${directory}/icons.html`, `<!doctype html><html><head><meta charset="utf-8"><title>Desmos v1.13 icons</title><link rel="stylesheet" href="calculator.css"><style>body{font:14px Arial;margin:24px;color:#333}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}main>div{display:flex;flex-direction:column;align-items:center;gap:12px;border:1px solid #ddd;padding:18px}i{font-size:24px}small{color:#666}</style></head><body class="dcg-calculator-api-container-v1_13"><h1>Desmos v1.13 icons</h1><p>Use dcg-icon-NAME. Codes belong to this version's bundled font.</p><main>${cards}</main></body></html>`);
};
