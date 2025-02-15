const splitter = document.querySelector('.splitter');
const preview = document.querySelector('.preview-container');
const editorContainer = document.querySelector('.editor-container');
const collapseBtn = document.getElementById('btn-collapse');
const collapseEditorBtn = document.getElementById('btn-collapse-editor');
const layoutSelector = document.getElementById('sel-layout');
const mainContainer = document.querySelector('main');

let isResizing = false;

function togglePanels(collapseEditor = false) {
    if (collapseEditor) {
        editorContainer.classList.add('editor-collapsed');
        preview.classList.remove('preview-collapsed');
        preview.style.width = 'calc(100% - 32px)';
        editorContainer.style.width = '32px';
    } else {
        preview.classList.add('preview-collapsed');
        editorContainer.classList.remove('editor-collapsed');
        editorContainer.style.width = 'calc(100% - 32px)';
        preview.style.width = '32px';
    }
}

function resetToDefault() {
    editorContainer.classList.remove('editor-collapsed');
    preview.classList.remove('preview-collapsed');
    editorContainer.style.width = '50%';
    preview.style.width = '50%';
}

function applyLayout(layoutName) {
    // esse codigo que o cria fez buga o texto
    //mainContainer.className = layoutName;

    if (layoutSelector.value != layoutName) {
        layoutSelector.value = layoutName
    }

    switch (layoutName) {
        case 'layout-game':
            togglePanels(true);
            break;
        case 'layout-editor':
            togglePanels(false);
            break;
        case 'layout-default':
            resetToDefault();
            break;
    }
}

function handleMouseMove(e) {
    if (!isResizing) return;
    const containerWidth = document.querySelector('.panel-container').offsetWidth;
    const newPreviewWidth = containerWidth - e.clientX;
    const newEditorWidth = e.clientX;

    if (newPreviewWidth >= 32 && newEditorWidth >= 32) {
        preview.style.width = `${newPreviewWidth}px`;
        editorContainer.style.width = `${newEditorWidth}px`;
    }
}

splitter.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    }, { once: true });
});

collapseBtn.addEventListener('click', () => {
    applyLayout(preview.classList.contains('preview-collapsed')? 'layout-default': 'layout-editor');
});

collapseEditorBtn.addEventListener('click', () => {
    applyLayout(editorContainer.classList.contains('editor-collapsed')? 'layout-default': 'layout-game');
});

layoutSelector.addEventListener('change', (e) => {
    applyLayout(e.target.value);
});

const output = document.getElementById('output');

function getTimestamp() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

document.getElementById('preset-resolutions').addEventListener('change', (e) => {
    if (e.target.value) {
        const [width, height] = e.target.value.split(',');
        document.getElementById('width-input').value = width;
        document.getElementById('height-input').value = height;
    }
});

const originalLog = console.log;
console.log = function (...args) {
    const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    output.insertAdjacentHTML('beforeend', `
        <div class="log-message">
            <span class="log-timestamp">[${getTimestamp()}]</span>
            ${message}
        </div>
    `);
    output.scrollTop = output.scrollHeight;
    originalLog.apply(console, args);
};

document.getElementById('fps-preset').addEventListener('change', (e) => {
    const customWrapper = document.getElementById('custom-dt-wrapper');
    const dtInput = document.getElementById('deltatime-input');

    if (e.target.value === 'auto') {
        customWrapper.style.display = 'none';
    } else {
        customWrapper.style.display = 'flex';
        if (e.target.value !== 'custom') {
            dtInput.value = e.target.value;
        }
    }
});

const originalError = console.error;
console.error = function (...args) {
    const timestamp = getTimestamp();
    let errorMessage = '';
    let stackTrace = '';

    const message = args.map(arg => {
        if (arg instanceof Error) {
            stackTrace = arg.stack || '';
            return arg.message || arg.toString();
        }
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        }
        return String(arg);
    }).join(' ');

    errorMessage = message.replace(/^(Error:\s*)+/i, 'Error: ');

    output.insertAdjacentHTML('beforeend', `
        <div class="error-message">
            <span class="log-timestamp">[${timestamp}]</span>
            ${errorMessage}
        </div>
        ${stackTrace ? `<div class="stack-trace">${stackTrace}</div>` : ''}
    `);

    output.scrollTop = output.scrollHeight;
    originalError.apply(console, args);
};
let isResizingConsole = false;
const consoleContainer = document.querySelector('.console-container');
const outputHeader = document.getElementById('output-header');

outputHeader.addEventListener('mousedown', (e) => {
    isResizingConsole = true;
    document.addEventListener('mousemove', handleConsoleResize);
    document.addEventListener('mouseup', stopConsoleResize);
});

function handleConsoleResize(e) {
    if (!isResizingConsole) return;

    const previewContent = document.querySelector('.preview-content');
    const maxHeight = previewContent.offsetHeight * 0.8;
    const containerHeight = previewContent.offsetHeight - e.clientY + previewContent.offsetTop;

    if (containerHeight >= 120 && containerHeight <= maxHeight) {
        consoleContainer.style.height = `${containerHeight}px`;
    }
}

function stopConsoleResize() {
    isResizingConsole = false;
    document.removeEventListener('mousemove', handleConsoleResize);
}

document.getElementById('output-clear').addEventListener('click', () => {
    output.innerHTML = '';
});

applyLayout('layout-default');