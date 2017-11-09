import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {db, history} from "./util";
import {generatePushID} from './db/util';
import * as firebase from 'firebase';
import {state, AppState} from './state';

// Initialize Firebase
var config = {
	apiKey: "AIzaSyB8MpJg-KhRzFrc7nWEgbwWx3An27lLMx4",
	authDomain: "personal-life-tracker.firebaseapp.com",
	databaseURL: "https://personal-life-tracker.firebaseio.com",
	projectId: "personal-life-tracker",
	storageBucket: "personal-life-tracker.appspot.com",
	messagingSenderId: "892752440591"
};
firebase.initializeApp(config);

async function loginToFirebase(){
	return new Promise((resolve, reject) => {
		firebase.auth().onAuthStateChanged(async function(user) {
			if (user) {
				db.loggedIn = true;
				db.user.name = user.name;
				db.user.email = user.email;
				resolve();
				// User is signed in.
			} else {
				if(firebase.auth().currentUser){
					db.loggedIn = true;
					resolve();
					return;
				}
				const provider = new firebase.auth.GoogleAuthProvider();
				try {
					await firebase.auth().signInWithRedirect(provider)
					db.loggedIn = true;
					resolve();
				} catch(error){
					console.error(error);
					db.loggedIn = false;
					reject();
				}
			}
		});
	});
}

async function setInitialData(){
	const user = firebase.auth().currentUser;
	const userId = user.uid;
	const userRef = firebase.database().ref(`/users/${userId}`);
	const userSnapshot = await userRef.once('value');
	const userData = userSnapshot.val();
	if(_.isNull(userData)){
		await userRef.set({
			name: user.displayName
		});
	}
}

function loadDay(appState: AppState){
	if(!_.some(appState.calories.days, d => d.date ===  appState.calories.selectedDate)){
		appState.calories.days.push({id: generatePushID(), date: appState.calories.selectedDate, consumed: [], weight: 0});
	}
}

async function init(){
	await loginToFirebase();
	await setInitialData();
	await db.load();
	const appState = state.get();
	loadDay(appState);
	ReactDOM.render(
		<App appState={appState} />,
		document.getElementById('root')
	);

}

init();

state.on('update', () => {
	const appState = state.get();
	loadDay(appState);
	ReactDOM.render(<App appState={appState} />, document.getElementById('root'));
});

history.listen(() =>{
	const appState = state.get();
	loadDay(appState);
	ReactDOM.render(<App appState={appState} />, document.getElementById('root'));
});
