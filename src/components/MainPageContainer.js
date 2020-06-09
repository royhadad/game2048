import React from 'react';
import GameComponent from './game/GameComponent';

export default (props) => (
    <div className='main-page-container'>
        <GameComponent />
        <div className='main-page-bottom'>
            <p>
                <b>HOW TO PLAY:</b> Use your <b>arrow keys</b> to move the tiles. When two tiles with the same number touch, they <b>merge into one!</b>
            </p>
            <p>
                Share with friends<br />
                <span className='share-buttons-wrapper'>
                    <a className="twitter-share-button" href="https://twitter.com/share?ref_src=twsrc%5Etfw" data-show-count="false" target="_blank" rel="noopener noreferrer">Tweet</a><script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
                    <iframe className="facebook-share-button" title='facebook-share-button' src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Froy-game2048.herokuapp.com&layout=button&size=large&width=77&height=28&appId" width="77" height="28" style={{ border: 'none', overflow: 'hidden' }} scrolling="no" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                </span>
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
                    <div className='link-square'><a href='https://2048game.com/tips-and-tricks'>{`Tips & Tricks`}</a></div>
                    <div className='link-square'><a href='https://2048game.com/quotes'>2048 Quotes</a></div>
                </div>
                <div className='links-squares__collumn'>
                    <div className='link-square'><a href='https://2048game.com/videos'>2048 Videos</a></div>
                    <div className='link-square'><a href='https://2048game.com/variations'>2048 Variations</a></div>
                </div>
            </div>
            <p>
                <b>2048</b> is an easy and fun puzzle game. Even if you don't love numbers you will love this game. It is played on a 4x4 grid using the arrows or W, A, S, D keys alternatively. Every time you press a key - all tiles slide. Tiles with the same value that bump into one-another are merged. Although there might be an optimal strategy to play, there is always some level of chance. If you beat the game and would like to master it, try to finish with a smaller score. That would mean that you finished with less moves.
            </p>
            <p>
                This game is mobile compatible and you can play it on any device - iPhone, iPad or any other smartphone.
            </p>
            <p>
                Common <a href='https://2048game.com/questions-and-answers'>questions and answers</a> about 2048.<br />
                Learn all about <i>2048</i>'s history on <a href='https://en.wikipedia.org/wiki/2048_(video_game)' target="_blank" rel="noopener noreferrer">wikipedia</a>.<br />
                2048 <a href='https://2048game.com/news'>news references</a>
            </p>
            <hr />
        </div>
    </div >
)