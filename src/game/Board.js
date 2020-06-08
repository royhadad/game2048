import { random, floor } from 'mathjs';
import getTileBackgroundByValue from '../utility/getTileBackgroundByValue';
import getNumberColorByValue from '../utility/getNumberColorByValue';
import Position from './Position';
import { v4 as uuid } from 'uuid';

const NUM_OF_COLLUMNS = 4;
const NUM_OF_ROWS = 4;

class Board {
    constructor() {
        this.tilesArray = new Array(NUM_OF_COLLUMNS);
        for (let collumn = 0; collumn < NUM_OF_COLLUMNS; collumn++) {
            this.tilesArray[collumn] = new Array(NUM_OF_ROWS);
            for (let row = 0; row < NUM_OF_ROWS; row++) {
                this.tilesArray[collumn][row] = [];
            }
        }
        for (let i = 0; i < 10; i++) {
            this.getRandomEmptyPosition();
        }
    }

    isEmpty(position) {
        return this.at(position).length === 0;
    }

    isSingle(position) {
        return this.at(position).length === 1;
    }
    isFull(position) {
        return this.at(position).length === 2;
    }

    moveTile(tile, targetPosition) {
        if (this.isFull(targetPosition)) {
            alert(`moveTile method failed!, ${{ from: this.getTilePosition(tile), to: targetPosition }}`);
            throw new Error('moveTile method failed!');
        }

        this.removeTileFromCurrentPosition(tile)
        tile.setAttribute('data-collumn', targetPosition.collumn);
        tile.setAttribute('data-row', targetPosition.row);
        this.addTileAtPosition(tile, targetPosition);
        return tile;
    }

    addTileAtPosition(tile, position) {
        if (this.isFull(position)) {
            throw new Error('addTileAtPosition() cant add tile, position is full!');
        }
        this.at(position).push(tile);
    }
    removeTileFromCurrentPosition(tile) {
        const tileId = tile.getAttribute('id');
        const tilePosition = this.getTilePosition(tile);
        this.at(tilePosition).forEach((iteratedTile, index) => {
            if (tileId === iteratedTile.getAttribute('id')) {
                this.tilesArray[tilePosition.collumn][tilePosition.row] = [...this.at(tilePosition).slice(0, index), ...this.at(tilePosition).slice(index + 1)];
                return;
            }
        })
    }

    at(position) {
        return this.tilesArray[position.collumn][position.row];
    }
    tileAt(position) {
        return this.tilesArray[position.collumn][position.row][0] || this.tilesArray[position.collumn][position.row][1];
    }
    getTilePosition(tile) {
        if (!tile) {
            throw new Error('getTilePosition error! no tile found');
        }

        return new Position(parseInt(tile.getAttribute('data-collumn')), parseInt(tile.getAttribute('data-row')));
    }

    //higher order function
    //callback: this.forEachTile((tile, position)=>{
    //CODE
    //})
    forEachTile(callback) {
        const allTiles = [];
        for (let collumn = 0; collumn < NUM_OF_COLLUMNS; collumn++) {
            for (let row = 0; row < NUM_OF_ROWS; row++) {
                if (!this.isEmpty(new Position(collumn, row))) {
                    this.at(new Position(collumn, row)).forEach((tile) => {
                        allTiles.push(tile);
                    })
                }
            }
        }

        allTiles.forEach((tile) => {
            callback(tile, this.getTilePosition(tile));
        })
    }

    addNewTile(value = 2, position) {
        if (!position) {
            position = this.getRandomEmptyPosition();
        }
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
        newTile.style.fontSize = '0px';
        newTile.style.height = '0px';
        newTile.style.width = '0px';
        newTile.id = uuid();

        this.addTileAtPosition(newTile, position);
        return newTile;
    }

    getRandomEmptyPosition() {
        const numberOfEmptySquares = this.getNumberOfEmptySquaresInBoard();
        const randomNumber = floor(random(0, numberOfEmptySquares));
        return this.getPositionFromRandomNumber(randomNumber);
    }
    getPositionFromRandomNumber(randomNumber) {
        let counter = 0;
        for (let collumn = 0; collumn < NUM_OF_COLLUMNS; collumn++) {
            for (let row = 0; row < NUM_OF_ROWS; row++) {
                if (this.isEmpty(new Position(collumn, row))) {
                    if (counter === randomNumber) {
                        return new Position(collumn, row);
                    } else {
                        counter++;
                    }
                }
            }
        }
    }
    getNumberOfEmptySquaresInBoard() {
        let numberOfEmptySquares = 0;
        for (let collumn = 0; collumn < NUM_OF_COLLUMNS; collumn++) {
            for (let row = 0; row < NUM_OF_ROWS; row++) {
                if (this.isEmpty(new Position(collumn, row))) {
                    numberOfEmptySquares++;
                }
            }
        }
        return numberOfEmptySquares;
    }
}

export default Board;