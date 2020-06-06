//import getTransitionVectorsBetweenTwoElementsTopLeft from "../utility/getTransitionVectorsBetweenTwoElementsTopLeft";
import Vector from './Vector';
import Position from './Position';
import Board from './Board';

const LEFT_ARROW_KEY_CODE = 37;
const UP_ARROW_KEY_CODE = 38;
const RIGHT_ARROW_KEY_CODE = 39;
const DOWN_ARROW_KEY_CODE = 40;
const MOVEMENT_TRANSITION_DURATION = 1.0;//for dev, in production 0.2

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

        //start a new game
        this.board = new Board();

        const tile1 = this.addNewTile(2, new Position(3, 2));
        const tile2 = this.addNewTile(128, new Position(2, 1));
        // this.addNewTile(2048);
        // this.addNewTile(2048 * 32);
        // this.addNewTile(2048 * 64);

        //adjust UI
        this.placeAdjustAndMoveTilesToCorrectLocationOnBoard()

        //allow player movement
        this.setKeyListeners();

        //for testing
        // setTimeout(async () => {
        //     this.board.moveTile(tile1, new Position(0, 3));
        //     this.board.moveTile(tile2, new Position(0, 3));
        //     await this.placeAdjustAndMoveTilesToCorrectLocationOnBoard();
        // }, 5000);
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
            const newTile = await this.addNewTileWithAnimation(2);
            this.board.moveTile(newTile, new Position(0, 0))
            this.transitionTileToSquare(newTile, true, true);
        } else {
            console.log('invalid move!');
        }
    }

    async makeMove(vector) {
        //make movement
        //down
        if (vector.horizontal === 0 && vector.vertical === 1) {
            // for (let row =)
            // this.board



        }

        // let previousValue;
        // let targetRow = row + vector.vertical;
        // let targetCollumn = collumn + vector.horizontal;
        // for (; (targetRow >= 0 && targetRow < 4 && targetCollumn >= 0 && targetCollumn < 4); targetRow += vector.vertical, targetCollumn += vector.horizontal) {
        //     if (this.tilesArray[targetCollumn][targetRow] === undefined) {
        //         return true;
        //     } else if (previousValue) {
        //         if (previousValue === this.tilesArray[targetCollumn][targetRow].getAttribute('data-value')) {
        //             return true;
        //         }
        //     }
        //     previousValue = this.tilesArray[targetCollumn][targetRow].getAttribute('data-value');
        // }


        this.placeAdjustAndMoveTilesToCorrectLocationOnBoard();
    }

    moveTile(fromPosition, toPosition) {
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
        const movingPosition = new Position(collumn, row);
        movingPosition.moveWithVector(vector);
        for (; !(movingPosition.isOutOfBounds()); movingPosition.moveWithVector(vector)) {
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
                        allPromises.push(this.transitionTileToSquare(tile, isImmediate));
                    })
                }
            }
            await Promise.all(allPromises);
            resolve();
        })
    }

    async transitionTileToSquare(tileElement, isImmediate, isNew) {
        const position = this.board.getTilePosition(tileElement);
        //sets tile size, position and fontSize
        if (tileElement === undefined) {
            throw new Error('transitionTileToSquare tile is undefined!');
        }

        const squareElement = this.boardArray[position.collumn][position.row];
        const squareElementRect = squareElement.getBoundingClientRect();

        if (!isNew) {
            tileElement.style.width = `${squareElement.offsetWidth}px`;
            tileElement.style.height = `${squareElement.offsetHeight}px`;
            tileElement.style.top = (squareElementRect.top + document.documentElement.scrollTop) + 'px';
            tileElement.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + 'px';
        } else {
            const { width: squareWidth, height: squareHeight } = squareElementRect;
            tileElement.style.width = 0;
            tileElement.style.height = 0;
            tileElement.style.top = (squareElementRect.top + document.documentElement.scrollTop) + squareHeight / 2 + 'px';
            tileElement.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + squareWidth / 2 + 'px';
            tileElement.innerText = '';
        }

        return await this.applyTileTransitionForCurrentAttributes(tileElement, isImmediate);
        //deprecated at the moment
        //const { xDistance, yDistance } = getTransitionVectorsBetweenTwoElementsTopLeft(tileElement, squareElement);
        //tileElement.style.transform = `translate(${xDistance}px,${yDistance}px)`;

        //callback

    }

    addNewTile(value = 2, position) {
        const newTile = this.board.addNewTile(value, position);
        this.boardElement.appendChild(newTile);
        return newTile;
    }
    async addNewTileWithAnimation(value = 2, position, isMerge) {
        if (isMerge) {
            alert('not implemented merge animation yet!');
            return;
        }
        const tile = this.addNewTile(value, position);
        await this.applyTileTransitionForCurrentAttributes(tile, true);

        this.setTileToSmallCenter(tile);
        await this.applyTileTransitionForCurrentAttributes(tile, true);

        await this.setTileToExpendAndAppear(tile);

        return tile;
    }
    setTileToSmallCenter(tile) {
        const squareElementRect = this.boardArray[0][0].getBoundingClientRect();
        const { width: squareWidth, height: squareHeight } = squareElementRect;
        tile.style.width = 0;
        tile.style.height = 0;
        tile.style.top = (squareElementRect.top + document.documentElement.scrollTop) + squareHeight / 2 + 'px';
        tile.style.left = (squareElementRect.left + document.documentElement.scrollLeft) + squareWidth / 2 + 'px';
        tile.innerText = '';
    }
    async setTileToExpendAndAppear(tile) {
        tile.innerText = tile.getAttribute('data-value');
        await this.transitionTileToSquare(tile);
    }
    applyTileTransitionForCurrentAttributes(tileElement, isImmediate) {
        if (isImmediate) {
            tileElement.style.transitionDuration = '0s';
        } else {
            tileElement.style.transitionDuration = `${MOVEMENT_TRANSITION_DURATION}s`;
        }
        //TODO FIX
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 10);
        }).then(() => {

            console.log(tileElement.style.transitionDuration, tileElement);

            if (isImmediate) {
                return new Promise((resolve, reject) => {
                    resolve();
                })
            } else {
                return new Promise((resolve, reject) => {
                    const callback = () => {
                        tileElement.removeEventListener("webkitTransitionEnd", callback);
                        resolve();
                    }
                    tileElement.addEventListener("webkitTransitionEnd", callback);
                })
            }
        })
    }
}

export default Game;