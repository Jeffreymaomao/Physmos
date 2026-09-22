if(localStorage.getItem("id")&&localStorage.getItem("historyPath")){
    window.opener.postMessage({
        time: new Date(),
        id: localStorage.getItem("id"),
        path: localStorage.getItem("historyPath"),
        type: 'readHistory'
    });
}

window.addEventListener('message', (event) => {
    if(event.data.id){
        localStorage.setItem("id", event.data.id);
        localStorage.setItem("historyPath", event.data.historyPath);

        window.opener.postMessage({
            time: new Date(),
            id: localStorage.getItem("id"),
            path: localStorage.getItem("historyPath"),
            type: 'readHistory'
        });
    }

    if(event.data.history){
        window._history = event.data.history;
        const mainNode = document.querySelector("main");
        display(event.data.history, mainNode, deleteCallBack)
    }
});

function deleteCallBack(event, name) {
    const historyId = event.currentTarget.getAttribute('data-history-id');
    customPrompt('Delete project?', (confirmed) => {
        if (!confirmed) return;
        window.opener.postMessage({
            id: localStorage.getItem('id'),
            history: historyId,
            type: 'deleteHistory'
        });
    }, {confirm: true, message: `Delete “${name}”? This cannot be undone.`});
}

window.addEventListener("hashchange", (e)=>{
    const hash = window.location.hash.substring(1);
    window.opener.postMessage({
        id: localStorage.getItem("id"),
        history: hash,
        name: window._history[hash].name,
        type: 'openHistory',
    });
});

window.addEventListener("keydown", (e)=>{
    if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        window.close();
    }

});
