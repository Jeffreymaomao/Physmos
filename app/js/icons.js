// Set source to 'svg' to use your artwork from app/icons instead of Desmos.
window.physmosIcons = {
    delete: {source: 'desmos', className: 'dcg-icon-trashcan', file: 'icons/delete.svg'},
    save: {source: 'desmos', className: 'dcg-icon-download', file: 'icons/save.svg'},
    open: {source: 'desmos', className: 'dcg-icon-history', file: 'icons/open.svg'},
    newGraph: {source: 'desmos', className: 'dcg-icon-folder-open', file: 'icons/open.svg'}
};

window.createPhysmosIcon = function (name) {
    const definition = window.physmosIcons[name];
    if (!definition) throw new Error(`Unknown Physmos icon: ${name}`);
    const icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    icon.dataset.icon = name;
    if (definition.source === 'svg') {
        icon.className = 'physmos-svg-icon';
        icon.style.setProperty('--icon-url', `url("${new URL(definition.file, document.baseURI).href}")`);
    } else {
        icon.className = definition.className;
    }
    return icon;
};
