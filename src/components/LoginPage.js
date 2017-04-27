import React from 'react';
import {auth} from '../util';

export default class LoginPage extends React.Component {
	render(){
		return (
			<div>
			</div>
		);
	}

	componentDidMount(){
		if(!auth.loggedIn()){
			auth.login();
		}
	}
}