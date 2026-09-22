const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('Electron Desmos works offline, saves, restores and opens history', {timeout: 60000}, async () => {
    const root = path.resolve(__dirname, '../../..');
    const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'physmos-test-'));
    const executable = process.env.PHYSMOS_EXECUTABLE || require('electron');
    const args = process.env.PHYSMOS_EXECUTABLE ? [] : [root];
    const child = spawn(executable, [...args, '--remote-debugging-port=0', `--user-data-dir=${profile}`], {
        env: {...process.env, PHYSMOS_TEST: '1'}
    });
    let output = '';
    let launchError;
    child.on('error', (error) => { launchError = error; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    let socket;
    try {
        let port;
        for (let i = 0; i < 150; i++) {
            if (launchError) throw launchError;
            port = output.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/)?.[1];
            if (port) break;
            await delay(100);
        }
        assert.ok(port, output);
        let targets;
        for (let i = 0; i < 100; i++) {
            targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
            if (targets.some((target) => target.url.endsWith('/app/index.html'))) break;
            await delay(100);
        }
        const target = targets.find((entry) => entry.url.endsWith('/app/index.html'));
        assert.ok(target, 'Main app window exists');
        socket = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((resolve) => socket.addEventListener('open', resolve, {once: true}));
        let nextId = 0;
        const pending = new Map();
        const errors = [];
        socket.addEventListener('message', ({data}) => {
            const message = JSON.parse(data);
            if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
                errors.push(message.params.args.map((arg) => arg.value || arg.description));
            }
            if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
            if (pending.has(message.id)) {
                const {resolve, reject} = pending.get(message.id);
                pending.delete(message.id);
                if (message.error) reject(new Error(JSON.stringify(message.error)));
                else resolve(message.result);
            }
        });
        const send = (method, params = {}) => new Promise((resolve, reject) => {
            const id = ++nextId;
            pending.set(id, {resolve, reject});
            socket.send(JSON.stringify({id, method, params}));
        });
        const evaluate = async (expression) => {
            const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
            assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
            return result.result.value;
        };
        await send('Runtime.enable');
        await send('Network.enable');
        await send('Network.emulateNetworkConditions', {offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0});
        await send('Page.reload');
        await delay(2500);
        const customSymbols = await evaluate(`(async () => {
            const element = document.createElement('div');
            document.body.appendChild(element);
            const field = Desmos.MathQuill.MathField(element, {});
            const results = {};
            for (const name of ['hbar', 'partial', 'ell', 'varR', 'nabla', 'mathbbN']) {
                field.latex(String.fromCharCode(92) + name);
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                results[name] = {html: element.innerHTML, latex: field.latex()};
            }
            field.latex('');
            field.typedText('gamma');
            results.autoGamma = field.latex();
            field.latex('');
            field.typedText('hbar');
            results.autoHbar = field.latex();
            field.latex('');
            field.typedText('vec');
            results.autoVec = field.latex();
            element.remove();
            return results;
        })()`);
        for (const [name, glyph] of Object.entries({hbar: 'ℏ', partial: '∂', ell: 'ℓ', varR: 'ℜ', nabla: '∇', mathbbN: 'ℕ'})) {
            assert.ok(customSymbols[name].html.includes(glyph), name + ' renders correctly');
        }
        assert.ok(customSymbols.autoGamma.includes('\\gamma'));
        assert.ok(customSymbols.autoHbar.includes('\\hbar'));
        assert.ok(customSymbols.autoVec.includes('\\vec'), JSON.stringify(customSymbols.autoVec));
        for (const name of ['hbar', 'partial', 'ell', 'varR', 'nabla', 'mathbbN']) {
            assert.equal(customSymbols[name].latex, String.fromCharCode(92) + name);
        }
        const version = await evaluate('Desmos.version');
        assert.match(version, /^v?1\.13/);
        assert.equal(await evaluate('typeof window.electron.readFile'), 'function');
        assert.deepEqual(await evaluate('window.electron.getWindowSettings()'), {
            macTitleBarStyle: 'default',
            showWindowButtons: true
        });
        assert.equal(await evaluate('window.electron.setMacTitleBarStyle("hiddenInset")'), 'hiddenInset');
        const changedWindowSettings = await evaluate('window.electron.getWindowSettings()');
        assert.equal(changedWindowSettings.macTitleBarStyle, 'hiddenInset');
        assert.equal(await evaluate('window.electron.setMacTitleBarStyle("default")'), 'default');
        assert.equal(await evaluate('window.electron.setWindowButtonsVisible(false)'), false);
        assert.equal(await evaluate('window.electron.setWindowButtonsVisible(true)'), true);
        assert.equal(await evaluate('document.querySelectorAll(".dcg-calculator-api-container-v1_13").length > 0'), true);
        assert.equal(await evaluate(`(async () => {
            const pending = waitForElement('.wait-for-element-smoke');
            const element = document.createElement('div');
            element.className = 'wait-for-element-smoke';
            document.body.appendChild(element);
            const found = await pending;
            element.remove();
            return found === element;
        })()`), true);
        const pillboxStructure = await evaluate(`(() => {
            const root = document.querySelector('.dcg-right-pillbox-elements');
            const group = root.querySelector(':scope > .physmos-file-pillbox');
            const buttons = [...group.querySelectorAll('.physmos-file-button')];
            return {
                isNativeGroup: group.classList.contains('dcg-btn-flat-gray') &&
                    group.classList.contains('dcg-btn-flat-gray-group') &&
                    group.classList.contains('dcg-group-vertical') &&
                    group.classList.contains('dcg-pillbox-element'),
                buttonCount: buttons.length,
                buttonsUseNativeInterior: buttons.every((button) => button.classList.contains('dcg-pillbox-btn-interior')),
                buttonsHaveTooltipHitArea: buttons.every((button) =>
                    button.parentElement.classList.contains('dcg-tooltip-hit-area-container') &&
                    button.parentElement.classList.contains('dcg-display-block')
                )
            };
        })()`);
        assert.equal(pillboxStructure.isNativeGroup, true);
        assert.equal(pillboxStructure.buttonCount, 3);
        assert.equal(pillboxStructure.buttonsUseNativeInterior, true);
        assert.equal(pillboxStructure.buttonsHaveTooltipHitArea, true);
        await evaluate(`createSettingButton({
            icon: 'delete',
            label: 'Delete Project',
            tooltip: 'Delete Project',
            className: 'custom-file-button',
            order: 99,
            onClick: () => { window._customFileButtonClicked = true; }
        })`);
        await delay(50);
        const customButton = await evaluate(`(() => {
            const button = document.querySelector('.physmos-file-button[aria-label="Delete Project"]');
            return {
                exists: Boolean(button),
                hasCustomClass: button.classList.contains('custom-file-button'),
                isLast: button.parentElement === document.querySelector('.physmos-file-pillbox').lastElementChild
            };
        })()`);
        assert.equal(customButton.exists, true);
        assert.equal(customButton.hasCustomClass, true);
        assert.equal(customButton.isLast, true);
        await evaluate('document.querySelector(".physmos-file-button[aria-label=\\"Delete Project\\"]").click()');
        assert.equal(await evaluate('window._customFileButtonClicked === true'), true);
        await evaluate('document.querySelector(".physmos-file-button[aria-label=\\"Delete Project\\"]").parentElement.remove()');
        await evaluate(`calculator.setExpression({id: 'before-new', latex: 'y=x'});
            window._name = 'Old Graph';
            window._saved = true;
            document.querySelector('.physmos-file-button[aria-label="New Graph"]').click();`);
        await delay(100);
        assert.deepEqual(await evaluate(`({
            cleared: calculator.getExpressions().every((expression) => !expression.latex),
            name: window._name,
            saved: window._saved,
            icon: document.querySelector('.physmos-file-button[aria-label="New Graph"] i').classList.contains('dcg-icon-folder-open')
        })`), {
            cleared: true,
            name: 'Undefined',
            saved: false,
            icon: true
        });
        const saveButtonCenterForTooltip = await evaluate(`(() => {
            const button = document.querySelectorAll('.physmos-file-button')[0];
            const rect = button.getBoundingClientRect();
            return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
        })()`);
        await send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: saveButtonCenterForTooltip.x,
            y: saveButtonCenterForTooltip.y,
            button: 'none'
        });
        await delay(350);
        const fileTooltip = await evaluate(`(() => {
            const tooltip = document.querySelector('.dcg-tooltip-positioning-container');
            if (!tooltip) return null;
            const buttonRect = document.querySelectorAll('.physmos-file-button')[0].getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            return {
                text: tooltip.querySelector('.dcg-tooltip-message span')?.textContent,
                gravity: tooltip.classList.contains('dcg-tooltip-gravity-e-w'),
                theme: tooltip.classList.contains('dcg-tooltip-theme-dark'),
                arrow: Boolean(tooltip.querySelector('.dcg-tooltip-arrow.dcg-tooltip-gravity-w')),
                positionedLeft: tooltipRect.left <= buttonRect.left
            };
        })()`);
        assert.equal(fileTooltip.text, 'Save Project');
        assert.equal(fileTooltip.gravity, true);
        assert.equal(fileTooltip.theme, true);
        assert.equal(fileTooltip.arrow, true);
        assert.equal(fileTooltip.positionedLeft, true);
        await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 5, y: 5, button: 'none'});
        await delay(100);
        assert.equal(await evaluate('document.querySelector(".dcg-tooltip-positioning-container") === null'), true);
        await evaluate('document.querySelector(".physmos-file-pillbox").remove()');
        await delay(50);
        assert.equal(await evaluate(`(() => {
            const root = document.querySelector('.dcg-right-pillbox-elements');
            const group = root.querySelector(':scope > .physmos-file-pillbox');
            return Boolean(group) && group.querySelectorAll('.physmos-file-button').length === 3;
        })()`), true);
        await evaluate('calculator.setExpression({id: "smoke", latex: "y=x^2"}); calculator.setExpression({id: "point", latex: "(1,1)", pointOutline: true});');
        await delay(1000);
        assert.equal(await evaluate('Object.values(calculator.expressionAnalysis).some(value => value.isError)'), false);
        assert.match(await evaluate('calculator.screenshot({width: 120, height: 120})'), /^data:image\/png;base64,/);
        const userDataPath = await evaluate('window.electron.userDataPath');
        assert.equal(await fs.realpath(userDataPath), await fs.realpath(profile), 'Save is isolated from real user data');
        const saveButtonCenter = await evaluate(`(() => {
            const button = document.querySelectorAll('.physmos-file-button')[0];
            const rect = button.getBoundingClientRect();
            return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
        })()`);
        assert.equal(await evaluate(`(() => {
            const button = document.querySelectorAll('.physmos-file-button')[0];
            const hit = document.elementFromPoint(${saveButtonCenter.x}, ${saveButtonCenter.y});
            return hit === button || button.contains(hit);
        })()`), true);
        await send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x: saveButtonCenter.x,
            y: saveButtonCenter.y,
            button: 'left',
            clickCount: 1
        });
        await send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x: saveButtonCenter.x,
            y: saveButtonCenter.y,
            button: 'left',
            clickCount: 1
        });
        assert.equal(await evaluate('document.activeElement.id'), 'custom-prompt-input');
        await evaluate('document.querySelector(".custom-prompt-button:not(.default)").click()');
        assert.equal(await evaluate('Boolean(window._saved)'), false);
        assert.equal(await evaluate('document.querySelector(".custom-prompt-modal") === null'), true);
        await evaluate('document.querySelectorAll(".physmos-file-button")[0].click(); document.querySelector(".custom-prompt-input").value = "Upgrade smoke test"; document.querySelector(".custom-prompt-box").requestSubmit();');
        await delay(700);
        const savedPath = await evaluate('window.electron.userDataPath + "/save/" + calculator.getState().randomSeed + ".json"');
        const saved = JSON.parse(await fs.readFile(savedPath, 'utf8'));
        assert.ok(saved.expressions.list.some((entry) => entry.id === 'smoke'));
        await evaluate(`calculator.setBlank(); calculator.setState(${JSON.stringify(saved)});`);
        assert.equal(await evaluate('calculator.getExpressions().some(entry => entry.id === "smoke")'), true);
        await send('Input.dispatchKeyEvent', {type: 'keyDown', key: '1', code: 'Digit1', modifiers: 4});
        assert.equal(await evaluate('calculator.settings.graphpaper'), false);
        await send('Input.dispatchKeyEvent', {type: 'keyDown', key: '2', code: 'Digit2', modifiers: 4});
        assert.equal(await evaluate('calculator.settings.graphpaper'), true);
        assert.equal(await evaluate('document.querySelectorAll(".physmos-file-button").length'), 3);
        assert.equal(await evaluate('document.querySelector(".physmos-history-panel") === null'), true);
        await evaluate('document.querySelectorAll(".physmos-file-button")[1].click()');
        await delay(500);
        targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
        assert.equal(targets.some((entry) => entry.url.endsWith('/app/history.html')), false);
        const historyStyle = await evaluate(`(() => {
            const outer = document.querySelector('.dcg-exppanel-outer');
            const panel = outer.querySelector(':scope > .physmos-history-panel');
            const outerRect = outer.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();
            return {
                cards: panel.querySelectorAll('.history').length,
                font: getComputedStyle(panel).fontFamily,
                icon: getComputedStyle(panel.querySelector('.dcg-icon-trashcan'), ':before').content,
                fillsOuter: Math.abs(outerRect.left - panelRect.left) < 1 &&
                    Math.abs(outerRect.top - panelRect.top) < 1 &&
                    Math.abs(outerRect.right - panelRect.right) < 1 &&
                    Math.abs(outerRect.bottom - panelRect.bottom) < 1,
                hasCloseButton: Boolean(panel.querySelector('.history-close')),
                closeIconOffset: (() => {
                    const buttonRect = panel.querySelector('.history-close').getBoundingClientRect();
                    const iconRect = panel.querySelector('.history-close i').getBoundingClientRect();
                    return {
                        x: (iconRect.left + iconRect.width / 2) -
                            (buttonRect.left + buttonRect.width / 2),
                        y: (iconRect.top + iconRect.height / 2) -
                            (buttonRect.top + buttonRect.height / 2)
                    };
                })()
            };
        })()`);
        assert.equal(historyStyle.cards, 1);
        assert.match(historyStyle.font, /Arial/);
        assert.ok(historyStyle.icon && historyStyle.icon !== 'none');
        assert.equal(historyStyle.fillsOuter, true);
        assert.equal(historyStyle.hasCloseButton, true);
        assert.ok(Math.abs(historyStyle.closeIconOffset.x + 1) < 1);
        assert.ok(Math.abs(historyStyle.closeIconOffset.y) < 1);
        await send('Input.dispatchKeyEvent', {type: 'keyDown', key: 'o', code: 'KeyO', modifiers: 4});
        await delay(100);
        assert.equal(await evaluate('document.querySelector(".physmos-history-panel") === null'), true);
        await evaluate('document.querySelectorAll(".physmos-file-button")[1].click()');
        await delay(500);
        assert.equal(await evaluate('Boolean(document.querySelector(".physmos-history-panel"))'), true);
        await evaluate('document.querySelector(".physmos-history-panel .history-close").click()');
        await delay(100);
        assert.equal(await evaluate('document.querySelector(".physmos-history-panel") === null'), true);
        assert.equal(await evaluate(`(() => {
            const icon = document.querySelector('.physmos-file-button[aria-label="Open Project"] > i');
            return icon.classList.contains(window.physmosIcons.open.className) &&
                getComputedStyle(icon, ':before').content !== 'none';
        })()`), true);
        assert.deepEqual(errors, []);
        console.log(`Verified ${version}: offline render, graph, screenshot, file save/restore, view shortcuts, embedded history panel.`);
    } finally {
        if (socket) socket.close();
        if (child.pid && child.exitCode === null) {
            const exited = new Promise((resolve) => child.once('exit', resolve));
            child.kill();
            await exited;
        }
        await fs.rm(profile, {recursive: true, force: true});
    }
});
