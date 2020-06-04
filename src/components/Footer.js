import React from 'react';
import { Link } from 'react-router-dom';

export default (props) => (
    <div className='footer'>
        <span><b>2048</b></span>·
        <a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ' target="_blank" rel="noopener noreferrer">Surprise</a>·
        <a href='https://www.youtube.com/watch?v=A3ytTKZf344' target="_blank" rel="noopener noreferrer">Shark</a>·
        <a href='https://www.youtube.com/watch?v=MNyG-xu-7SQ' target="_blank" rel="noopener noreferrer">Wake Up</a>·
        <a href='https://www.youtube.com/watch?v=J---aiyznGQ' target="_blank" rel="noopener noreferrer">Cat</a>·
        <Link to='/approved.html'>Approved</Link>
    </div>
)