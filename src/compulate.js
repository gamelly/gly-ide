export default function(devices)
{
    const select = document.querySelector('#preset-resolutions');
    devices.forEach(device => {
    const option = document.createElement('option');
        option.value = `${device.width},${device.height}`;
        option.textContent = `${device.short.toUpperCase()} (${device.width}x${device.height})`;
        select.appendChild(option);
    });
}
