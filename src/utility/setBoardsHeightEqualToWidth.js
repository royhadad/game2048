export default () => {
    Array.from(document.querySelectorAll('.game-board')).forEach(board => {
        board.style.height = getComputedStyle(board).width;
    })
    //TODO maybe use ref instead of selecting all boards
}