export class Console {
    private old_console_log: typeof console.log
    private old_console_err: typeof console.log
    private el_console = document.querySelector('#output') as HTMLElement

    private timestamp() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }
    
    constructor() {
        const btn_console_clear = document.querySelector('#output-clear') as HTMLElement
        this.old_console_log = console.log
        this.old_console_err = console.error 
        
        btn_console_clear.addEventListener('click', () => this.clear())

        console.log = (...args) => this.log(...args)
        console.error = (...args) => this.error(...args)
        window.addEventListener('unhandledrejection', (event) => this.error(event.reason))
        window.addEventListener('error', (event) => this.error(event.error))
    }

    public log(...args)  {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
        this.el_console.insertAdjacentHTML('beforeend', `
            <div class="log-message">
                <span class="log-timestamp">[${this.timestamp()}]</span>
                ${message}
            </div>
        `);
        this.el_console.scrollTop = this.el_console.scrollHeight;
        this.old_console_log.apply(console, args);
    }

    public error(...args) {
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
        this.el_console.insertAdjacentHTML('beforeend', `
            <div class="error-message">
                <span class="log-timestamp">[${this.timestamp()}]</span>
                ${errorMessage}
            </div>
            ${stackTrace ? `<div class="stack-trace">${stackTrace}</div>` : ''}
        `);

        this.el_console.scrollTop = this.el_console.scrollHeight;
        this.old_console_err.apply(console, args);
    }

    public clear() {
        this.el_console.innerHTML = ''
    }
}
