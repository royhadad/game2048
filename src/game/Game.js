import Vector from './Vector';
import Position from './Position';
import TileBuilder from './TileBuilder';
import Board from './Board';
import getTileFontSizeFromTextLength from '../utility/getTileFontSizeFromTextLength';
import Queue from 'js-queue';
import {
    getElementLeftRelativeToClosesPositionedAncestor,
    getElementTopRelativeToClosesPositionedAncestor
} from '../utility/getPositionUtils';

const LEFT_ARROW_KEY_CODE = 37;
const UP_ARROW_KEY_CODE = 38;
const RIGHT_ARROW_KEY_CODE = 39;
const DOWN_ARROW_KEY_CODE = 40;
const DEFAULT_TRANSITION_DURATION = 100;
const CATCH_UP_TRANSITION_DURATION = 0; //for when alot of moves need to happen quickly
const IMMEDIATE_TRANSITION_DURATION = 0;//in order to catch the transitionend event

const NUM_OF_COLLUMNS = 4;
const NUM_OF_ROWS = 4;

class Game {
    constructor(boardElement, dispatchCurrentScore, gameOverLayerElement) {
        this.boardElement = boardElement;
        this.movementTransitionDuration = DEFAULT_TRANSITION_DURATION;
        this.dispatchCurrentScore = dispatchCurrentScore;
        this.gameOverLayerElement = gameOverLayerElement;
        //bind functions to prevent "this" problems
        this.placeAdjustAndMoveTilesToCorrectLocationOnBoard = this.placeAdjustAndMoveTilesToCorrectLocationOnBoard.bind(this);
        this.movesWaitingToFire = new Queue();

        //prep work
        this.fetchAndSetBoardArray();

        //allow player movement
        this.setKeyListeners();
    }
    async init() {
        //start a new game
        Array.from(this.boardElement.querySelectorAll('.tile')).forEach((tileElement) => {
            this.boardElement.removeChild(tileElement);
        });
        this.board = new Board();
        this.currentScore = 0;
        this.dispatchCurrentScore(this.currentScore);

        //make game ended message disappear
        this.gameOverLayerElement.style.transitionDuration = '0ms';
        this.gameOverLayerElement.style.opacity = '0%';
        this.gameOverLayerElement.style.zIndex = '-1';

        //enable and clear moves
        this.controlsEnabled = true;
        this.movesWaitingToFire.clear();

        //add initial tiles
        const tile1Position = this.board.getRandomEmptyPosition();
        //generate a different square, tile1 hasn't mounted yet so it might generate same number again
        //can be optimized but doesn't really matter at all
        let tile2Position = tile1Position;
        while (tile2Position.equals(tile1Position)) {
            tile2Position = this.board.getRandomEmptyPosition();
        }

        await this.addManyNewTilesWithAnimation([
            new TileBuilder(2, tile1Position),
            new TileBuilder(2, tile2Position)
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
            const getVectorByKeyCode = (keyCode) => {
                switch (keyCode) {
                    case LEFT_ARROW_KEY_CODE:
                        return new Vector(0, -1);
                    case RIGHT_ARROW_KEY_CODE:
                        return new Vector(0, 1);
                    case DOWN_ARROW_KEY_CODE:
                        return new Vector(1, 0);
                    case UP_ARROW_KEY_CODE:
                        return new Vector(-1, 0);
                    default:
                        return undefined;
                }
            }
            if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            if (!this.controlsEnabled) {
                return;
            }
            const moveVector = getVectorByKeyCode(e.keyCode);
            if (moveVector) {
                const parentInstance = this;
                this.movesWaitingToFire.add(async function () {
                    //change the move speed based on wheter or not there are alot of moves waiting to execute
                    if (parentInstance.movesWaitingToFire.contents.length > 0) {
                        parentInstance.movementTransitionDuration = CATCH_UP_TRANSITION_DURATION;
                    } else {
                        parentInstance.movementTransitionDuration = DEFAULT_TRANSITION_DURATION;
                    }
                    await parentInstance.move(moveVector);
                    this.next();
                });
            }
        };
    }

    async move(vector) {
        if (this.isLegalMove(vector)) {
            //console.log('legal move!');
            await this.makeMove(vector);
            await Promise.all([
                this.mergeTiles(),
                this.addNewTileWithAnimation(2, this.board.getRandomEmptyPosition())
            ]);
            this.dispatchCurrentScore(this.currentScore);
            if (this.isGameOver()) {
                this.endGame();
            } else {
                //do something
            }
        } else {
            //alert('invalid move!');
        }
    }

    isGameOver() {
        if ((this.isLegalMove(new Vector(1, 0))) ||
            (this.isLegalMove(new Vector(-1, 0))) ||
            (this.isLegalMove(new Vector(0, 1))) ||
            (this.isLegalMove(new Vector(0, -1)))) {
            return false;
        } else {
            return true;
        }
    }
    endGame() {
        this.gameOverLayerElement.style.transitionDuration = '2000ms';
        this.gameOverLayerElement.style.zIndex = '20';
        this.gameOverLayerElement.style.opacity = '100%';
        this.controlsEnabled = false;
    }

    async mergeTiles() {
        let positionIterator;
        const mergedTilesBuilders = [];
        for (let collumn = 0; collumn < NUM_OF_COLLUMNS; collumn++) {
            for (let row = 0; row < NUM_OF_ROWS; row++) {
                positionIterator = new Position(collumn, row);
                if (this.board.isFull(positionIterator)) {
                    let tilesAtPosition = this.board.at(positionIterator);
                    const tilesValue = parseInt(this.board.tileAt(positionIterator).getAttribute('data-value'));
                    const newValue = tilesValue * 2;
                    this.currentScore += newValue;

                    tilesAtPosition.forEach((tile) => {
                        this.board.removeTileFromCurrentPosition(tile);
                        this.boardElement.removeChild(tile);
                    })

                    mergedTilesBuilders.push(new TileBuilder(newValue, positionIterator));
                }
            }
        }
        await this.addManyNewTilesWithAnimation(mergedTilesBuilders, true);
    }

    async makeMove(vector) {
        //make movement
        let madeMovement = true;
        while (madeMovement) {
            madeMovement = false;
            // eslint-disable-next-line
            this.board.forEachTile((tile, currentPosition) => {
                const nextPosition = this.getTileNextPosition(tile, currentPosition, vector);
                if (!currentPosition.equals(nextPosition)) {
                    this.moveTile(currentPosition, nextPosition);
                    madeMovement = true;
                }
            })
        }
        await this.placeAdjustAndMoveTilesToCorrectLocationOnBoard(false);
    }

    getTileNextPosition(tile, currentPosition, vector) {
        try {
            const isValidPositionForTile = (tile, position) => {
                if (position.isOutOfBounds()) {
                    return false;
                }
                if (this.board.isFull(position)) {
                    return false;
                }
                if (this.board.isEmpty(position)) {
                    return true;
                }
                if (this.board.isSingle(position) && this.board.tileAt(position).getAttribute('data-value') === tile.getAttribute('data-value')) {
                    return true;
                }
                //throw new Error('position: ' + JSON.stringify(position) + " was not empty, single, or full, something went wrong!" + this.board.at(position)).length;
            }
            while (isValidPositionForTile(tile, currentPosition.addVector(vector))) {
                currentPosition = currentPosition.addVector(vector);
            }
            return currentPosition;
        } catch (e) {
            alert('error!!!!' + e.message);
        }
    }

    moveTile(fromPosition, toPosition) {
        if (this.board.isFull(toPosition)) {
            throw new Error(`moveTile() error! to position is full! ${JSON.stringify(fromPosition)}`);
        }
        const tile = this.board.tileAt(fromPosition);
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
        const collumn = parseInt(tile.getAttribute('data-collumn'));
        const row = parseInt(tile.getAttribute('data-row'));
        const tileValue = tile.getAttribute('data-value');

        //check for movement options in the direction
        const currentPosition = new Position(collumn, row);
        const nextPosition = currentPosition.addVector(vector);
        if (nextPosition.isOutOfBounds()) {
            return false;
        }

        const adjacentTile = this.board.tileAt(nextPosition);
        if (!adjacentTile) {
            return true;
        }
        if (tileValue === adjacentTile.getAttribute('data-value')) {
            return true;
        } else {
            return false;
        }
    }

    //should be called whenever screen size is adjusted or whenever tiles move or merge
    placeAdjustAndMoveTilesToCorrectLocationOnBoard(isImmediate) {
        return new Promise(async (resolve, reject) => {
            const allPromises = [];
            for (let collumn = 0; collumn < 4; collumn++) {
                for (let row = 0; row < 4; row++) {
                    this.board.at(new Position(collumn, row)).forEach((tile) => {
                        allPromises.push(this.setTileToProperPlace(tile, isImmediate));
                    })
                }
            }
            await Promise.all(allPromises);
            resolve();
        })
    }

    addNewTile(value = 2, position) {
        const newTile = this.board.addNewTile(value, position);
        this.boardElement.appendChild(newTile);
        return newTile;
    }

    async addManyNewTilesWithAnimation(tileBuilders, isMerge) {
        const promisesArray = tileBuilders.map((tileBuilder) => {
            return this.addNewTileWithAnimation(tileBuilder.value, tileBuilder.position, isMerge);
        })
        await Promise.all(promisesArray);
    }
    async addNewTileWithAnimation(value = 2, position, isMerge) {
        const tile = this.addNewTile(value, position);

        if (isMerge) {
            //if merge
            await this.setTileToBigCenter(tile, true);
        } else {
            //if creation
            await this.setTileToSmallCenter(tile, true);
        }

        await this.setTileToProperPlace(tile, false);

        return tile;
    }
    async setTileToSmallCenter(tileElement, isImmediate) {
        await this.editTile(tileElement, isImmediate, (tile) => {
            const position = this.board.getTilePosition(tile);
            const squareElement = this.boardArray[position.collumn][position.row];
            const squareElementRect = squareElement.getBoundingClientRect();
            const { width: squareWidth, height: squareHeight } = squareElementRect;

            tile.style.width = '0px';
            tile.style.height = '0px';
            tile.style.top = (getElementTopRelativeToClosesPositionedAncestor(squareElement, this.boardElement)) + squareHeight / 2 + 'px';
            tile.style.left = (getElementLeftRelativeToClosesPositionedAncestor(squareElement, this.boardElement)) + squareWidth / 2 + 'px';
            tile.style.fontSize = '0vw';
            tile.innerText = '';
        })

    }

    async setTileToBigCenter(tileElement, isImmediate) {
        await this.editTile(tileElement, isImmediate, (tile) => {
            const growthFactor = 1.2;
            const value = parseInt(tile.getAttribute('data-value'));
            const position = this.board.getTilePosition(tile);
            const squareElement = this.boardArray[position.collumn][position.row];
            const newWidth = squareElement.offsetWidth * growthFactor;
            const newHeight = squareElement.offsetHeight * growthFactor;

            tile.style.width = `${newWidth}px`;
            tile.style.height = `${newHeight}px`;
            tile.style.top = `${(getElementTopRelativeToClosesPositionedAncestor(squareElement, this.boardElement)) - ((newHeight * (growthFactor - 1)) / 2)}px`;
            tile.style.left = `${(getElementLeftRelativeToClosesPositionedAncestor(squareElement, this.boardElement)) - ((newWidth * (growthFactor - 1)) / 2)}px`;
            tile.style.fontSize = getTileFontSizeFromTextLength(value.toString().length);
            tile.innerText = value;
        })

    }

    async setTileToProperPlace(tileElement, isImmediate) {
        await this.editTile(tileElement, isImmediate, (tile) => {
            const value = parseInt(tile.getAttribute('data-value'));
            const position = this.board.getTilePosition(tile);
            const squareElement = this.boardArray[position.collumn][position.row];

            tile.style.width = `${squareElement.offsetWidth}px`;
            tile.style.height = `${squareElement.offsetHeight}px`;
            tile.style.top = (getElementTopRelativeToClosesPositionedAncestor(squareElement, this.boardElement)) + 'px';
            tile.style.left = (getElementLeftRelativeToClosesPositionedAncestor(squareElement, this.boardElement)) + 'px';
            tile.style.fontSize = getTileFontSizeFromTextLength(value.toString().length);
            tile.innerText = value;
        })
    }

    //(tile: tile, isImmediate: bool, editFunction: (tile)=>{...trigger a transition})
    async editTile(tile, isImmediate, editFunction) {
        return new Promise(async (resolve, reject) => {
            //change the transitionDuration based on argument
            console.log();

            if (isImmediate) {
                tile.style.transitionDuration = `${IMMEDIATE_TRANSITION_DURATION}ms`;
            } else {
                tile.style.transitionDuration = `${this.movementTransitionDuration}ms`;
            }

            const callback = () => {
                tile.removeEventListener("webkitTransitionEnd", callback);
                resolve();
            }

            //check if transition is triggered
            const transitionPropertiesBefore = {
                width: tile.style.width,
                height: tile.style.height,
                top: tile.style.top,
                left: tile.style.left,
                fontSize: tile.style.fontSize
            }

            const transitionTriggered = (tileAfter, beforeProperties) => {
                return Object.keys(beforeProperties).some((propertyKey) => {
                    return (beforeProperties[propertyKey] !== tileAfter.style[propertyKey])
                });
            }

            editFunction(tile);

            if (transitionTriggered(tile, transitionPropertiesBefore) && tile.style.transitionDuration !== '0ms') {
                tile.addEventListener("webkitTransitionEnd", callback);
            } else {
                resolve();
            }
        })
    }
}

export default Game;