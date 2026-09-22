// ---------------------------------------------------------------
// GLOBAL VARIABLES
// Object: calculator
// ---------------------------------------------------------------
function waitForElement(selector, {root = document, timeout = 10000} = {}) {
    const findElement = () => root.querySelector(selector);
    const existing = findElement();
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve, reject) => {
        let timer = null;
        const observer = new MutationObserver(() => {
            const element = findElement();
            if (!element) return;

            if (timer) clearTimeout(timer);
            observer.disconnect();
            resolve(element);
        });

        observer.observe(root, {
            childList: true,
            subtree: true
        });

        if (timeout > 0) {
            timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timed out waiting for element: ${selector}`));
            }, timeout);
        }
    });
}

function appendToolbarItem(toolbar, item) {
    toolbar.appendChild(item);
}

function positionFileToolbar(toolbar, anchor) {
    const toolbarParent = toolbar.parentElement;
    if (!toolbarParent || !anchor.isConnected) return;

    const parentRect = toolbarParent.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    toolbar.style.top = `${anchorRect.bottom - parentRect.top + 5}px`;
}

function observeFileToolbarPosition(toolbar, anchor) {
    toolbar._physmosPositionObserver?.disconnect();
    positionFileToolbar(toolbar, anchor);

    const observer = new ResizeObserver(() => {
        positionFileToolbar(toolbar, anchor);
    });
    observer.observe(anchor);
    observer.observe(toolbar.parentElement);
    toolbar._physmosPositionObserver = observer;
}

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

async function createSettingButton(iconName = null, eventListener = null) {
    if (!iconName) return;
    const toolbarParent = await waitForElement('.dcg-overgraph-pillbox-elements');
    const positionAnchor = await waitForElement('.dcg-right-pillbox-elements', {
        root: toolbarParent
    });
    await waitForElement('.dcg-action-settings.dcg-popover-with-anchor__anchor', {
        root: positionAnchor
    });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    let toolbar = toolbarParent.querySelector('.physmos-file-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'physmos-file-toolbar physmos-ui dcg-calculator-api-container-v1_13';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Project files');
        toolbarParent.appendChild(toolbar);
        observeFileToolbarPosition(toolbar, positionAnchor);
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
    appendToolbarItem(toolbar, button);
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
