// ---------------------------------------------------------------
// GLOBAL VARIABLES
// Object: calculator
// ---------------------------------------------------------------
var filePillbox = null;
var filePillboxObserver = null;
var fileTooltip = null;
var fileTooltipMount = null;
var fileTooltipTimer = null;

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

async function createSettingButton(iconNameOrOptions = null, eventListener = null, options = {}) {
    const config = normalizeSettingButtonConfig(iconNameOrOptions, eventListener, options);
    if (!config.iconName && !config.iconClassName) return;

    const pillboxRoot = await waitForElement('.dcg-right-pillbox-elements');
    await waitForElement('.dcg-action-settings.dcg-popover-with-anchor__anchor', {
        root: pillboxRoot
    });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    if (!filePillbox) {
        filePillbox = document.createElement('div');
        filePillbox.className = 'physmos-file-pillbox dcg-btn-flat-gray dcg-btn-flat-gray-group dcg-group-vertical dcg-pillbox-element';
        filePillbox.setAttribute('role', 'group');
        filePillbox.setAttribute('aria-label', 'Project files');
    }
    if (!filePillbox.isConnected) pillboxRoot.appendChild(filePillbox);
    observeFilePillbox();

    const hitArea = document.createElement('div');
    hitArea.className = 'dcg-tooltip-hit-area-container dcg-display-block dcg-do-not-blur dcg-cursor-default';
    hitArea.tabIndex = -1;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = [
        'dcg-unstyled-button',
        'dcg-pillbox-btn-interior',
        'physmos-file-button',
        config.className
    ].filter(Boolean).join(' ');
    button.setAttribute('aria-label', config.label);
    if (config.id) button.id = config.id;
    if (config.disabled) {
        button.disabled = true;
        button.classList.add('dcg-disabled');
    }
    const icon = config.iconClassName ? document.createElement('i') : window.createPhysmosIcon(config.iconName);
    if (config.iconClassName) {
        icon.className = config.iconClassName;
    }
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
    if (config.onClick) button.addEventListener('click', config.onClick);
    if (config.tooltip) attachFileTooltip(button, config.tooltip);
    hitArea.appendChild(button);
    insertFileButton(hitArea, config.order);
}

function normalizeSettingButtonConfig(iconNameOrOptions, eventListener, options) {
    const isObjectConfig = iconNameOrOptions && typeof iconNameOrOptions === 'object';
    const config = isObjectConfig ? {...iconNameOrOptions} : {
        ...options,
        icon: iconNameOrOptions,
        onClick: eventListener
    };
    const iconName = config.icon || config.iconName || null;
    const label = config.label || (iconName === 'save' ? 'Save Project' :
        iconName === 'open' ? 'Open Project' : 'Project action');

    return {
        iconName,
        iconClassName: config.iconClassName || null,
        label,
        tooltip: config.tooltip === false ? null : config.tooltip || label,
        onClick: config.onClick || null,
        className: config.className || '',
        id: config.id || null,
        order: Number.isFinite(config.order) ? config.order : null,
        disabled: Boolean(config.disabled)
    };
}

function insertFileButton(hitArea, order) {
    if (order === null) {
        filePillbox.appendChild(hitArea);
        return;
    }

    hitArea.dataset.order = String(order);
    const nextButton = [...filePillbox.children].find((item) => {
        const itemOrder = Number(item.dataset.order);
        return Number.isFinite(itemOrder) && itemOrder > order;
    });
    filePillbox.insertBefore(hitArea, nextButton || null);
}

function observeFilePillbox() {
    if (filePillboxObserver) return;

    const observer = new MutationObserver(() => {
        const pillboxRoot = document.querySelector('.dcg-right-pillbox-elements');
        if (pillboxRoot && filePillbox && !filePillbox.isConnected) {
            hideFileTooltip();
            pillboxRoot.appendChild(filePillbox);
        }
    });
    const calculatorRoot = document.querySelector('.dcg-calculator-api-container-v1_13') || document.body;
    observer.observe(calculatorRoot, {childList: true, subtree: true});
    filePillboxObserver = observer;
}

function attachFileTooltip(target, label) {
    target.addEventListener('mouseenter', () => {
        showFileTooltip(target, label, 250);
    });
    target.addEventListener('mouseleave', hideFileTooltip);
    target.addEventListener('focus', () => {
        showFileTooltip(target, label, 0);
    });
    target.addEventListener('blur', hideFileTooltip);
    target.addEventListener('click', hideFileTooltip);
}

function hideFileTooltip() {
    if (fileTooltipTimer) {
        clearTimeout(fileTooltipTimer);
        fileTooltipTimer = null;
    }
    if (fileTooltip) {
        fileTooltip.remove();
        fileTooltip = null;
    }
}

function showFileTooltip(target, label, delay) {
    hideFileTooltip();
    fileTooltipTimer = setTimeout(() => {
        fileTooltipTimer = null;
        if (!target.isConnected) return;

        if (!fileTooltipMount || !fileTooltipMount.isConnected) {
            fileTooltipMount = document.createElement('div');
            fileTooltipMount.className = 'dcg-tooltip-mount-pt';
            const mountRoot = target.closest('.dcg-tap-container') ||
                document.querySelector('.dcg-calculator-api-container-v1_13') ||
                document.body;
            mountRoot.appendChild(fileTooltipMount);
        }

        const targetRect = target.getBoundingClientRect();
        const mountRect = fileTooltipMount.getBoundingClientRect();
        const container = document.createElement('div');
        container.className = 'dcg-tooltip-positioning-container dcg-tooltip-gravity-e-w dcg-tooltip-theme-dark';
        container.style.top = `${targetRect.top - mountRect.top}px`;
        container.style.left = `${targetRect.left - mountRect.left}px`;
        container.style.width = `${targetRect.width}px`;
        container.style.height = `${targetRect.height}px`;

        const messageContainer = document.createElement('div');
        messageContainer.className = 'dcg-tooltip-message-container';
        messageContainer.style.transform = 'translate(0, -50%)';
        messageContainer.style.right = '100%';
        messageContainer.style.width = '200px';
        messageContainer.style.top = '50%';
        messageContainer.style.marginRight = '5px';
        messageContainer.style.textAlign = 'right';

        const message = document.createElement('div');
        message.className = 'dcg-tooltip-message';
        message.setAttribute('role', 'tooltip');
        message.style.left = '0px';
        const text = document.createElement('span');
        text.textContent = label;
        message.appendChild(text);

        const arrow = document.createElement('div');
        arrow.className = 'dcg-tooltip-arrow dcg-tooltip-gravity-w';
        arrow.style.top = '50%';
        arrow.style.right = '100%';
        arrow.style.border = '5px solid transparent';
        arrow.style.borderColor = 'transparent transparent transparent var(--dcg-custom-text-color, #000)';
        arrow.style.marginRight = '-5px';
        arrow.style.marginTop = '-5px';

        messageContainer.appendChild(message);
        container.append(messageContainer, arrow);
        fileTooltipMount.appendChild(container);
        fileTooltip = container;
    }, delay);
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
