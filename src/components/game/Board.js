import React from 'react';
import setBoardsHeightEqualToWidth from '../../utility/setBoardsHeightEqualToWidth';

class Board extends React.Component {
    componentDidMount() {
        setBoardsHeightEqualToWidth();
    }
    render() {
        const { setCurrentScore } = this.props;

        const arr = [];
        for (let i = 0; i < 4; i++) {
            arr[i] = [];
            for (let j = 0; j < 4; j++) {
                arr[i][j] = 1;
            }
        }

        return (
            <div className='game-board'>
                {
                    arr.map((collum) => (
                        <div className='game-board__collum'>
                            {
                                collum.map((row) => (
                                    <div className='game-board__square'>
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