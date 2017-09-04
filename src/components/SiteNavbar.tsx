import * as _ from 'lodash';
import * as React from 'react';
import PropTypes from 'prop-types';
import {history} from '../util';
import {Button, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core';
import * as firebase from 'firebase';
import TodoTopbar from './todo/TodoTopbar';

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

class NavBtn extends React.PureComponent<NavProps, {}> {
	render(){
		const props = this.props;
		return (
			<button onClick={() => props.onNavigate(props.goto)}
					className={"pt-button pt-minimal " + props.icon + " " + (props.active ? 'pt-active' : '')}>
				{props.children}
			</button>
		);
	}
}

export default class SiteNavbar extends React.PureComponent<Props, {}> {
	render(){
		const {path} = this.props;
		return (
			<nav className="pt-navbar pt-dark" {..._.omit(this.props, ['onNavigate', 'path', 'user'])}>
				<div className="pt-navbar-group pt-align-left">
					<div className="pt-navbar-heading">Fire Habit</div>
					<span className="pt-navbar-divider" />
					<NavBtn goto="calories" icon="pt-icon-heart" active={path === '/calories'} onNavigate={this.props.onNavigate}>Calories</NavBtn>
					<NavBtn goto="" icon="pt-icon-th" active={path === '/' || path === '/todo'} onNavigate={this.props.onNavigate}>Todo</NavBtn>
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
				<MenuItem iconName="logout" text="Logout" onClick={logout} />
			</Menu>
		);
		return (
			<Popover content={compassMenu} position={Position.BOTTOM}>
				<button className="pt-button pt-minimal pt-icon-user" type="button">{this.props.user.email}</button>
			</Popover>
		);
	}
}