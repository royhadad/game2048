import React from 'react';
import Footer from './Footer';

function AppContainer(props) {
    // useEffect(() => {
    //     //add event listener
    //     return () => {
    //         //remove event listener
    //     }
    // }, [])

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