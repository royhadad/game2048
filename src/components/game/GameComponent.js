import React from 'react';
import ScoreRectangle from '../generics/ScoreRectangle';
import Button from '../generics/Button';
import Board from './Board';
import { max } from 'mathjs';

class GameComponent extends React.Component {
    state = {
        currentScore: 0,
        bestScore: 0
    }

    startNewGame = () => {
        alert('start a new game button!');
    }

    setCurrentScore = (currentScore) => {
        this.setState((prevState) => {
            return {
                currentScore,
                bestScore: max(prevState.bestScore, currentScore)
            }
        });
    }

    render() {
        return (
            <div className='game-wrapper'>
                <div className='game-ui'>
                    <div className='game-ui-top'>
                        <div className='game-ui-top-left'>
                            2048
                        </div>
                        <div className='game-ui-top-right'>
                            <ScoreRectangle title='score' score={this.state.currentScore} />
                            <ScoreRectangle title='best' score={this.state.bestScore} />
                        </div>
                    </div>
                    <div className='game-ui-bottom'>
                        <div className='game-ui-bottom__text'>
                            <b>Play 2048 Game Online </b><br />
                            Join the numbers and get to the <b>2048 tile!</b>
                        </div>
                        <Button text={'New Game'} onClick={this.startNewGame} />
                    </div>
                </div>
                <Board setCurrentScore={this.setCurrentScore} />
            </div>
        );
    }
}

export default GameComponent;