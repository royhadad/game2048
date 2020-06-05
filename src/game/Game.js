//import getTransitionVectorsBetweenTwoElementsTopLeft from "../utility/getTransitionVectorsBetweenTwoElementsTopLeft";
import getTileBackgroundByValue from '../utility/getTileBackgroundByValue';
import getNumberColorByValue from '../utility/getNumberColorByValue';
import { random, floor } from 'mathjs';
import getTileFontSizeFromTextLength from '../utility/getTileFontSizeFromTextLength';

class Game {
    constructor(boardElement) {
        this.boardElement = boardElement;

        //bind functions to prevent "this" problems
        this.placeAdjustAndMoveTilesToCorrectLocationOnBoard = this.placeAdjustAndMoveTilesToCorrectLocationOnBoard.bind(this);

        //prep work
        this.fetchAndSetBoardArray();

        //start a new game
        this.setInitialTilesArray();
        this.addNewTile(2);
        this.addNewTile(128);
        this.addNewTile(2048);
        this.addNewTile(2048 * 32);
        this.addNewTile(2048 * 64);

        //adjust UI
        this.placeAdjustAndMoveTilesToCorrectLocationOnBoard();

        // for (let collumn = 0; collumn < 4; collumn++) {
        //     for (let row = 0; row < 4; row++) {
        //         if (this.tilesArray[collumn][row] !== undefined) {
        //             setTimeout(() => {
        //                 this.tilesArray[0][0] = this.tilesArray[collumn][row];
        //                 this.tilesArray[collumn][row] = undefined;
        //                 this.placeAdjustAndMoveTilesToCorrectLocationOnBoard();
        //             }, 5000);
        //             return;
        //         }
        //     }
        // }
    }
    fetchAndSetBoardArray() {
        this.boardArray = new Array(4);
        for (let collumn = 0; collumn < this.boardArray.length; collumn++) {
            this.boardArray[collumn] = new Array(4);
        }
        const squaresArray = this.boardElement.querySelectorAll('.game-board__square');
        let collumn, row;
        Array.from(squaresArray).forEach((square) => {
            collumn = parseInt(square.getAttribute('data-collumn'));
            row = parseInt(square.getAttribute('data-row'));
            this.boardArray[collumn][row] = square;
        });
    }
    setInitialTilesArray() {
        this.tilesArray = new Array(4);
        for (let collumn = 0; collumn < this.tilesArray.length; collumn++) {
            this.tilesArray[collumn] = new Array(4);
        }
    }

    //should be called whenever screen size is adjusted or whenever tiles move or merge
    placeAdjustAndMoveTilesToCorrectLocationOnBoard(isResize) {
        for (let collumn = 0; collumn < 4; collumn++) {
            for (let row = 0; row < 4; row++) {
                this.transitionTileToSquare({ collumn, row }, isResize);
            }
        }
    }
    addNewTile(value = 2) {
        const position = this.getRandomEmptyCollumnAndRow();
        const backgroundColor = getTileBackgroundByValue(value);
        const numberColor = getNumberColorByValue(value);

        const newTile = document.createElement('div');

        newTile.setAttribute('class', 'tile');
        newTile.setAttribute('data-collumn', position.collumn);
        newTile.setAttribute('data-row', position.row);
        newTile.setAttribute("data-value", value);
        newTile.style.background = backgroundColor;
        newTile.style.color = numberColor;
        newTile.innerText = value;
        newTile.style.transitionDuration = '0.2s';
        newTile.addEventListener('webkitTransitionEnd', (event) => {
            newTile.style.transitionDuration = '0.2s';
        });
        newTile.style.fontSize = getTileFontSizeFromTextLength(value.toString().length);

        this.boardElement.appendChild(newTile);

        this.tilesArray[position.collumn][position.row] = newTile;
    }
    moveTile(fromPosition, toPosition) {
        if ((!this.tilesArray[fromPosition.collumn][fromPosition.row]) || toPosition.collumn > 3 || toPosition.row > 3) {
            alert('moveTile method failed!, fromPosition:' + JSON.stringify(fromPosition) + ', toPosition:' + JSON.stringify(toPosition));
            throw new Error('moveTile method failed!');
        }

        const movingTile = this.tilesArray[fromPosition.collumn][fromPosition.row];
        this.tilesArray[toPosition.collumn][toPosition.row] = movingTile;
        this.tilesArray[fromPosition.collumn][fromPosition.row] = undefined;
    }
    transitionTileToSquare(position, isResize) {
        //sets tile size, position and fontSize
        const tileElement = this.tilesArray[position.collumn][position.row];
        if (tileElement === undefined) {
            return;
        }

        if (isResize) {
            tileElement.style.transitionDuration = '0s';
        }

        const squareElement = this.boardArray[position.collumn][position.row];

        tileElement.style.width = `${squareElement.offsetWidth}px`;
        tileElement.style.height = `${squareElement.offsetHeight}px`;

        const squareElementRect = squareElement.getBoundingClientRect();

        tileElement.style.top = (squareElementRect.top + document.documentElement.scrollTop) + 'px';
        tileElement.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + 'px';

        //const { xDistance, yDistance } = getTransitionVectorsBetweenTwoElementsTopLeft(tileElement, squareElement);
        //tileElement.style.transform = `translate(${xDistance}px,${yDistance}px)`;
    }

    getRandomEmptyCollumnAndRow() {
        const numberOfEmptySquares = this.getNumberOfEmptySquaresInBoard();
        const randomNumber = floor(random(0, numberOfEmptySquares));
        return this.getCollumnAndRowFromRandomNumber(randomNumber);
    }
    getCollumnAndRowFromRandomNumber(randomNumber) {
        let counter = 0;
        for (let collumn = 0; collumn < this.tilesArray.length; collumn++) {
            for (let row = 0; row < this.tilesArray[collumn].length; row++) {
                if (!this.tilesArray[collumn][row]) {
                    if (counter === randomNumber) {
                        return { collumn, row };
                    } else {
                        counter++;
                    }
                }
            }
        }
    }
    getNumberOfEmptySquaresInBoard() {
        let numberOfEmptySquares = 0;
        for (let collumn = 0; collumn < this.tilesArray.length; collumn++) {
            for (let row = 0; row < this.tilesArray[collumn].length; row++) {
                if (!this.tilesArray[collumn][row]) {
                    numberOfEmptySquares++;
                }
            }
        }
        return numberOfEmptySquares;
    }
}

export default Game;