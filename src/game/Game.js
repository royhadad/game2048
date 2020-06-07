//import getTransitionVectorsBetweenTwoElementsTopLeft from "../utility/getTransitionVectorsBetweenTwoElementsTopLeft";
import Vector from './Vector';
import Position from './Position';
import TileBuilder from './TileBuilder';
import Board from './Board';
import getTileFontSizeFromTextLength from '../utility/getTileFontSizeFromTextLength';
import { v4 as uuid } from 'uuid';
import asyncSetTimeOut from '../utility/asyncSetTimeOut';
import Queue from 'js-queue';

const LEFT_ARROW_KEY_CODE = 37;
const UP_ARROW_KEY_CODE = 38;
const RIGHT_ARROW_KEY_CODE = 39;
const DOWN_ARROW_KEY_CODE = 40;
const MOVEMENT_TRANSITION_DURATION = 200;//for dev, in production 200
const IMMEDIATE_TRANSITION_DURATION = 1;//in order to catch the transitionend event

const NUM_OF_COLLUMNS = 4;
const NUM_OF_ROWS = 4;
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

        this.elementsInTransitionIds = {};
        this.movesWaitingToFire = new Queue(async (vector, cb) => {
            //TODO FIX MOVE BATCHING!!!
            await this.move(vector);
            cb();
        });

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
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            const moveVector = getVectorByKeyCode(e.keyCode);
            if (moveVector) {
                if (this.areControllsEnabled()) {
                    await this.move(moveVector);
                } else {
                    this.movesWaitingToFire.push(moveVector);
                    return;
                }
            }
        };
    }

    enableControlls(transitionId) {
        delete this.elementsInTransitionIds[transitionId];
        if (this.areControllsEnabled()) {
            //this.movesWaitingToFire;//START BATCHING!!!!!! TODO
        }
    }
    disableControlls(transitionId) {
        this.elementsInTransitionIds[transitionId] = true;
    }
    areControllsEnabled() {
        return Object.keys(this.elementsInTransitionIds).length === 0;
    }

    async move(vector) {
        if (this.isLegalMove(vector)) {
            //console.log('legal move!');
            await this.makeMove(vector);
            await Promise.all([this.mergeTiles(), this.addNewTileWithAnimation(2, this.board.getRandomEmptyPosition())]);
            if (this.isGameOver()) {
                alert('game over!');
                this.endGame();
            } else {
                console.log(this.board);
            }
        } else {
            alert('invalid move!');
        }
    }

    isGameOver() {
        //TODO FIX BOARD CAN BE FULL
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
        alert('game over!');
        this.init();
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

    async setTileToBigCenter(tile, isImmediate) {
        await this.editTile(tile, isImmediate, (tile) => {
            const growthFactor = 1.2;

            const value = parseInt(tile.getAttribute('data-value'));
            const position = this.board.getTilePosition(tile);
            const squareElement = this.boardArray[position.collumn][position.row];
            const squareElementRect = squareElement.getBoundingClientRect();
            const newWidth = squareElement.offsetWidth * growthFactor;
            const newHeight = squareElement.offsetHeight * growthFactor;
            tile.style.width = `${newWidth}px`;
            tile.style.height = `${newHeight}px`;
            tile.style.top = `${(squareElementRect.top + document.documentElement.scrollTop) - ((newHeight * (growthFactor - 1)) / 2)}px`;
            tile.style.left = `${(squareElementRect.left + document.documentElement.scrollLeft) - ((newWidth * (growthFactor - 1)) / 2)}px`;
            tile.style.fontSize = getTileFontSizeFromTextLength(value.toString().length);
            tile.innerText = value;
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

    //(tile: tile, isImmediate: bool, editFunction: (tile)=>{...trigger a transition})
    async editTile(tile, isImmediate, editFunction) {
        return new Promise(async (resolve, reject) => {
            const transitionUUID = uuid();

            //change the transitionDuration based on argument
            if (isImmediate) {
                tile.style.transitionDuration = `${IMMEDIATE_TRANSITION_DURATION}ms`;
            } else {
                tile.style.transitionDuration = `${MOVEMENT_TRANSITION_DURATION}ms`;
            }
            //wait for transitionDuration to apply by waiting for next event loop
            await asyncSetTimeOut(0);

            const callback = () => {
                tile.removeEventListener("webkitTransitionEnd", callback);
                this.enableControlls(transitionUUID)
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

            if (transitionTriggered(tile, transitionPropertiesBefore)) {
                this.disableControlls(transitionUUID)
                tile.addEventListener("webkitTransitionEnd", callback);
            } else {
                resolve();
            }
        })
    }
}

export default Game;