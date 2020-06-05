export default (textLength) => {
    if (textLength === 4) {
        return '2.4vw';
    } else if (textLength === 5) {
        return '2.2vw';
    } else if (textLength === 6) {
        return '1.9vw';
    } else {
        return '3.5vw';
    }
}