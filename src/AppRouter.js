import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import NotFoundPage from './components/NotFoundPage';
import AppContainer from './components/AppContainer';
import MainPageContainer from './components/MainPageContainer';

export const RedirectToMainPage = () => {
    window.scrollTo(0, 0);
    history.push('/');
    return null;
}
export const history = createBrowserHistory();

const AppRouter = () => (
    <Router history={history}>
        <AppContainer>
            <Switch>
                <Route path="/" component={MainPageContainer} exact={true} />
                <Route path="/index.html" component={RedirectToMainPage} exact={true} />
                <Route component={NotFoundPage} />
            </Switch>
        </AppContainer>
    </Router>
);

export default AppRouter;
