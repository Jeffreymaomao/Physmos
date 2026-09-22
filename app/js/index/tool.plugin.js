// ---------------------------------------------------------------
// GLOBAL VARIABLES
// Object: calculator
// ---------------------------------------------------------------
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // 格式為 "YYYY-MM-DD HH:mm:ss"
    const formattedDateTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    return formattedDateTime;
}

function createSettingButton(iconClassName=null, eventListener=null) {
    let settingButtonContainer = document.querySelector(".dcg-settings-view-container");

    if (!settingButtonContainer) {
        console.error('button container not found!');
        return;
    }
    if(!iconClassName){
    	console.error('There is no input class name.');
        return;
    }

    // Create hit content container
    let hitContent = document.createElement('div');
    hitContent.className = "dcg-tooltip-hit-area-container";
    hitContent.setAttribute("handleevent", "true");
    settingButtonContainer.appendChild(hitContent);

    // Create save button
    let button = document.createElement('div');
    button.className = "dcg-icon-btn dcg-do-blur dcg-btn-flat-gray dcg-settings-pillbox";
    button.setAttribute("role", "button");
    button.style.background = "#ededed";
    hitContent.appendChild(button);

    // Create save icon
    let icon = document.createElement('i');
    icon.className = iconClassName;
    button.appendChild(icon);

    if (eventListener) {
        button.addEventListener('click', eventListener);
    }
}

function customPrompt(title, callback) {
    if(!callback) callback = ()=>{};
    // 創建彈窗模態框
    const modal = document.createElement('div');
    modal.classList.add("custom-prompt-modal");

    // 創建彈窗內容盒子
    const box = document.createElement('div');
    box.classList.add("custom-prompt-box");

    // 創建標題
    const p = document.createElement('p');
    p.textContent = title;

    // 創建輸入框
    const input = document.createElement('input');
    input.classList.add("custom-prompt-input");
    input.type = 'text';
    input.id = 'custom-prompt-input';

    // 創建 OK 按鈕
    const okButton = document.createElement('button');
    okButton.classList.add("custom-prompt-button");
    okButton.classList.add("default");
    okButton.textContent = 'OK';
    okButton.addEventListener('click', () => {
        const value = input.value;
        modal.style.display = 'none';
        callback(value);
        modal.remove();
    });

    // 創建 Cancel 按鈕
    const cancelButton = document.createElement('button');
    cancelButton.classList.add("custom-prompt-button");
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        callback(null);
        modal.remove();
    });

    // 組裝彈窗內容
    box.appendChild(p);
    box.appendChild(input);
    box.appendChild(cancelButton);
    box.appendChild(okButton);

    // 組裝模態框
    modal.appendChild(box);

    // 顯示彈窗
    setTimeout(() => {
        input.focus();
    }, 0);

    // 處理點擊彈窗外部關閉彈窗
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            callback(null);
            modal.remove();
        }
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            callback(this.value);
            modal.remove();
        }
    });

    // 將彈窗添加到文檔
    document.body.appendChild(modal);
}

