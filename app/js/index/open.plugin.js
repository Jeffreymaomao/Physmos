// Open the desmos state
var historyPanel = null;

function getHistoryPath() {
    return window.electron.userDataPath + "/save";
}

function readFile(filename) {
    return new Promise((resolve, reject) => {
        window.electron.readFile(filename, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function writeFile(filename, content) {
    return new Promise((resolve, reject) => {
        window.electron.writeFile(filename, content, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function deleteFile(filename) {
    return new Promise((resolve, reject) => {
        window.electron.deleteFile(filename, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function readJsonFile(filename) {
    return JSON.parse(await readFile(filename));
}

async function ensureHistoryPath() {
    const userDataPath = window.electron.userDataPath;
    const path = getHistoryPath();
    const files = await window.electron.readDirectory(userDataPath);

    if (!files.includes("save")) {
        await window.electron.createDirectory(path);
    }

    const saveFiles = await window.electron.readDirectory(path);
    if (!saveFiles.includes("history.json")) {
        await writeFile(path + "/history.json", JSON.stringify({}));
    }

    return path;
}

function reloadHistoryPanel() {
    if (historyPanel && historyPanel.isConnected) {
        loadHistoryPanel();
    }
}

function closeHistoryPanel() {
    if (!historyPanel) return;
    historyPanel.remove();
    historyPanel = null;
}

async function deleteHistory(historyId) {
    const path = getHistoryPath();
    const history = await readJsonFile(path + "/history.json");
    delete history[historyId];
    await deleteFile(path + `/${historyId}.json`);
    await writeFile(path + "/history.json", JSON.stringify(history));
    reloadHistoryPanel();
}

async function renameHistory(historyId, name) {
    const path = getHistoryPath();
    const history = await readJsonFile(path + "/history.json");
    if (!history[historyId]) return;

    history[historyId].name = name;
    await writeFile(path + "/history.json", JSON.stringify(history));
    reloadHistoryPanel();
}

async function openHistory(historyId, name) {
    const path = getHistoryPath();
    const state = await readJsonFile(path + `/${historyId}.json`);
    calculator.setState(state);
    window._name = name;
    window._saved = true;
}

async function loadHistoryPanel() {
    if (!historyPanel || !historyPanel.isConnected) return;

    try {
        const history = await readJsonFile(getHistoryPath() + "/history.json");
        display(history, historyPanel._historyContent, {
            onDelete: (event, name) => {
                const historyId = event.currentTarget.getAttribute('data-history-id');
                customPrompt('Delete project?', (confirmed) => {
                    if (!confirmed) return;
                    deleteHistory(historyId).catch(console.error);
                }, {confirm: true, message: `Delete “${name}”? This cannot be undone.`});
            },
            onOpen: (historyId) => {
                openHistory(historyId, history[historyId]?.name || 'Undefined').catch(console.error);
            },
            onRename: (historyId, name) => {
                renameHistory(historyId, name).catch(console.error);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

function createHistoryPanel() {
    const panel = document.createElement('section');
    panel.className = 'physmos-history-panel physmos-ui dcg-calculator-api-container-v1_13';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Projects');

    const header = document.createElement('header');
    header.className = 'history-header';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'history-close';
    closeButton.title = 'Close projects';
    closeButton.setAttribute('aria-label', 'Close projects');
    const closeIcon = document.createElement('i');
    closeIcon.className = 'dcg-icon-chevron-left';
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', closeHistoryPanel);

    const copy = document.createElement('div');
    copy.className = 'history-header-copy';
    const heading = document.createElement('h1');
    heading.textContent = 'Projects';
    copy.append(heading);

    const content = document.createElement('div');
    content.className = 'history-content';

    header.append(closeButton, copy);
    panel.append(header, content);
    panel._historyContent = content;
    return panel;
}

function openHistoryPanel() {
    const outer = document.querySelector('.dcg-exppanel-outer');
    if (!outer) return;

    if (historyPanel && historyPanel.isConnected) {
        loadHistoryPanel();
        return;
    }

    historyPanel = createHistoryPanel();
    outer.appendChild(historyPanel);
    loadHistoryPanel();
}

async function openFolder() {
    try {
        if (historyPanel && historyPanel.isConnected) {
            closeHistoryPanel();
            return;
        }

        await ensureHistoryPath();
        openHistoryPanel();
    } catch (error) {
        console.error(error);
    }
}

createSettingButton({
    icon: 'open',
    label: 'Open Project',
    onClick: openFolder,
    order: 1
});
