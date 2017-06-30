import * as _ from 'lodash';
import * as React from 'react';
import PropTypes from 'prop-types';
import {db, history} from '../util';
import {Button, Menu, MenuDivider, MenuItem, Popover, Position} from '@blueprintjs/core';
import * as firebase from 'firebase';

interface Props {
	onNavigate(path: string);
}

export default class SiteNavbar extends React.Component<Props, {}> {
	render(){
		const path = history.location.pathname;

		const NavBtn = (props) => {
			return (
				<button onClick={() => this.props.onNavigate(props.goto)}
						className={"pt-button pt-minimal " + props.icon + " " + (props.active ? 'pt-active' : '')}>
					{props.children}
				</button>
			);
		};

		return (
			<nav className="pt-navbar pt-dark" {..._.omit(this.props, ['onNavigate'])}>
				<div className="pt-navbar-group pt-align-left">
					<div className="pt-navbar-heading">FireHabit</div>
					<span className="pt-navbar-divider" />
					<NavBtn goto="habits" icon="pt-icon-pulse" active={(path === '/' || path === '/habits')}>Habits</NavBtn>
					<NavBtn goto="today" icon="pt-icon-calendar" active={path === '/today'}>Today</NavBtn>
					<NavBtn goto="calories" icon="pt-icon-heart" active={path === '/calories'}>Calories</NavBtn>
					<NavBtn goto="todo" icon="pt-icon-th" active={path === '/todo'}>Todo</NavBtn>
				</div>
				<div className="pt-navbar-group pt-align-right">
					{this.renderUserDropdown()}
				</div>
			</nav>
		);
	}

	renderUserDropdown(){
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