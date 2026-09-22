const { app, ipcMain } = require('electron');
const isMac = process.platform === 'darwin';

const menuTemplate = [
        ...(isMac ?
            [{
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            }] :
            []),
        {
        label: 'File',
        submenu: [
            {
                label: 'New Window',
                accelerator: 'CmdOrCtrl+N',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('open-new-window');
                }
            },
            {
                label: 'Close Window',
                accelerator: 'CmdOrCtrl+W',
                click: (menuItem, browserWindow, event) => {
                    if (browserWindow) {
                        browserWindow.close();
                    }
                }
            },
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: (item, focusedWindow) => {
                    if (focusedWindow) {
                        focusedWindow.reload();
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('open-file');
                }
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('save-file');
                }
            },
            {
                label: 'Export LaTeX',
                accelerator: 'CmdOrCtrl+E',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('export-latex');
                }
            },
        ]
    },
    {
        label: 'Edit',
        submenu: [{
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            },
        ]
    },
    {
        label: 'View',
        submenu: [{
                label: 'Toggle Full Screen',
                accelerator: isMac ? 'Cmd+0' : 'F11',
                click: (item, focusedWindow) => {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                }
            },
            {
                label: 'Formula View',
                accelerator: 'CmdOrCtrl+1',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('only-formula');
                }
            },
            {
                label: 'Formula and Grapher View',
                accelerator: 'CmdOrCtrl+2',
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('formula-grapher');
                }
            },
            { type: 'separator' },
            {
                label: 'Zoom In',
                accelerator: 'CmdOrCtrl+Plus', // macOS 和 Windows/Linux 通用
                click: (item, focusedWindow) => {
                    if (focusedWindow && focusedWindow.webContents) {
                        focusedWindow.webContents.setZoomLevel(focusedWindow.webContents.getZoomLevel() + 1);
                    }
                }
            },
            {
                label: 'Zoom Out',
                accelerator: 'CmdOrCtrl+-',
                click: (item, focusedWindow) => {
                    if (focusedWindow && focusedWindow.webContents) {
                        focusedWindow.webContents.setZoomLevel(focusedWindow.webContents.getZoomLevel() - 1);
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Toggle Developer Tools',
                accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                click: (item, focusedWindow) => {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
                }
            }
        ]
    },
];

module.exports = menuTemplate;