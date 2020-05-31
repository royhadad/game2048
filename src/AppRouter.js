import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import MainPage from './components/MainPage';
import NotFoundPage from './components/NotFoundPage';
import Footer from './components/Footer';

export const RedirectToMainPage = () => {
    window.scrollTo(0, 0);
    history.push('/');
    return null;
}
export const history = createBrowserHistory();

const AppRouter = () => (
    <Router history={history}>
        <Switch>
            <Route path="/" component={MainPage} exact={true} />
            <Route path="/index.html" component={RedirectToMainPage} exact={true} />
            <Route component={NotFoundPage} />
        </Switch>
        <Footer />
    </Router>
);

export default AppRouter;
