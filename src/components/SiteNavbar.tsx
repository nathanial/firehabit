import * as _ from 'lodash';
import * as React from 'react';
import PropTypes from 'prop-types';
import {history} from '../util';
import {Icon, Button, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core';
import * as firebase from 'firebase';
import TodoTopbar from './todo/TodoTopbar';
import * as Gravatar from 'react-gravatar';
import cxs from 'cxs';
import {loginToFirebase} from '../db/DB';
import {db} from '../util';

type Props = {
	path?: string;
	user?: any;
	onNavigate?(path: string)
};

type NavProps = {
	goto: string;
	icon: string;
	active: boolean;
	onNavigate(path: string);
};


const gravatarClass = cxs({
	display: 'inline-block',
	height: '30px',
	width: 'auto',
	position: 'relative',
	top: '5px',
	borderRadius: '50%'
});

const navItemsClass = cxs({
	border: '1px solid #313D4F'
})

class NavBtn extends React.PureComponent<NavProps, {}> {
	render(){
		const props = this.props;
		const classes = ["nav-btn"];
		if(props.active){
			classes.push('active');
		}
		return (
			<div onClick={() => props.onNavigate(props.goto)}
					className={classes.join(' ')}>
				<span style={{marginRight: '10px'}} className={`pt-icon-small ${this.props.icon}`}></span>
				{props.children}
			</div>
		);
	}
}

type UserProps = {
	user: any;
}

class UserDropdown extends React.PureComponent<UserProps,{}>{
	render(){
		const logout = async () => {
			await firebase.auth().signOut();
			window.location.reload();
		};
		
		const login = async () => {
			await loginToFirebase(db);
		};

		if(!this.props.user){
			return (
				<Button className="pt-intent-success pt-icon-log-in" onClick={login}>
					Login
				</Button>
			);
		}

		const compassMenu = (
			<Menu>
				<MenuItem iconName="log-out" text="Logout" onClick={logout} />
			</Menu>
		);
		return (
			<Popover content={compassMenu} position={Position.BOTTOM}>
				<button className="pt-button pt-minimal" type="button">
					<Gravatar email={this.props.user.email} className={gravatarClass} />
				</button>
			</Popover>
		);
	}
}

export default class SiteNavbar extends React.PureComponent<Props, {}> {
	render(){
		const {path} = this.props;
		return (
			<nav className="site-navbar" {..._.omit(this.props, ['onNavigate', 'path', 'user'])}>
				<div className="pt-navbar-group pt-align-left">
					<div className="pt-navbar-heading" style={{height: '32px', display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'center'}}>
						<img style={{height:32, marginRight: 10}} src="icons/FireHabitLogo.png" />
						<span>Fire Habit</span>
					</div>
					{this.renderNavbar()}
				</div>
				<div className="pt-navbar-group pt-align-left">
					<span className="pt-navbar-divider" />
					{this.props.children}
				</div>
				<div className="pt-navbar-group pt-align-right">
					<UserDropdown user={this.props.user} />
				</div>
			</nav>
		);
	}

	private renderNavbar(){
		const {path} = this.props;
		if(!this.props.user){
			return;
		}
		return [
			<span key="divider" className="pt-navbar-divider" />,
			<div key="nav-btns" className={navItemsClass}>
				<NavBtn goto="calories" icon="pt-icon-heart" active={path === '/calories'} onNavigate={this.props.onNavigate}>Calories</NavBtn>
				<NavBtn goto="" icon="pt-icon-th" active={path === '/' || path === '/todo'} onNavigate={this.props.onNavigate}>Todo</NavBtn>
				<NavBtn goto="notes" icon="pt-icon-highlight" active={path === '/notes'} onNavigate={this.props.onNavigate}>Notes</NavBtn>
				<NavBtn goto="schedule" icon="pt-icon-calendar" active={path === '/schedule'} onNavigate={this.props.onNavigate}>Schedule</NavBtn>
			</div>
		];
	}

}
