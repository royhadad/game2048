import React from 'react';
import Game from '../../game/Game';
import Button from '../generics/Button';

let adjustBoardOnResize;
class Board extends React.Component {
    constructor(props) {
        super(props);
        this.boardRef = React.createRef();
        this.gameOverLayerRef = React.createRef();
    }
    async componentDidMount() {
        //create new game
        const boardElement = this.boardRef.current;
        boardElement.style.height = getComputedStyle(boardElement).width;
        this.game = new Game(boardElement, this.props.setCurrentScore, this.gameOverLayerRef.current);
        const startNewGameFunction = async () => {
            await this.game.init();
        }
        this.props.setNewGameButton(startNewGameFunction);

        //listen to screen size changes and adjust game tiles
        adjustBoardOnResize = (game) => {
            boardElement.style.height = getComputedStyle(boardElement).width;
            game.placeAdjustAndMoveTilesToCorrectLocationOnBoard(true);
        }
        window.addEventListener('resize', () => { adjustBoardOnResize(this.game) });
        await startNewGameFunction();
    }
    componentWillUnmount() {
        window.removeEventListener('resize', () => { adjustBoardOnResize(this.game) });
    }
    render() {
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
                <div className='game-over-layer' ref={this.gameOverLayerRef}>
                    <div className='game-over-text'>Game over!</div>
                    <div className='game-over-layer__buttons-wrapper'>
                        <Button onClick={async () => { await this.game.init() }} text={'Try again'} />
                        <Button onClick={() => { window.open('https://twitter.com/share?ref_src=twsrc%5Etfw') }} text={'Tweet'} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Board;