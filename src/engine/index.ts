import wasmFile from 'wasmoon/dist/glue.wasm';
import { LuaFactory, LuaMultiReturn } from 'wasmoon'
import gly from '@gamely/core-native-html5'
import gly_engine from '@gamely/gly-engine' with { type: "text" }

export default async function (width: number, height: number, default_game: string) {
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

    gly.init('#gameCanvas')
    gly.load(default_game)
    gly.resize(width,  height)

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

    window.addEventListener('keydown', updateKey)
    window.addEventListener('keyup', updateKey)
    window.requestAnimationFrame(updateLoop);

    return {
        resize: (width: number, height: number) => {
            gly.resize(width, height)
        },
        changeGame: (new_game:string) => {
            gly.resume()
            gly.load(new_game)
        } 
    }
}
