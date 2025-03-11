import { Layout } from './layout'
import { VsCode } from './vscode'
import { Device } from './device'
import { Button } from './button'
import { Console } from './console'

export class Ide {
    public readonly layout = new Layout
    public readonly device = new Device
    public readonly vscode = new VsCode
    public readonly console = new Console
    public readonly button = new Button(this.device, this.vscode)
}
