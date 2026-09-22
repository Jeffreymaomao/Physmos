// Open the desmos state
var historyWindow=null;
function reloadHistoryWindow(){
    if(historyWindow){
        historyWindow.postMessage({
            id: calculator.getState().randomSeed,
            historyPath: window.electron.userDataPath,
        });
    }
}

createSettingButton("dcg-icon-folder-open", (e)=>{
    const path = window.electron.userDataPath;
    window.electron.readDirectory(path).then(files => {
        if(files.includes("save")){
            openFolder(path+"/save");
        }else{
             window.electron.createDirectory(path + "/save").then(() => {
                window.electron.writeFile(path + "/save/history.json", JSON.stringify({}), (err)=>{
                    if(err){
                        console.log(e)
                    }else{
                        openFolder(path+"/save");
                    }
                });
            }).catch((dirError) => {
                console.error(dirError);
            });
        }
    }).catch(error => {
        console.error('Error reading directory:', error);
    });
});

function openFolder(){
    if(historyWindow && !historyWindow.closed){
        historyWindow.close();
    }
    const path = window.electron.userDataPath+"/save";
    historyWindow = window.open("hisory.html", 'history', [
        "width=400",
        "height=600",
        "x=0",
        "minWidth = 90",
        "y=0",
    ].join(","));
    historyWindow.addEventListener("load", (e)=>{
        historyWindow.postMessage({
            id: calculator.getState().randomSeed,
            historyPath: path,
        });
    });
    window.addEventListener('beforeunload', () => {
        if (historyWindow && !historyWindow.closed) {
            historyWindow.close();
        }
    });
    window.addEventListener('message', (event) => {
        if(event.data.id !== calculator.getState().randomSeed) return;

        if(event.data.type=="readHistory"){
            window.electron.readFile(path + "/history.json", 'utf8', (err, data)=>{
                if (err) throw err;
                const history = JSON.parse(data);
                historyWindow.postMessage({
                    history: history,
                })
            });
        }

        if(event.data.type=="renameHistory"){
            window.electron.readFile(path + `/history.json`, 'utf8', (err, data)=>{
                if (err) throw err;
                const history = JSON.parse(data);
                history[event.data.history].name = event.data.name;
                window.electron.writeFile(path + "/history.json", JSON.stringify(history), (err)=>{
                    if(err){
                        console.log(e)
                    }else{
                        console.log("Rename history!"); 
                        window._name = event.data.name;
                        reloadHistoryWindow();
                    }
                });
            });
        }

        if(event.data.type=="openHistory"){
            window.electron.readFile(path + `/${event.data.history}.json`, 'utf8', (err, data)=>{
                if (err) throw err;
                const state = JSON.parse(data);
                calculator.setState(state);
                window._name = event.data.name;
                window._saved = true;

                historyWindow.postMessage({
                    id: calculator.getState().randomSeed,
                    historyPath: path,
                });
            });
        }

        if(event.data.type=="deleteHistory"){
            window.electron.readFile(path + "/history.json", 'utf8', (err, data)=>{
                if (err) throw err;
                const history = JSON.parse(data);
                delete history[event.data.history];
                window.electron.deleteFile(path + `/${event.data.history}.json`, (err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        window.electron.writeFile(path + "/history.json", JSON.stringify(history), (err)=>{
                            if(err){
                                console.log(e)
                            }else{
                                console.log("Delete history!"); 
                                reloadHistoryWindow();
                            }
                        });
                    }
                })
            });
        }
    });
}


