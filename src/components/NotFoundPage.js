import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className='not-found-page'>
        <h1>
            404 page not found, click <Link to={'/'}>here</Link> to get back to safety
        </h1>
    </div>
);

export default NotFoundPage;