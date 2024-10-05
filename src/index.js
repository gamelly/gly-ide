import wasmFile from 'wasmoon/dist/glue.wasm';
import { LuaFactory, LuaMultiReturn } from 'wasmoon'
import { editor, KeyMod, KeyCode } from 'monaco-editor'
import gly from '@gamely/core-native-html5'
import gly_engine from '@gamely/gly-engine/dist/main.lua'
import defaultScript from './default.lua'

document.addEventListener('DOMContentLoaded', async () => {
    const elementEditor = document.querySelector('#editor')
    const monacoEditor = editor.create(elementEditor, {
        language: 'lua',
        theme: 'vs-dark',
        automaticLayout: true,
        fontLigatures: true,
        fontFamily: 'Cascadia Code'
    });

    monacoEditor.setValue(defaultScript)
    
    const factory = new LuaFactory(wasmFile)
    const lua = await factory.createEngine()
    await lua.doString(gly_engine)

    gly.global.set('native_callback_init', lua.global.get('native_callback_init'))
    gly.global.set('native_callback_loop', lua.global.get('native_callback_loop'))
    gly.global.set('native_callback_draw', lua.global.get('native_callback_draw'))
    gly.global.set('native_callback_resize', lua.global.get('native_callback_resize'))
    gly.global.set('native_callback_keyboard', lua.global.get('native_callback_keyboard'))
    lua.global.set('native_draw_start', gly.global.get('native_draw_start'))
    lua.global.set('native_draw_flush', gly.global.get('native_draw_flush'))
    lua.global.set('native_draw_clear', gly.global.get('native_draw_clear'))
    lua.global.set('native_draw_color', gly.global.get('native_draw_color'))
    lua.global.set('native_draw_font', gly.global.get('native_draw_font'))
    lua.global.set('native_draw_rect', gly.global.get('native_draw_rect'))
    lua.global.set('native_draw_line', gly.global.get('native_draw_line'))
    lua.global.set('native_draw_image', gly.global.get('native_draw_image'))
    lua.global.set('native_dict_http', gly.global.get('native_dict_http'))
    lua.global.set('native_dict_json', gly.global.get('native_dict_json'))
    lua.global.set('native_dict_poly', gly.global.get('native_dict_poly'))
    lua.global.set('native_draw_text', (x, y, text) => {
        const native_draw_text = gly.global.get('native_draw_text')
        return LuaMultiReturn.from(native_draw_text(x, y, text))
    })

    gly.error('stop, canvas, console')
    gly.init('#gameCanvas')

    gly.load(defaultScript)

    monacoEditor.addAction({
        id: 'run-game',
        label: 'running game',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyE],
        run: () => {
            gly.load(monacoEditor.getValue())
        }
    })

    const keys = [
        [403, 'red'],
        [404, 'green'],
        [405, 'yellow'],
        [406, 'blue'],
        ['KeyZ', 'red'],
        ['KeyX', 'green'],
        ['KeyC', 'yellow'],
        ['KeyV', 'blue'],
        ['Enter', 'enter'],
        ['ArrowUp', 'up'],
        ['ArrowDown', 'down'],
        ['ArrowLeft', 'left'],
        ['ArrowRight', 'right'],
    ];

    function updateSize() {
        gly.resize()
    }

    function updateKey(ev) {
        const key = keys.find(key => key[0] == ev.code)
        if (key) {
            gly.input(key[1], Number(ev.type === 'keydown'))
        }
    }

    function updateLoop() {
        window.requestAnimationFrame(updateLoop);
        gly.update((new Date()).getTime())
    }

    window.addEventListener("resize", updateSize);
    window.addEventListener('keydown', updateKey)
    window.addEventListener('keyup', updateKey)
    window.requestAnimationFrame(updateLoop);
})
