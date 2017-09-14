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

const emailClass = cxs({
	marginLeft: '10px',
	position: 'relative',
	top: '-5px'
});

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
					<div className="pt-navbar-heading" style={{height: '32px', display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'center'}}>
						<img style={{height:32, marginRight: 10}} src="icons/FireHabitLogo.png" />
						<span>Fire Habit</span>
					</div>
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
				<MenuItem iconName="log-out" text="Logout" onClick={logout} />
			</Menu>
		);
		return (
			<Popover content={compassMenu} position={Position.BOTTOM}>
				<button className="pt-button pt-minimal" type="button">
					<Gravatar email={this.props.user.email} className={gravatarClass} />
					<span className={emailClass}>{this.props.user.email}</span>
				</button>
			</Popover>
		);
	}
}