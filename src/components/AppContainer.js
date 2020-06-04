import React, { useEffect } from 'react';
import Footer from './Footer';
import setBoardsHeightEqualToWidth from '../utility/setBoardsHeightEqualToWidth';

function AppContainer(props) {
    useEffect(() => {
        window.addEventListener('resize', setBoardsHeightEqualToWidth);
        return () => {
            window.removeEventListener('resize', setBoardsHeightEqualToWidth);
        }
    }, [])

    return (
        <div className="app-container">
            <div className='side-bar'></div>
            <div className='main-area-container'>
                <div className='content-wrapper'>
                    {props.children}
                </div>
                <div className='footer-wrapper'>
                    <Footer />
                </div>
            </div>
            <div className='side-bar'></div>
        </div>
    );
}

export default AppContainer;