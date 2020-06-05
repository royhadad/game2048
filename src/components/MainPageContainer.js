import React from 'react';
import GameComponent from './game/GameComponent';
import { Link } from 'react-router-dom';

export default (props) => (
    <div className='main-page-container'>
        <GameComponent />
        <div className='main-page-bottom'>
            <p>
                <b>HOW TO PLAY:</b> Use your <b>arrow keys</b> to move the tiles. When two tiles with the same number touch, they <b>merge into one!</b>
            </p>
            <p>
                Share with friends<br />
                <span className='twitter-share-button'>Tweet</span> <span className='facebook-share-button'>Facebook</span>
            </p>
            <p>
                - Do you still have free time after playing 2048?<br />
                - If <b>NO</b>, <a href='http://hmpg.net'>click here</a> or play <a href='https://www.goodoldtetris.com/'>Tetris Online</a><br />
                - If <b>YES</b>, why don't you check the footer :)?
            </p>
            <hr />
            <h1>
                Learn more about 2048 Game
            </h1>
            <div className='links-squares__wrapper'>
                <div className='links-squares__collumn'>
                    <div className='link-square'><Link to='/tips-and-tricks'>{`Tips & Tricks`}</Link></div>
                    <div className='link-square'><Link to='/quotes'>2048 Quotes</Link></div>
                </div>
                <div className='links-squares__collumn'>
                    <div className='link-square'><Link to='/videos'>2048 Videos</Link></div>
                    <div className='link-square'><Link to='/variations'>2048 Variations</Link></div>
                </div>
            </div>
            <p>
                <b>2048</b> is an easy and fun puzzle game. Even if you don't love numbers you will love this game. It is played on a 4x4 grid using the arrows or W, A, S, D keys alternatively. Every time you press a key - all tiles slide. Tiles with the same value that bump into one-another are merged. Although there might be an optimal strategy to play, there is always some level of chance. If you beat the game and would like to master it, try to finish with a smaller score. That would mean that you finished with less moves.
            </p>
            <p>
                This game is mobile compatible and you can play it on any device - iPhone, iPad or any other smartphone.
            </p>
            <p>
                Common <Link to='/questions-and-answers'>questions and answers</Link> about 2048.<br />
                Learn all about <i>2048</i>'s history on <a href='https://en.wikipedia.org/wiki/2048_(video_game)' target="_blank" rel="noopener noreferrer">wikipedia</a>.<br />
                2048 <Link to='/news'>news references</Link>
            </p>
            <hr />
        </div>
    </div>
)