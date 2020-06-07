const NUM_OF_COLLUMNS = 4;
const NUM_OF_ROWS = 4;

class Position {
    constructor(collumn, row) {
        this.collumn = collumn;
        this.row = row;
    }
    isOutOfBounds() {
        if (this.collumn >= NUM_OF_COLLUMNS || this.collumn < 0 || this.row >= NUM_OF_ROWS || this.row < 0) {
            return true;
        } else {
            return false;
        }
    }

    //returns a new position object with the vector added
    addVector(vector) {
        return new Position(this.collumn + vector.horizontal, this.row + vector.vertical);
    }
}

export default Position;