import wasmFile from 'wasmoon/dist/glue.wasm';
import { LuaFactory, LuaMultiReturn } from 'wasmoon'
import { editor, KeyMod, KeyCode } from 'monaco-editor'
import gly from '@gamely/core-native-html5'
import gly_engine from '@gamely/gly-engine/dist/main.lua'
import defaultScript from './default.lua'

let monacoTimeout;

document.addEventListener('DOMContentLoaded', async () => {
    const elMain = document.querySelector('main')
    const elMonacoEditor = document.querySelector('#editor')
    const elOutput = document.querySelector('#output')
    const elBtnPlay = document.querySelector('#btn-play')
    const elBtnExport = document.querySelector('#btn-export')
    const elChkHotReload = document.querySelector('#chk-hot-reload')
    const elSelLayout = document.querySelector('#sel-layout')

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
        if (elBtnExport.disabled) {
            return;
        }
    
        elBtnExport.disabled = true;
    
        const templatePrefix = '--GLYSTART ';
        const content = monacoEditor.getValue();
    
        try {
            const response = await fetch('https://get.gamely.com.br/game.gba');
            if (!response.ok) {
                throw new Error(`Erro ao buscar o arquivo de origem: ${response.statusText}`);
            }
    
            const srcBuffer = await response.arrayBuffer();
            const srcContent = new Uint8Array(srcBuffer);
            const templateBytes = new TextEncoder().encode(templatePrefix);
            let start = -1;
    
            for (let i = 0; i <= srcContent.length - templateBytes.length; i++) {
                if (srcContent.subarray(i, i + templateBytes.length).every((byte, index) => byte === templateBytes[index])) {
                    start = i;
                    break;
                }
            }
    
            if (start === -1) {
                throw new Error('Template não encontrado!');
            }
    
            const sizeStart = start + templateBytes.length;
            let sizeEnd = sizeStart;
            while (sizeEnd < srcContent.length && srcContent[sizeEnd] >= 48 && srcContent[sizeEnd] <= 57) { // ASCII de '0'-'9'
                sizeEnd++;
            }
            const size = parseInt(new TextDecoder().decode(srcContent.subarray(sizeStart, sizeEnd)), 10);
    
            if (isNaN(size)) {
                throw new Error('Tamanho do template inválido!');
            }
    
            const final = start + size;
            const templateSize = final - start;
    
            if (templateSize < content.length) {
                throw new Error(`Tamanho máximo permitido: ${templateSize} bytes.`);
            }
    
            const paddingSize = templateSize - content.length;
            const padding = new Uint8Array(paddingSize).fill(10);
            const encodedContent = new TextEncoder().encode(content);
            const outputContent = new Uint8Array(srcContent.length - (final - start) + encodedContent.length + paddingSize);
    
            outputContent.set(srcContent.subarray(0, start), 0);
            outputContent.set(encodedContent, start);
            outputContent.set(padding, start + encodedContent.length);
            outputContent.set(srcContent.subarray(final), start + encodedContent.length + paddingSize);
    
            console.log('Final size:', outputContent.length);
    
            const blob = new Blob([outputContent], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
    
            const a = document.createElement('a');
            a.href = url;
            a.download = 'game.gba';
            document.body.appendChild(a);
            a.click();
    
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error.message);
        } finally {
            elBtnExport.disabled = false;
        }
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
