var elt = document.getElementById('calculator');
var calculator = Desmos.GraphingCalculator(elt, {
    keypad:true,             //左下角的鍵盤
    graphpaper:true,         //繪圖區

    expressions:true,        //程式區
    settingsMenu:true,       //右上角設定區
    zoomButtons:true,        //右上角放大縮小按鈕
    expressionsTopbar:true,  //方程式區域最上方的設定
    pasteGraphLink: true, 

    fontSize:16,             //字體大小，default: 16 
    border: false,           //邊界
    actions: true,            //ticker, action(->)
});

calculator.focusFirstExpression();

window.addEventListener("keydown", (e)=>{
    // -----------------------------------
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveState();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        openFolder();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        exportLatex();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        screenshot();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        copy(e);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        window.electron.openNewWindow();
    }
    // -----------------------------------
    if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault();
        calculator.updateSettings({
            graphpaper:false
        });
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault();
        calculator.updateSettings({
            graphpaper:true
        });
    }
});

window.electron.on('open-file', (event, ...args) => {
    openFolder();
});

window.electron.on('save-file', (event, ...args) => {
    saveState();
});

window.electron.on('export-latex', (event, ...args) => {
    exportLatex();
});

window.electron.on('take-screenshot', (event, ...args) => {
    screenshot();
});

window.electron.on('open-new-window', (event, ...args) => {
    window.electron.openNewWindow();
});

window.electron.on('only-formula', (event, ...args) => {
    console.log("Toggle graphpaper event received", args);
    calculator.updateSettings({
        graphpaper:false
    });
});

window.electron.on('formula-grapher', (event, ...args) => {
    console.log("Toggle graphpaper event received", args);
    calculator.updateSettings({
        graphpaper:true
    });
});






