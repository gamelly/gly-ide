import wasmFile from 'wasmoon/dist/glue.wasm';
import { LuaFactory, LuaMultiReturn } from 'wasmoon'
import { editor, KeyMod, KeyCode, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import gly from '@gamely/core-native-html5'
import gly_engine from '@gamely/gly-engine/dist/main.lua' with { type: "text" }
import defaultScript from './default.lua' with { type: "text" }
import devices from '../devices.json'
import applyLayout from './ui.js'
import downloadGame from './export.js'
import compulate from './compulate.js'

import 'monaco-editor/esm/vs/basic-languages/javascript/javascript'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript'
import * as lualang from 'monaco-editor/esm/vs/basic-languages/lua/lua'

compulate(devices)
applyLayout('layout-default');
let monacoTimeout;

document.addEventListener('DOMContentLoaded', async () => {
    const elMain = document.querySelector('main')
    const elMonacoEditor = document.querySelector('#editor')
    const elOutput = document.querySelector('#output')
    const elBtnPlay = document.querySelector('#btn-play')
    const elBtnExport = document.querySelector('#btn-export')
    const elChkHotReload = document.querySelector('#chk-hot-reload')
    const elSelLayout = document.querySelector('#sel-layout')

    languages.register({ id: 'lua' })
    languages.setMonarchTokensProvider('lua', {
        ...lualang.language,
        tokenizer: {
          ...lualang.language.tokenizer,
          root: [...lualang.language.tokenizer.root, [/[{}\[\]();,.]/, 'delimiter']]
        }
    })
    languages.setLanguageConfiguration('lua', lualang.conf)
    const monacoEditor = editor.create(elMonacoEditor, {
        language: 'lua',
        theme: 'vs-dark',
        automaticLayout: true,
        fontLigatures: true,
        fontFamily: 'Cascadia Code'
    });

    monacoEditor.setValue(defaultScript)
    
    const factory = new LuaFactory(wasmFile)
    const lua = await factory.createEngine()

    lua.global.set('native_media_position', () => {})
    lua.global.set('native_media_resize', () => {})
    lua.global.set('native_media_pause', () => {})
    lua.global.set('native_media_load', () => {})
    lua.global.set('native_media_play', () => {})    
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
    lua.global.set('native_text_print', gly.global.get('native_text_print'))
    lua.global.set('native_text_font_size', gly.global.get('native_text_font_size'))
    lua.global.set('native_text_font_name', gly.global.get('native_text_font_name'))
    lua.global.set('native_text_font_default', gly.global.get('native_text_font_default'))
    lua.global.set('native_text_font_previous', gly.global.get('native_text_font_previous'))
    lua.global.set('native_text_mensure', (x, y, text) => {
        const native_draw_text = gly.global.get('native_text_mensure')
        return LuaMultiReturn.from(native_draw_text(x, y, text))
    })

    await lua.doString(gly_engine)

    gly.global.set('native_callback_init', lua.global.get('native_callback_init'))
    gly.global.set('native_callback_loop', lua.global.get('native_callback_loop'))
    gly.global.set('native_callback_draw', lua.global.get('native_callback_draw'))
    gly.global.set('native_callback_resize', lua.global.get('native_callback_resize'))
    gly.global.set('native_callback_keyboard', lua.global.get('native_callback_keyboard'))

    gly.error('silent', (e) => {
        elOutput.innerHTML = `${e}<br/>${elOutput.innerHTML}`
        gly.pause()
    })
    gly.init('#gameCanvas')

    gly.load(defaultScript)
    const apply = () => {
        clearTimeout(monacoTimeout)
        gly.resume()
        gly.load(monacoEditor.getValue())
    }

    monacoEditor.addAction({
        id: 'run-game',
        label: 'running game',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyE],
        run: apply
    })

    elSelLayout.addEventListener('change', () => {
        Array.from(elMain.classList)
            .filter(className => className.startsWith('layout-'))
            .forEach(className => elMain.classList.remove(className))
        elMain.classList.add(elSelLayout.value)
    });

    elBtnPlay.addEventListener('click', apply)

    monacoEditor.onDidChangeModelContent(() => {
        clearTimeout(monacoTimeout);
        monacoTimeout = setTimeout(() => {
            if (elChkHotReload.checked) {
                apply()
            }
        }, 3000);
    });
    
    elBtnExport.addEventListener('click', async () => {
        const select = document.querySelector('#preset-resolutions');
        const option = select.querySelector(`option[value="${select.value}"]`)
        const device_name = option.textContent.split(' ')[0]
        const device = devices.find((device) => device.short.toLowerCase() == device_name.toLowerCase())

        if (!device) {
            return console.error(`device not found: ${device_name}`)
        }

        if (!device.template) {
            return console.error(`${device.name} build is comming soon!`)
        }

        if (elBtnExport.disabled) {
            return console.warn(`building already in progress!`);
        }

        elBtnExport.disabled = true;
        await downloadGame(monacoEditor.getValue(), device.template)
        elBtnExport.disabled = false;
    });

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
        gly.update_uptime(performance.now());
    }

    window.addEventListener("resize", updateSize);
    window.addEventListener('keydown', updateKey)
    window.addEventListener('keyup', updateKey)
    window.requestAnimationFrame(updateLoop);
})
