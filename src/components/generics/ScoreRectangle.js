import React from 'react';

export default React.forwardRef(({ title, score }, ref) => (
    <div className='score-rectangle__wrapper'>
        <div className='score-rectangle__title'>{title}</div>
        <div className='score-rectangle__score' ref={ref}>{score}</div>
    </div>
));