import React from 'react';

export default ({ title, score }) => (
    <div className='score-rectangle__wrapper'>
        <div className='score-rectangle__title'>{title}</div>
        <div className='score-rectangle__score'>{score}</div>
    </div>
);