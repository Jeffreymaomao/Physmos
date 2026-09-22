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

function createSettingButton(iconName = null, eventListener = null) {
    if (!iconName) return;
    let toolbar = document.querySelector('.physmos-file-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'physmos-file-toolbar physmos-ui dcg-calculator-api-container-v1_13';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Project files');
        document.body.appendChild(toolbar);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'physmos-file-button';
    const label = iconName === 'save' ? 'Save project' : 'Open project';
    button.title = label;
    button.setAttribute('aria-label', label);
    const icon = window.createPhysmosIcon(iconName);
    button.appendChild(icon);
    if (eventListener) button.addEventListener('click', eventListener);
    toolbar.appendChild(button);
}

function customPrompt(title, callback = () => {}, options = {}) {
    const previousFocus = document.activeElement;
    const modal = document.createElement('div');
    modal.className = 'custom-prompt-modal physmos-ui';
    const box = document.createElement('form');
    box.className = 'custom-prompt-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'project-prompt-title');
    const heading = document.createElement('h2');
    heading.id = 'project-prompt-title';
    heading.textContent = title;
    const input = document.createElement('input');
    input.className = 'custom-prompt-input';
    input.id = 'custom-prompt-input';
    input.setAttribute('aria-label', title);
    input.placeholder = 'Untitled project';
    const actions = document.createElement('div');
    actions.className = 'custom-prompt-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'custom-prompt-button';
    cancel.textContent = 'Cancel';
    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'custom-prompt-button default';
    save.textContent = options.confirm ? 'Delete' : 'Save';
    let closed = false;
    const close = (value) => {
        if (closed) return;
        closed = true;
        modal.remove();
        previousFocus?.focus();
        callback(value);
    };
    cancel.addEventListener('click', () => close(null));
    box.addEventListener('submit', (event) => {
        event.preventDefault();
        close(options.confirm ? true : input.value.trim() || 'Untitled project');
    });
    modal.addEventListener('click', (event) => {
        if (event.target === modal) close(null);
    });
    modal.addEventListener('keydown', (event) => {
        event.stopPropagation();
        if (event.key === 'Escape') close(null);
        if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === (options.confirm ? cancel : input)) {
                event.preventDefault();
                save.focus();
            } else if (!event.shiftKey && document.activeElement === save) {
                event.preventDefault();
                (options.confirm ? cancel : input).focus();
            }
        }
    });
    actions.append(cancel, save);
    box.appendChild(heading);
    if (options.confirm) {
        const message = document.createElement('p');
        message.textContent = options.message;
        box.appendChild(message);
    } else {
        box.appendChild(input);
    }
    box.appendChild(actions);
    modal.appendChild(box);
    document.body.appendChild(modal);
    (options.confirm ? cancel : input).focus();
}
