import createBrowserHistory from 'history/createBrowserHistory'
import AuthService from './services/AuthService';
export const history = createBrowserHistory();
export const auth = new AuthService('kN2pjFvY3nrSUBIvMrpeJ5DIu7QFhdJZ', 'habit-tracker.auth0.com');