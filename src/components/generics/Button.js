import React from 'react';

export default ({ text, onClick }) => (
    <div className='button' onClick={onClick}>
        {text}
    </div>
)