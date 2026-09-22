const { BrowserWindow } = require('electron');

const windowSettings = {
    macTitleBarStyle: 'default',
    showWindowButtons: true
};
const titleBarStyles = new Set([
    'default',
    'hidden',
    'hiddenInset',
    'customButtonsOnHover'
]);

function getWindowChromeOptions() {
    if (process.platform !== 'darwin') return {};
    return {
        titleBarStyle: windowSettings.macTitleBarStyle
    };
}

function applyWindowButtonVisibility(win) {
    if (process.platform !== 'darwin' || win.isDestroyed()) return;
    win.setWindowButtonVisibility(windowSettings.showWindowButtons);
}

function applyWindowSettings(win) {
    applyWindowButtonVisibility(win);
}

function setWindowButtonsVisible(visible) {
    windowSettings.showWindowButtons = Boolean(visible);
    for (const win of BrowserWindow.getAllWindows()) {
        applyWindowButtonVisibility(win);
    }
    return windowSettings.showWindowButtons;
}

function setMacTitleBarStyle(style) {
    if (!titleBarStyles.has(style)) {
        throw new Error(`Unsupported macOS title bar style: ${style}`);
    }
    windowSettings.macTitleBarStyle = style;
    return windowSettings.macTitleBarStyle;
}

module.exports = {
    applyWindowSettings,
    getWindowChromeOptions,
    setMacTitleBarStyle,
    setWindowButtonsVisible,
    windowSettings
};
