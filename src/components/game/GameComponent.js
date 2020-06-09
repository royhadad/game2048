import React from 'react';
import ScoreRectangle from '../generics/ScoreRectangle';
import Button from '../generics/Button';
import Board from './Board';
import { max } from 'mathjs';
import Cookies from 'js-cookie';

class GameComponent extends React.Component {
    constructor(props) {
        super(props);
        this.currentScoreRef = React.createRef();
        this.gameWrapperRef = React.createRef();
    }

    state = {
        currentScore: 0,
        bestScore: Cookies.get('highScore') ? parseInt(Cookies.get('highScore')) : 0
    }

    componentDidMount() {
        this.scoreAnimationElement = document.createElement('div');
        this.scoreAnimationElement.setAttribute('class', 'transition-animation-element');
        this.gameWrapperRef.current.appendChild(this.scoreAnimationElement);
    }

    startNewGame = () => { }

    setNewGameButton = (startNewGameFunction) => {
        this.startNewGame = startNewGameFunction;
    }

    setCurrentScore = (currentScore) => {
        this.setState((prevState) => {
            if (currentScore > prevState.currentScore) {
                this.animateScoreAddition(currentScore - prevState.currentScore);
            }
            const newBestScore = max(prevState.bestScore, currentScore);
            if (newBestScore > prevState.bestScore) {
                Cookies.set("highScore", `${newBestScore}`, { expires: 100000000000000 });
            }
            return {
                currentScore,
                bestScore: newBestScore
            }
        });
    }

    animateScoreAddition = (amountAdded) => {
        const moveToStart = (scoreAnimationElement, currentScoreElementRef) => {
            const currentScoreElementRect = currentScoreElementRef.current.getBoundingClientRect();
            const scoreAnimationElementRect = scoreAnimationElement.getBoundingClientRect();
            scoreAnimationElement.style.transitionDuration = '0ms';
            scoreAnimationElement.style.opacity = `100%`;
            scoreAnimationElement.style.top = `${(currentScoreElementRect.top + document.documentElement.scrollTop) + currentScoreElementRect.height / 2 - scoreAnimationElementRect.height / 2}px`;
            scoreAnimationElement.style.left = `${(currentScoreElementRect.left + document.documentElement.scrollLeft) + currentScoreElementRect.width / 2 - scoreAnimationElementRect.width / 2}px`;
        }
        const moveToEndOfTransition = (scoreAnimationElement, gameWrapperRef) => {
            const topOfGameWrapper = gameWrapperRef.current.getBoundingClientRect().top;
            scoreAnimationElement.style.transitionDuration = '1000ms';
            scoreAnimationElement.style.opacity = `0%`;
            scoreAnimationElement.style.top = `${topOfGameWrapper}px`;
        }

        this.scoreAnimationElement.innerText = `+${amountAdded}`;
        moveToStart(this.scoreAnimationElement, this.currentScoreRef);
        moveToEndOfTransition(this.scoreAnimationElement, this.gameWrapperRef);
    }

    render() {
        return (
            <div className='game-wrapper' ref={this.gameWrapperRef}>
                <div className='game-ui'>
                    <div className='game-ui-top'>
                        <div className='game-ui-top-left'>
                            2048
                        </div>
                        <div className='game-ui-top-right'>
                            <ScoreRectangle title='score' score={this.state.currentScore} ref={this.currentScoreRef} />
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
                <Board setCurrentScore={this.setCurrentScore} setNewGameButton={this.setNewGameButton} />
            </div>
        );
    }
}

export default GameComponent;