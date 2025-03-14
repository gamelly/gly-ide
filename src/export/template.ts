function hbytes(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export default async function (content, platform)
{
    const templatePrefix = '--GLYSTART ';

    console.log(`fetching template: ${platform}`)
    const response = await fetch(`https://get.gamely.com.br/${platform}`);
    if (!response.ok) {
        throw new Error(`[network error] failed to retrived ${response.statusText}\n${platform}`);
    }

    const srcBuffer = await response.arrayBuffer();
    const srcContent = new Uint8Array(srcBuffer);
    const templateBytes = new TextEncoder().encode(templatePrefix);
    const templateBytesTotal = srcContent.length
    let start = -1;

    for (let i = 0; i <= srcContent.length - templateBytes.length; i++) {
        if (srcContent.subarray(i, i + templateBytes.length).every((byte, index) => byte === templateBytes[index])) {
            start = i;
            break;
        }
    }

    if (start === -1) {
        throw new Error('[IDE problem] file is not template, please report issue!');
    }

    const sizeStart = start + templateBytes.length;
    let sizeEnd = sizeStart;
    while (sizeEnd < srcContent.length && srcContent[sizeEnd] >= 48 && srcContent[sizeEnd] <= 57) { // ASCII de '0'-'9'
        sizeEnd++;
    }
    const size = parseInt(new TextDecoder().decode(srcContent.subarray(sizeStart, sizeEnd)), 10);

    if (isNaN(size)) {
        throw new Error('[IDE problem] invalid template size, please report issue!');
    }

    const final = start + size;
    const templateSize = final - start;
    const percentageRom = Math.floor((content.length/templateSize)*100)

    if (templateSize < content.length) {
        throw new Error(`[user error] Maximum size allowed: ${templateSize} bytes.`);
    }

    const paddingSize = templateSize - content.length;
    const padding = new Uint8Array(paddingSize).fill(10);
    const encodedContent = new TextEncoder().encode(content);
    const outputContent = new Uint8Array(srcContent.length - (final - start) + encodedContent.length + paddingSize);

    outputContent.set(srcContent.subarray(0, start), 0);
    outputContent.set(encodedContent, start);
    outputContent.set(padding, start + encodedContent.length);
    outputContent.set(srcContent.subarray(final), start + encodedContent.length + paddingSize);

    if (outputContent.length != templateBytesTotal) {
        throw new Error('[browser error] rom is corrupted');
    }

    console.log(`rom usage: ${percentageRom}% (${content.length} bytes of ${hbytes(templateSize)})`);

    return outputContent
}
