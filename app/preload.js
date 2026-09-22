const { contextBridge, ipcRenderer, clipboard, nativeImage } = require('electron');
const fs = require('fs');
const util = require('util');
const os = require('os');

const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);

ipcRenderer.invoke('get-user-data-path').then((userDataPath)=>{
    const __dirnames = __dirname.split(",");
    const homeDirectory = os.homedir();

    __dirnames.pop()
    const pathname = __dirnames.join("/");
    contextBridge.exposeInMainWorld(

        'electron', {
            send: (channel, data) => {
                ipcRenderer.send(channel, data);
            },
            on: (channel, func) => {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            },
            writeFileSync: (filename, content) => {
                return fs.writeFileSync(filename, content);
            },
            writeFile: (filename, content, callback) => {
                return fs.writeFile(filename, content, callback);
            },
            readFileSync: (filename, options) => {
                return fs.readFileSync(filename, options);
            },
            readFile: (filename, options, callback) => {
                return fs.readFile(filename, options, callback);
            },
            deleteFile: (filename, options, callback) => {
                return fs.unlink(filename, options, callback);
            },
            copyImage: (dataURL) => {
                const image = nativeImage.createFromDataURL(dataURL);
                clipboard.writeImage(image);
            },
            copyText: (text) =>{
                clipboard.writeText(text);
            },
            getBitmap: (dataURL)=>{
                const image = nativeImage.createFromDataURL(dataURL);
                return image.getBitmap()
            },
            openNewWindow: ()=>{ipcRenderer.invoke('open-new-window');},
            getWindowSettings: ()=>ipcRenderer.invoke('get-window-settings'),
            setMacTitleBarStyle: (style)=>ipcRenderer.invoke('set-window-title-bar-style', style),
            setWindowButtonsVisible: (visible)=>ipcRenderer.invoke('set-window-buttons-visible', visible),
            readDirectory: readdir,
            createDirectory: mkdir,

            __dirname: pathname,
            userDataPath: userDataPath,
            homePath: homeDirectory
        }
    );
});
