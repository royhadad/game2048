import React from 'react';
import setBoardsHeightEqualToWidth from '../../utility/setBoardsHeightEqualToWidth';
import Game from '../../game/Game';

let adjustBoardOnResize;
class Board extends React.Component {
    constructor(props) {
        super(props);
        this.boardRef = React.createRef();
    }
    componentDidMount() {
        setBoardsHeightEqualToWidth();
        //create new game
        const boardElement = this.boardRef.current;
        this.game = new Game(boardElement);

        //listen to screen size changes and adjust game tiles
        adjustBoardOnResize = (game) => {
            setTimeout(() => {
                game.placeAdjustAndMoveTilesToCorrectLocationOnBoard(true);
            }, 0);
        }
        window.addEventListener('resize', () => { adjustBoardOnResize(this.game) });
    }
    componentWillUnmount() {
        window.removeEventListener('resize', () => { adjustBoardOnResize(this.game) });
    }
    render() {
        //const { setCurrentScore } = this.props;

        const arr = [];
        let counter = 0;
        for (let i = 0; i < 4; i++) {
            arr[i] = [];
            for (let j = 0; j < 4; j++) {
                arr[i][j] = counter;
                counter++;
            }
        }

        return (
            <div className='game-board' ref={this.boardRef}>
                {
                    arr.map((collumn, collumnIndex) => (
                        <div className='game-board__collumn' key={collumnIndex}>
                            {
                                collumn.map((squareNumber, rowIndex) => (
                                    <div className='game-board__square' data-collumn={collumnIndex} data-row={rowIndex} key={squareNumber}>
                                    </div>
                                ))
                            }
                        </div>
                    ))
                }
            </div>
        );
    }
}

export default Board;