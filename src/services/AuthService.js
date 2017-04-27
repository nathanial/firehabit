import Auth0Lock from 'auth0-lock'
import { state, history } from '../util'


export default class AuthService {
	constructor(clientId, domain) {
		// Configure Auth0
		this.clientId = clientId;
		this.domain = domain;
	}

	init(){
		return new Promise((resolve, reject) => {
			this.lock = new Auth0Lock(this.clientId, this.domain, {
				auth: {
					redirectUrl: 'http://localhost:3000/login',
					responseType: 'token'
				}
			});
			if(this.loggedIn()){
				resolve();
				return;
			}
			setTimeout(() => {
				if(!this.loggedIn()){
					this.login();
				}
			}, 1000);
			// Add callback for lock `authenticated` event
			this.lock.on('authenticated', (authResult) => {
				// Saves the user token
				this.setToken(authResult.idToken)
				// navigate to the home route
				history.replace('/');
				state.loggedIn = true;
				resolve();
			});
			// binds login functions to keep this context
			this.login = this.login.bind(this);
		});
	}

	login() {
		// Call the show method to display the widget.
		this.lock.show()
	}

	loggedIn() {
		// Checks if there is a saved token and it's still valid
		return !!this.getToken()
	}

	setToken(idToken) {
		// Saves user token to local storage
		localStorage.setItem('id_token', idToken)
	}

	getToken() {
		// Retrieves the user token from local storage
		return localStorage.getItem('id_token')
	}

	logout() {
		// Clear user token and profile data from local storage
		localStorage.removeItem('id_token');
		state.loggedIn = false;
	}
}