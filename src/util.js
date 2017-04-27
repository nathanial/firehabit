import createBrowserHistory from 'history/createBrowserHistory'
import AuthService from './services/AuthService';
import {observable} from "../node_modules/mobx/lib/mobx";
export const history = createBrowserHistory();
export const auth = new AuthService('kN2pjFvY3nrSUBIvMrpeJ5DIu7QFhdJZ', 'habit-tracker.auth0.com');

class State {
	loggedIn = observable(false);
}

export const state = new State();
