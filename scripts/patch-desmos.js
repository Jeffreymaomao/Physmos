// Preserve the symbol and typing customizations documented in app/memo/DesmosJS.md
// and the local v1.7 backup. Fail closed if a future upstream bundle changes shape.
module.exports = function patchDesmos(source) {
    const replaceOnce = (needle, replacement) => {
        if (source.split(needle).length !== 2) {
            throw new Error(`Desmos customization anchor changed: ${needle.slice(0, 60)}`);
        }
        source = source.replace(needle, replacement);
    };
    const symbols = {hbar: 'ℏ', partial: '∂', ell: 'ℓ', varR: 'ℜ', nabla: '∇', mathbbN: 'ℕ'};
    const greekEnd = '"Upsilon","Phi","Psi","Omega"]';
    replaceOnce(greekEnd, greekEnd.slice(0, -1) + ',' + Object.keys(symbols).map((name) => JSON.stringify(name)).join(',') + ']');
    replaceOnce('alpha:"symbol",beta:"symbol"', Object.keys(symbols).map((name) => `${name}:"symbol"`).join(',') + ',alpha:"symbol",beta:"symbol"');
    const forall = '"\\\\forall":"\\u2200"';
    const mappings = Object.entries(symbols).map(([name, glyph]) => `${JSON.stringify('\\' + name)}:${JSON.stringify(glyph)}`).join(',');
    replaceOnce(forall, forall + ',' + mappings);
    const commands = '"alpha beta sqrt theta phi rho pi tau nthroot cbrt sum prod integral percent infinity infty cross"';
    replaceOnce(commands, JSON.stringify('alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega Gamma Delta Xi Theta Lambda Pi Sigma Upsilon Phi Psi Omega hbar ell partial sqrt nthroot cbrt sum prod integral int percent infinity infty cross sim approx vec'));
    replaceOnce('"frac","binom","matrix"];function qL(r)', '"frac","binom","matrix","vec"];function qL(r)');
    replaceOnce('case"binom":{let{root:o,insertedSelection:i}=Ht(e,[]);return r=r.withRootAndSelection(o,i),NL(r,"binom")}', 'case"vec":{let o=new Kg({arg:je([]),val:String.fromCharCode(92)+"vec"}),{root:i,inserted:n}=Pr(e,o);return r.withRootAndSelection(i,qe(n.arg.firstCursor()))}case"binom":{let{root:o,insertedSelection:i}=Ht(e,[]);return r=r.withRootAndSelection(o,i),NL(r,"binom")}');
    return source;
};
