import createBrowserHistory from 'history/createBrowserHistory'
import {AppState} from "./state/AppState";

export const history = createBrowserHistory();
export const appState = new AppState();
