/*async () => {
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
    await downloadGame(vscode.ide().getValue(), device.template)
    elBtnExport.disabled = false;
}
*/