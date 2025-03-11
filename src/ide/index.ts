import { Layout } from './layout'
import { VsCode } from './vscode'
import { Device } from './device'
import { Console } from './console'

export class Ide {
    private layout_manager: Layout
    private device_manager: Device
    private vscode_manager: VsCode
    private console_manager: Console

    constructor() {
        this.layout_manager = new Layout
        this.device_manager = new Device
        this.vscode_manager = new VsCode
        this.console_manager = new Console
        this.layout_manager.applyLayout('layout-default')
    }

    public device() {
        return this.device_manager
    }

    public console(): Console {
        return this.console_manager
    }
    
    public vscode(): VsCode {
        return this.vscode_manager
    }
}
