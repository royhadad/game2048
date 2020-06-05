export default (value) => {
    switch (value) {
        case 2:
            return '#F1E3DC';
        case 4:
            return '#F2DEC8';
        case 8:
            return '#FCB377';
        case 16:
            return '#F59563';
        case 32:
            return '#F57C5F';
        case 64:
            return '#F65D3B';
        case 128:
            return '#F3CB71';
        case 256:
            return '#EDCC61';
        case 512:
            return '#CCA243';
        case 1024:
            return '#CEA133';
        case 2048:
            return '#E1AC25';
        case 4096:
            return '#F3CB71';
        case 8192:
            return '#FC5C59';
        case 16384:
            return '#F15039';
        case 32768:
            return '#6CAEDB';
        case 65536:
            return '#589CE6';
        case 131072:
            return '#005FA1';
        default:
            alert('ERROR! couldnt get the tile background color');
    }
}