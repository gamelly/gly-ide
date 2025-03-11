import { Ide } from './ide'
import EngineBootstrap from './engine'
import example from './default.lua' assert { type: 'text' }

document.addEventListener('DOMContentLoaded', async () => {
    const ide = new Ide()
    const {width, height} = ide.device().getResolution()
    const engine = await EngineBootstrap(width, height, example)
    
    ide.vscode().editor().setValue(example)
    ide.vscode().bindUpdate(engine.changeGame)
    ide.device().bindResize(engine.resize)

    window.engine = engine
    window.ide = ide
})
