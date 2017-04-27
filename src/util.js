import createBrowserHistory from 'history/createBrowserHistory'
import {observable} from "../node_modules/mobx/lib/mobx";
export const history = createBrowserHistory();

class State {
	loggedIn = observable(false);
	foodEntries = observable([]);
	user = observable({
		name: '',
		email: ''
	})
}

export const state = new State();
