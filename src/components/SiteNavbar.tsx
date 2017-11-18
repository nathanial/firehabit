import * as _ from 'lodash';
import * as React from 'react';
import PropTypes from 'prop-types';
import {history} from '../util';
import {Button, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core';
import * as firebase from 'firebase';
import TodoTopbar from './todo/TodoTopbar';
import * as Gravatar from 'react-gravatar';
import cxs from 'cxs';

type Props = {
	path: string;
	user: any;
	onNavigate(path: string)
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

const siteNavbarClass = cxs({
	background: '#273142',
	display: 'block',
	width: '100%',
	height: '50px',
	padding: '0 20px'
});

const navBtnClass = cxs({
	borderRadius: 0,
	cursor: 'pointer',
	background: '#222C3C',
	width: '100px',
	padding: '7px 20px',
	display: 'inline-block',
	fontSize: '12px',
	border: '1px solid transparent'
});

const navBtnActiveClass = cxs({
	background: '#245785',
	border: '1px solid #1A91EB'
});

const navItemsClass = cxs({
	border: '1px solid #313D4F'
})

class NavBtn extends React.PureComponent<NavProps, {}> {
	render(){
		const props = this.props;
		return (
			<div onClick={() => props.onNavigate(props.goto)}
					className={(props.active ? navBtnActiveClass : '') + " " + navBtnClass}>
				<span style={{marginRight: '10px'}} className={`pt-icon-small ${this.props.icon}`}></span>
				{props.children}
			</div>
		);
	}
}

export default class SiteNavbar extends React.PureComponent<Props, {}> {
	render(){
		const {path} = this.props;
		return (
			<nav className={`${siteNavbarClass}`} {..._.omit(this.props, ['onNavigate', 'path', 'user'])}>
				<div className="pt-navbar-group pt-align-left">
					<div className="pt-navbar-heading" style={{height: '32px', display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'center'}}>
						<img style={{height:32, marginRight: 10}} src="icons/FireHabitLogo.png" />
						<span>Fire Habit</span>
					</div>
					<span className="pt-navbar-divider" />
					<div className={navItemsClass}>
						<NavBtn goto="calories" icon="pt-icon-heart" active={path === '/calories'} onNavigate={this.props.onNavigate}>Calories</NavBtn>
						<NavBtn goto="" icon="pt-icon-th" active={path === '/' || path === '/todo'} onNavigate={this.props.onNavigate}>Todo</NavBtn>
						{/* <NavBtn goto="notes" icon="pt-icon-text" active={path === '/notes'} onNavigate={this.props.onNavigate}>Notes</NavBtn> */}
					</div>
				</div>
				<div className="pt-navbar-group pt-align-left">
					<span className="pt-navbar-divider" />
					{this.props.children}
				</div>
				<div className="pt-navbar-group pt-align-right">
					{this.renderUserDropdown()}
				</div>
			</nav>
		);
	}

	private renderUserDropdown(){
		const logout = async () => {
			await firebase.auth().signOut();
			window.location.reload();
		};

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
