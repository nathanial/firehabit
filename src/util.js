import createBrowserHistory from 'history/createBrowserHistory'
import {observable} from "../node_modules/mobx/lib/mobx";
export const history = createBrowserHistory();

class AppState {
	loggedIn = observable(false);
	foodEntries = observable([]);
	user = observable({
		name: '',
		email: ''
	})
}

export const appState = new AppState();
