export default async function (content, platform)
{
    const templatePrefix = '--GLYSTART ';

    try {
        const response = await fetch(`https://get.gamely.com.br/${platform}`);
        if (!response.ok) {
            throw new Error(`failed to retrived ${response.statusText}\n${platform}`);
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
            throw new Error('file is not template');
        }

        const sizeStart = start + templateBytes.length;
        let sizeEnd = sizeStart;
        while (sizeEnd < srcContent.length && srcContent[sizeEnd] >= 48 && srcContent[sizeEnd] <= 57) { // ASCII de '0'-'9'
            sizeEnd++;
        }
        const size = parseInt(new TextDecoder().decode(srcContent.subarray(sizeStart, sizeEnd)), 10);

        if (isNaN(size)) {
            throw new Error('invalid template size');
        }

        const final = start + size;
        const templateSize = final - start;

        if (templateSize < content.length) {
            throw new Error(`Maximum size allowed: ${templateSize} bytes.`);
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

        const uptime = (new Date()).toISOString().slice(2, 16).replace(/[-T:]/g, '').replace(/^(\d{6})(\d{4})$/, '$1-$2')
        const ext = platform.split('.').pop();
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-${uptime}.${ext}`;
        document.body.appendChild(a);
        a.click();
        console.log(`downloading... ${a.download}`);

        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Export error:', error.message);
    }
}
