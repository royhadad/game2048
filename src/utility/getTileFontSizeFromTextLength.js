export default (textLength1, boardElement) => {
    const baseSize = boardElement.getBoundingClientRect().width / 9;

    const getFontSizeFactor = (textLength2) => {
        if (textLength2 === 4) {
            return 0.68;
        } else if (textLength2 === 5) {
            return 0.62;
        } else if (textLength2 === 6) {
            return 0.54;
        } else {
            return 1;
        }
    }

    const fontSizeFactor = getFontSizeFactor(textLength1);
    return `${fontSizeFactor * baseSize}px`;

}