import engine_lite from '@gamely/gly-engine-lite' assert {type: 'text'}
import lua2tic from '@gamely/lua2tic'
import gly2bin from './template'

export default async function (src: string, toolchain: string, options: Record<string, string>) {
    const el_btn_export = document.querySelector("#btn-export") as HTMLInputElement
    const [exporter, template] =  toolchain.split(':')
    const base = (template ?? '').replace('{fps}', options.fps)

    function mutex_start() {
        if (el_btn_export.disabled) {
            return false;
        }
        el_btn_export.disabled = true
        return true;
    }
   
    function mutex_free() {
        el_btn_export.disabled = false
    }

    const ext = base.split('.').pop() ?? ''
    const uptime = (new Date()).toISOString().slice(2, 10).replace(/-/g, '-');
    const hash7 = await (async () => {
        const hashBuffer = await crypto.subtle.digest("SHA-1", (new TextEncoder()).encode(src).buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.slice(0, 7);
    })()

    function download(content: Uint8Array, name: string) {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        console.log(`downloading: ${name}`);
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    const builders = {
        template: async () => download(await gly2bin(src, base), `game-${uptime}-${hash7}.${ext}`),
        lua2tic: async () => download(lua2tic(engine_lite, src), `game-${uptime}-${hash7}.tic`),
        code: async() => download(new TextEncoder().encode(src), `game-${uptime}-${hash7}.lua`)
    }

    if (!mutex_start()) {
        return console.error(`building already in progress!`);
    }

    try {
        await builders[exporter]()
    } catch(e) {
        console.error(e)
    }

    mutex_free()
}
