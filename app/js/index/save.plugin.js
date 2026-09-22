// ---------------------------------------------------------------
// GLOBAL VARIABLES
// Object: calculator
// ---------------------------------------------------------------

createSettingButton({
    icon: 'save',
    label: 'Save Project',
    onClick: saveState,
    order: 0
});
initializeSavePath();
window._name =  "Undefined";
function initializeSavePath(){
    const path = window.electron.userDataPath;
    window.electron.readDirectory(path).then(files => {
        if(files.includes("save")){
            window.electron.readDirectory(path+"/save").then(files => {
                if(!files.includes("history.json")){
                    window.electron.writeFile(path + "/save/history.json", JSON.stringify({}), (err)=>{if(err){console.log(err)}})
                }
            });
        }else{
            window.electron.createDirectory(path + "/save").then(() => {
                window.electron.writeFile(path + "/save/history.json", JSON.stringify({}), (err)=>{if(err){console.log(err)}})
            }).catch((dirError) => {
                console.error(dirError);
            });
        }
    }).catch(error => {
        console.error('Error reading directory:', error);
    });
}

function saveState(){
    const path = window.electron.userDataPath;
    const time = getCurrentTime();
    const state = calculator.getState();
    const id = state.randomSeed;
    const thumbnail = calculator.screenshot({
        width: 100,
        height: 100,
        targetPixelRatio: 2
    });
    function performSave(){
        window.electron.readFile(path+"/save/history.json", "utf-8", (err, data)=>{
            if(err) throw err;
            const history = JSON.parse(data);
            history[id] = {
                "name": window._name,
                "save time": time,
                "thumbnail": thumbnail
            };
            window.electron.writeFile(`${path}/save/${id}.json`,    JSON.stringify(state), (err)=>{
                window.electron.writeFile(`${path}/save/history.json`,  JSON.stringify(history), (err)=>{
                    reloadHistoryPanel();
                });
            });
        });
        window._saved = true;
    }

    if(window._saved) {
        performSave();
    }else{
        customPrompt("Project Name", (name)=>{
            if (name === null) return;
            window._name = name;
            performSave();
        });
    }
    return;
}
