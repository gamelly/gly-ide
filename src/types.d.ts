declare module "*.lua" {
    const content: string;
    export default content;
}

interface Window {
    ide: unknown,
    engine: unknown
}

declare module 'wasmoon/dist/glue.wasm' {
    const content: string;
    export default content;
}

declare module '@gamely/lua2tic' {
    const content: (engine: string, game: string) => Uint8Array
    export default content
}

declare module '@gamely/gly-engine' {
    const content: string;
    export default content;
}

declare module '@gamely/gly-engine-lite' {
    const content: string;
    export default content;
}
