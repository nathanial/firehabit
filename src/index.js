import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {state} from "./util";
import firebase from 'firebase';

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
				state.loggedIn = true;
				console.log("User", user);
				state.user.name = user.name;
				state.user.email = user.email;
				resolve();
				// User is signed in.
			} else {
				if(firebase.auth().currentUser){
					console.log("GOT USER");
					state.loggedIn = true;
					resolve();
					return;
				}
				const provider = new firebase.auth.GoogleAuthProvider();
				try {
					const result = await firebase.auth().signInWithPopup(provider)
					const user = result.user;
					console.log("User", user);
					state.loggedIn = true
					resolve();
				} catch(error){
					console.error(error);
					state.loggedIn = false;
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
			name: user.displayName,
			foodEntries: []
		});
	}
}

async function init(){
	await loginToFirebase();
	await setInitialData();
	ReactDOM.render(
		<App />,
		document.getElementById('root')
	);
}

init();
