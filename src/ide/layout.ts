export class Layout {
    private splitter = document.querySelector('.splitter') as HTMLElement
    private preview = document.querySelector('.preview-container') as HTMLElement
    private editorContainer = document.querySelector('.editor-container') as HTMLElement
    private collapseBtn = document.getElementById('btn-collapse') as HTMLElement
    private collapseEditorBtn = document.getElementById('btn-collapse-editor') as HTMLElement
    private layoutSelector = document.getElementById('sel-layout') as HTMLSelectElement
    private elPainelContainer = document.querySelector('.panel-container') as HTMLElement
    private consoleContainer = document.querySelector('.console-container') as HTMLElement
    private outputHeader = document.getElementById('output-header') as HTMLElement
    private previewContent = document.querySelector('.preview-content') as HTMLSelectElement
    private isResizing = false
    private isResizingConsole = false

    constructor () {
        this.outputHeader.addEventListener('mousedown', (e) => {
            this.isResizingConsole = true;
            document.addEventListener('mousemove', (e) => this.handleConsoleResize(e))
            document.addEventListener('mouseup', (e) => this.stopConsoleResize(e))
        })

        this.splitter.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e))
            document.addEventListener('mouseup', () => {
                this.isResizing = false;
                document.removeEventListener('mousemove', (e) => this.handleMouseMove(e))
            }, { once: true })
        })

        this.collapseBtn.addEventListener('click', () => {
            const layout = this.preview.classList.contains('preview-collapsed')? 'layout-default': 'layout-editor'
            this.applyLayout(layout)
        })

        this.collapseEditorBtn.addEventListener('click', () => {
            const layout = this.editorContainer.classList.contains('editor-collapsed')? 'layout-default': 'layout-game'
            this.applyLayout(layout)
        })

        this.layoutSelector.addEventListener('change', (e) => {
            this.applyLayout(this.layoutSelector.value);
        })
    }

    private togglePanels(collapseEditor = false) {
        if (collapseEditor) {
            this.editorContainer.classList.add('editor-collapsed')
            this.preview.classList.remove('preview-collapsed')
            this.preview.style.width = 'calc(100% - 32px)'
            this.editorContainer.style.width = '32px'
        } else {
            this.preview.classList.add('preview-collapsed')
            this.editorContainer.classList.remove('editor-collapsed')
            this.editorContainer.style.width = 'calc(100% - 32px)'
            this.preview.style.width = '32px'
        }
    }
    
    private resetToDefault() {
        this.editorContainer.classList.remove('editor-collapsed')
        this.preview.classList.remove('preview-collapsed')
        this.editorContainer.style.width = '50%'
        this.preview.style.width = '50%'
    }
    
    public applyLayout(layoutName) {
        // esse codigo que o cria fez buga o texto
        //mainContainer.className = layoutName;
        if (this.layoutSelector.value != layoutName) {
            this.layoutSelector.value = layoutName
        }
    
        switch (layoutName) {
            case 'layout-game':
                this.togglePanels(true);
                break;
            case 'layout-editor':
                this.togglePanels(false);
                break;
            case 'layout-default':
                this.resetToDefault();
                break;
        }
    }
    
    private handleMouseMove(e) {
        if (!this.isResizing) return;
        const containerWidth = this.elPainelContainer.offsetWidth;
        const newPreviewWidth = containerWidth - e.clientX;
        const newEditorWidth = e.clientX;
    
        if (newPreviewWidth >= 32 && newEditorWidth >= 32) {
            this.preview.style.width = `${newPreviewWidth}px`;
            this.editorContainer.style.width = `${newEditorWidth}px`;
        }
    }
    
    private handleConsoleResize(e) {
        if (!this.isResizingConsole) return;
        
        const maxHeight = this.previewContent.offsetHeight * 0.8;
        const containerHeight = this.previewContent.offsetHeight - e.clientY + this.previewContent.offsetTop;
    
        if (containerHeight >= 120 && containerHeight <= maxHeight) {
            this.consoleContainer.style.height = `${containerHeight}px`;
        }
    }
    
    private stopConsoleResize() {
        this.isResizingConsole = false;
        document.removeEventListener('mousemove', this.handleConsoleResize);
    }
}
