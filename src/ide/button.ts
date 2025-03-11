import { Device } from "./device";
import { VsCode } from "./vscode";

export class Button {
    private el_btn_export = document.querySelector('#btn-export') as HTMLElement
    private handler_download = async (src: string, toolchain: string, options: Record<string, string>) => {}
    
    constructor (device: Device, vscode: VsCode) {
        this.el_btn_export.addEventListener('click', async () => {
            const code = vscode.editor().getValue()
            const device_name = device.getName()
            const device_toolchain = device.getToolchain()
            const device_options = {
                fps: device.getFPS().toString()
            }

            if (!device_toolchain.length) {
                return console.error(`${device_name} build is comming soon!`)
            }

            await this.handler_download(code, device_toolchain, device_options)
        })
    }

    public bindDownload(func: typeof this.handler_download) {
        this.handler_download = func
    }
}
