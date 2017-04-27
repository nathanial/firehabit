import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {state, auth} from "./util";

async function init(){
	await auth.init();
	state.loggedIn = auth.loggedIn();
	ReactDOM.render(
		<App />,
		document.getElementById('root')
	);
}

init();
