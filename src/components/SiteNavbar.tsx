import * as _ from 'lodash';
import * as React from 'react';
import PropTypes from 'prop-types';
import {db, history} from '../util';
import {Button, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core';
import * as firebase from 'firebase';

type Props = {
	path: string;
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
			<nav className="pt-navbar pt-dark" {..._.omit(this.props, ['onNavigate', 'path'])}>
				<div className="pt-navbar-group pt-align-left">
					<div className="pt-navbar-heading">FireHabit</div>
					<span className="pt-navbar-divider" />
					<NavBtn goto="calories" icon="pt-icon-heart" active={path === '/' || path === '/calories'} onNavigate={this.props.onNavigate}>Calories</NavBtn>
					<NavBtn goto="todo" icon="pt-icon-th" active={path === '/todo'} onNavigate={this.props.onNavigate}>Todo</NavBtn>
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
				<button className="pt-button pt-minimal pt-icon-user" type="button">{db.user.email}</button>
			</Popover>
		);
	}
}