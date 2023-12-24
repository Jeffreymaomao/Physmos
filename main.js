const { app, BrowserWindow, ipcMain, screen, remote, nativeImage,  Menu, shell } = require('electron');
const path = require('path');
const pkg = require('./package.json');
const util = require('util');
const fs = require('fs');

try {require('electron-reloader')(module);} catch {}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const menuTemplate = require('./app/menuTemplate');
// const menu = Menu.buildFromTemplate(menuTemplate);
// Menu.setApplicationMenu(menu);


let mainWindow;
let windows = [];
const createNewWindow = async () => {
    const offset = { x: 15, y: 15 };
    let x, y;
    if (windows.length > 0) {
        const lastWindow = windows[windows.length - 1];
        const [lastX, lastY] = lastWindow.getPosition();
        const [lastWidth, lastHeight] = lastWindow.getSize();
        x = lastX + offset.x;
        y = lastY + offset.y;
    } else {
        x = y = undefined;
    }
    const win = new BrowserWindow({
        title: app.name,
        show: false,
        width: 800,
        height: 600,
        x: x,
        y: y,
        center: true,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'app/preload.js'),
            contextIsolation: true,
            nodeIntegration: true,
        }
    });
    win.on('ready-to-show', () => {
        win.show();
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    });
    win.on('closed', () => {
        windows = windows.filter(w => w !== win);
    });
    win.loadFile(path.join(__dirname, 'app/index.html'));
    windows.push(win);
    return win;
};
app.setAboutPanelOptions({applicationName: pkg.name,applicationVersion: pkg.version,version: "dev",});
app.on('window-all-closed', function() {app.quit()});
app.on('activate', async () => { if (mainWindow === null) createNewWindow()});
app.whenReady().then(() => {mainWindow = createNewWindow();});

ipcMain.handle('open-new-window', () => {createNewWindow();});
ipcMain.handle('get-user-data-path', async () => {return app.getPath('userData');});







