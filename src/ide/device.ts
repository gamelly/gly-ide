import devices from '../../devices.json'

export class Device {
    private el_sel_fps = document.querySelector('#fps-preset') as HTMLSelectElement
    private el_select = document.querySelector('#preset-resolutions') as HTMLSelectElement
    private el_width = document.querySelector('#width-input') as HTMLInputElement
    private el_height =  document.querySelector('#height-input') as HTMLInputElement
    private handler_resize = () => {}

    private getDevice() {
        const index = parseInt(this.el_select.value)
        return devices[index]
    }

    private compulate_device_list() {
        devices.forEach((device, index) => {
            const option = document.createElement('option')
            option.value = `${index}`
            option.textContent = `${device.short.toUpperCase()} (${device.width}x${device.height})`
            this.el_select.appendChild(option)
        });
    }

    private compulate_fps_list() {
        const notfixed = ['Custom...', 'Auto']
        const fps_list = this.getDevice().fps
        this.el_sel_fps.options.length = 0
        this.el_sel_fps.disabled = fps_list.length <= 1
        fps_list.forEach((fps) => {
            const option = document.createElement('option')
            option.value = `${fps}`
            option.textContent = fps < 0? `${notfixed[2 + fps]}`: `${fps} FPS (${((1/fps)*1000).toFixed(2)} ms)`
            this.el_sel_fps.appendChild(option)            
        });
        this.change_fps()
    }

    private change_device() {
        const device = this.getDevice()
        const disabled = !device?.unlock
        const {width, height} = device
        this.el_width.value = `${width}`
        this.el_height.value = `${height}`
        this.el_width.disabled = disabled
        this.el_height.disabled = disabled
        this.compulate_fps_list()
    }

    private change_fps() {
        const dtchange = document.querySelector("#dtchange") as HTMLElement
        const dtinput = document.querySelector("#deltatime-input") as HTMLInputElement
        const fps = parseInt(this.el_sel_fps.value)
        dtchange.style.display = fps === -2 ? 'flex': 'none'
        dtinput.value = fps <= 0? `16`: fps.toFixed(0)        
    }

    constructor() {
        this.el_select.addEventListener('change', () => {
            this.change_device()
            this.handler_resize()
        })
        this.el_width.addEventListener('change', () => this.handler_resize())
        this.el_height.addEventListener('change', () => this.handler_resize())
        this.el_sel_fps.addEventListener('change', () => this.change_fps())
        this.compulate_device_list()
        this.change_device()
    }

    public bindResize(func: (w: number, h: number) => void) {
        this.handler_resize = () => {
            const {width, height} = this.getResolution()
            func(width, height)
        }
    }

    public getResolution() {
        const width = parseInt(this.el_width.value)
        const height = parseInt(this.el_height.value)
        return {width, height}
    }

    public getFPS() {
        const fps = parseInt(this.el_sel_fps.value)
        return fps <= 0? 60: fps
    }

    public getName() {
        return this.getDevice().name
    }

    public getToolchain() {
        const device = this.getDevice()
        const platform = device.export || (device.template && 'template') || ''
        const suffix = device.template? `:${device.template}`: ''
        return `${platform}${suffix}`
    }
}
