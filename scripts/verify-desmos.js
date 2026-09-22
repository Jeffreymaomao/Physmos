const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

try {
    const directory = path.join(__dirname, '../app/vendor/desmos/v1.13');
    const source = fs.readFileSync(path.join(directory, 'calculator.js'));
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
    const sha256 = crypto.createHash('sha256').update(source).digest('hex');
    if (manifest.apiVersion !== 'v1.13' || manifest.sha256 !== sha256) {
        throw new Error('Desmos bundle version or checksum mismatch.');
    }
    fs.accessSync(path.join(directory, 'calculator.css'));
    console.log(`Desmos verified: ${manifest.bundleVersion}`);
} catch (error) {
    console.error(`${error.message}\nRun pnpm run download-desmos before starting or packaging.`);
    process.exitCode = 1;
}
