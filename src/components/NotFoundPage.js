import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className='not-found-page'>
        404 page not found, click <Link to={'/'}>here</Link> to get back to safety
    </div>
);

export default NotFoundPage;