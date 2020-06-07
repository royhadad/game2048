//import getTransitionVectorsBetweenTwoElementsTopLeft from "../utility/getTransitionVectorsBetweenTwoElementsTopLeft";
import Vector from './Vector';
import Position from './Position';
import TileBuilder from './TileBuilder';
import Board from './Board';
import getTileFontSizeFromTextLength from '../utility/getTileFontSizeFromTextLength';
//import asyncSetTimeOut from '../utility/asyncSetTimeOut';

const LEFT_ARROW_KEY_CODE = 37;
const UP_ARROW_KEY_CODE = 38;
const RIGHT_ARROW_KEY_CODE = 39;
const DOWN_ARROW_KEY_CODE = 40;
const MOVEMENT_TRANSITION_DURATION = 1000;//for dev, in production 200
const IMMEDIATE_TRANSITION_DURATION = 1;//in order to catch the transitionend event

//const NUM_OF_COLLUMNS = 4;
// const NUM_OF_ROWS = 4;
//const MOVEMENT_TRANSITION_DURATION = 1.0;//for dev, in production 0.2
//const CREATION_TRANSITION_DURATION = 1.0;//for dev, in production around 0.2
//const MERGE_TRANSITION_DURATION = 1.0;// for dev, in production around 0.2

class Game {
    constructor(boardElement) {
        this.boardElement = boardElement;

        //bind functions to prevent "this" problems
        this.placeAdjustAndMoveTilesToCorrectLocationOnBoard = this.placeAdjustAndMoveTilesToCorrectLocationOnBoard.bind(this);

        //prep work
        this.fetchAndSetBoardArray();

        //allow player movement
        this.setKeyListeners();
    }
    async init() {
        //start a new game
        this.board = new Board();

        //add initial tiles
        await this.addManyNewTilesWithAnimation([
            new TileBuilder(8, new Position(1, 1))
        ])
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
    setKeyListeners() {
        document.onkeydown = async (e) => {
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }

            switch (e.keyCode) {
                case LEFT_ARROW_KEY_CODE:
                    await this.move(new Vector(-1, 0));
                    break;
                case RIGHT_ARROW_KEY_CODE:
                    await this.move(new Vector(1, 0));
                    break;
                case DOWN_ARROW_KEY_CODE:
                    await this.move(new Vector(1, 0));
                    break;
                case UP_ARROW_KEY_CODE:
                    await this.move(new Vector(0, -1));
                    break;
                default:
                    break;
            }
        };
    }
    async move(vector) {
        if (this.isLegalMove(vector)) {
            console.log('legal move!');
            await this.makeMove(vector);
            if (this.isGameOver()) {
                console.log('game over');

                this.endGame();
            } else {
                console.log('game not over');

                await this.addNewTileWithAnimation(2, this.board.getRandomEmptyPosition());
            }
        } else {
            console.log('invalid move!');
        }
    }

    isGameOver() {
        return this.board.getNumberOfEmptySquaresInBoard() === 0
    }
    endGame() {
        alert('game over!');
        this.init();
    }
    async makeMove(vector) {
        //make movement
        //down
        if (vector.horizontal === 0 && vector.vertical === 1) {
            this.board.forEachTile((tile, position) => {
                this.moveTile(position, position.addVector(new Vector(1, 0)));
            })
        }
        await this.placeAdjustAndMoveTilesToCorrectLocationOnBoard(false);
    }

    moveTile(fromPosition, toPosition) {
        // console.log(fromPosition);
        // console.log(this.board.at(fromPosition));
        // console.log(this.board.at(fromPosition).length);

        if (!this.board.isSingle(fromPosition)) {
            alert('moveTile() error! from position doesnt have one tile');
            throw new Error('moveTile error');
        }
        const tile = this.board.at(fromPosition)[0];
        this.board.moveTile(tile, toPosition);
    }

    isLegalMove(vector) {
        let canAnyTileMove = false;
        this.board.forEachTile((tile, position) => {
            if (this.canTileMoveInMoveDirection(tile, vector)) {
                canAnyTileMove = true;
            }
        })
        return canAnyTileMove;
    }

    canTileMoveInMoveDirection(tile, vector) {
        //check if tile exists
        if (tile === undefined) {
            return false;
        }

        const collumn = parseInt(tile.getAttribute('data-collumn'));
        const row = parseInt(tile.getAttribute('data-collumn'));

        //check if tile is at the edge of the direction
        if (new Position(collumn + vector.horizontal, row + vector.vertical).isOutOfBounds()) {
            return false;
        }

        //check for movement options in the direction
        let previousValue;

        for (let movingPosition = new Position(collumn, row).addVector(vector); !(movingPosition.isOutOfBounds()); movingPosition = movingPosition.addVector(vector)) {
            if (this.board.isEmpty(movingPosition)) {
                return true;
            } else if (previousValue) {
                if (previousValue === this.board.at(movingPosition)[0].getAttribute('data-value')) {
                    return true;
                }
            }
            previousValue = this.board.at(movingPosition)[0].getAttribute('data-value');
        }
        return false;
    }

    //should be called whenever screen size is adjusted or whenever tiles move or merge
    placeAdjustAndMoveTilesToCorrectLocationOnBoard(isImmediate) {
        return new Promise(async (resolve, reject) => {
            const allPromises = [];
            for (let collumn = 0; collumn < 4; collumn++) {
                for (let row = 0; row < 4; row++) {
                    this.board.at(new Position(collumn, row)).forEach((tile) => {
                        allPromises.push(this.moveTileToProperPositionImmediatly(tile, isImmediate));
                    })
                }
            }
            await Promise.all(allPromises);
            resolve();
        })
    }

    async moveTileToProperPositionImmediatly(tileElement, isImmediate, isNew) {
        const position = this.board.getTilePosition(tileElement);
        //sets tile size, position and fontSize
        if (tileElement === undefined) {
            throw new Error('transitionTileToSquare tile is undefined!');
        }

        const squareElement = this.boardArray[position.collumn][position.row];
        const squareElementRect = squareElement.getBoundingClientRect();

        await this.editTile(tileElement, isImmediate, (tile) => {
            tile.style.width = `${squareElement.offsetWidth}px`;
            tile.style.height = `${squareElement.offsetHeight}px`;
            tile.style.top = (squareElementRect.top + document.documentElement.scrollTop) + 'px';
            tile.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + 'px';
        })
    }

    addNewTile(value = 2, position) {
        const newTile = this.board.addNewTile(value, position);
        this.boardElement.appendChild(newTile);
        return newTile;
    }

    async addManyNewTilesWithAnimation(tileBuilders) {
        const promisesArray = [];
        tileBuilders.forEach((tileBuilder) => {
            promisesArray.push(this.addNewTileWithAnimation(tileBuilder.value, tileBuilder.position));
        })
        await Promise.all(promisesArray);
    }
    async addNewTileWithAnimation(value = 2, position, isMerge) {
        if (isMerge) {
            alert('not implemented merge animation yet!');
            return;
        }
        const tile = this.addNewTile(value, position);

        await this.setTileToSmallCenter(tile, true);

        await this.setTileToProperPlace(tile, false);

        return tile;
    }
    async setTileToSmallCenter(tile, isImmediate) {
        await this.editTile(tile, isImmediate, (tile) => {
            const position = this.board.getTilePosition(tile);
            const squareElement = this.boardArray[position.collumn][position.row];
            const squareElementRect = squareElement.getBoundingClientRect();
            const { width: squareWidth, height: squareHeight } = squareElementRect;
            tile.style.width = '0px';
            tile.style.height = '0px';
            tile.style.top = (squareElementRect.top + document.documentElement.scrollTop) + squareHeight / 2 + 'px';
            tile.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + squareWidth / 2 + 'px';
            tile.style.fontSize = '0vw';
            tile.innerText = '';
        })

    }
    async setTileToProperPlace(tile, isImmediate) {
        await this.editTile(tile, isImmediate, (tile) => {
            const value = parseInt(tile.getAttribute('data-value'));
            const position = this.board.getTilePosition(tile);
            const squareElement = this.boardArray[position.collumn][position.row];
            const squareElementRect = squareElement.getBoundingClientRect();

            tile.style.width = `${squareElement.offsetWidth}px`;
            tile.style.height = `${squareElement.offsetHeight}px`;
            tile.style.top = (squareElementRect.top + document.documentElement.scrollTop) + 'px';
            tile.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + 'px';
            tile.style.fontSize = getTileFontSizeFromTextLength(value.toString().length);
            tile.innerText = value;
        })
    }

    async editTile(tile, isImmediate, editFunction) {
        return new Promise(async (resolve, reject) => {
            if (isImmediate) {
                tile.style.transitionDuration = `${IMMEDIATE_TRANSITION_DURATION}ms`;
            } else {
                tile.style.transitionDuration = `${MOVEMENT_TRANSITION_DURATION}ms`;
            }
            //currently works without this
            //await asyncSetTimeOut(0);

            const callback = () => {
                tile.removeEventListener("webkitTransitionEnd", callback);
                resolve();
            }
            tile.addEventListener("webkitTransitionEnd", callback);
            editFunction(tile);
        })
    }
}

export default Game;