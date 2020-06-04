export default () => {
    Array.from(document.querySelectorAll('.game-board')).forEach(board => {
        console.log('found one!');
        board.style.height = getComputedStyle(board).width;
    })
}