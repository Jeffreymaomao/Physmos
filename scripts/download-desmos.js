const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const patchDesmos = require('./patch-desmos');
const writeDesmosAssets = require('./desmos-assets');

async function downloadDesmos() {
    // The public documentation key is for local prototyping only.
    let apiKey = process.env.DESMOS_API_KEY;
    if (!apiKey) {
        const docs = await fetch('https://www.desmos.com/api/v1.13/docs');
        if (!docs.ok) throw new Error(`Desmos documentation: HTTP ${docs.status}`);
        const html = await docs.text();
        apiKey = html.match(/apiKey=([a-f0-9]{32})/)?.[1];
        if (!apiKey) throw new Error('Set DESMOS_API_KEY to download the bundle.');
    }
    const url = new URL('https://www.desmos.com/api/v1.13/calculator.js');
    url.searchParams.set('apiKey', apiKey);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Desmos download failed: HTTP ${response.status}`);
    }
    const upstream = await response.text();
    const source = patchDesmos(upstream);
    const version = source.match(/var desmosVersion = '([^']+)'/);
    if (!version || !/^v1\.13(?:\D|$)/.test(version[1])) {
        throw new Error('The downloaded bundle is not Desmos v1.13.');
    }
    const directory = path.join(__dirname, '../app/vendor/desmos/v1.13');
    await fs.mkdir(directory, {recursive: true});
    await fs.writeFile(path.join(directory, 'calculator.js'), source);
    await writeDesmosAssets(directory, source);
    await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify({
        apiVersion: 'v1.13',
        customizationVersion: 1,
        upstreamSha256: crypto.createHash('sha256').update(upstream).digest('hex'),
        bundleVersion: version[1],
        downloadedAt: new Date().toISOString(),
        sha256: crypto.createHash('sha256').update(source).digest('hex')
    }, null, 4) + '\n');
    console.log(`Downloaded Desmos ${version[1]} (includes styles and fonts).`);
}

downloadDesmos().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
