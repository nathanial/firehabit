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

type UserSectionProps = {
	user?: any;
}

type NavProps = {
	className?: string;
	style?: any;
	goto: string;
	icon: string;
	active: boolean;
	navIconStyle?: any;
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

class NavBtn extends React.PureComponent<NavProps, {}> {
	render(){
		const props = this.props;
		const classes = ["nav-btn"];
		if(props.active){
			classes.push('active');
		}
		if(props.className){
			classes.push(props.className);
		}
		return (
			<div onClick={() => props.onNavigate(props.goto)}
				className={classes.join(' ')}
				style={this.props.style}>
				<img className="nav-icon" style={props.navIconStyle} src={this.props.icon} />
				<span className="nav-text">{props.children}</span>
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
				<Button className="pt-intent-success pt-icon-log-in" style={{marginTop:-3}} onClick={login}>
					Login
				</Button>
			);
		}

		const compassMenu = (
			<Menu>
				<MenuItem iconName="log-out" text="Logout" onClick={logout} />
			</Menu>
		);

		const renderGravatar = () => {
			if(!this.props.user.email){
				return (
					<span style={{display: 'inline-block', position:'relative', padding: 4}}>Anonymous</span>
				);
			}
			return (
				<Gravatar email={this.props.user.email} className={gravatarClass} />
			);
		}
		return (
			<Popover content={compassMenu} position={Position.BOTTOM}>
				<button className="pt-button pt-minimal" type="button">
					{renderGravatar()}
				</button>
			</Popover>
		);
	}
}

class SiteLogo extends React.PureComponent<{},{}> {
	render(){
		return (
			<div className="site-logo pt-navbar-heading">
				<img src="icons/FireHabitLogo.png" />
				<span>Fire Habit</span>
			</div>
		);
	}
}

class NavSection extends React.PureComponent<Props,{}> {
	render(){
		const {path} = this.props;
		if(!this.props.user){
			return <div />;
		}
		const caloriesStyle = {
			width: 22,
			height: 22,
			position: 'absolute',
			left: 5,
			top: 3
		};
		const todosStyle = {
			width:25,
			height:25,
			position: 'absolute',
			left: 5,
			top: 1
		};
		const notesStyle = {
			width:25,
			height:25,
			position: 'absolute',
			left: 5,
			top: 1
		};
		const scheduleStyle = {
			width:25,
			height:25,
			position: 'absolute',
			left: 5,
			top: 1
		};
		return (
			<div className="nav-section">
				<NavBtn className="calories-nav-btn" navIconStyle={caloriesStyle} style={{width:95}} goto="calories" icon="icons/Board.png" active={path === '/calories'} onNavigate={this.props.onNavigate}>Calories</NavBtn>
				<NavBtn className="todo-nav-btn" goto="" navIconStyle={todosStyle} style={{width:88}} icon="icons/Goal.png" active={path === '/' || path === '/todo'} onNavigate={this.props.onNavigate}>Todos</NavBtn>
				<NavBtn className="notes-nav-btn" goto="notes" style={{width:88}} navIconStyle={notesStyle} icon="icons/open-textbook.png" active={path === '/notes'} onNavigate={this.props.onNavigate}>Notes</NavBtn>
				<NavBtn className="schedule-nav-btn" goto="schedule" style={{width:105}} navIconStyle={scheduleStyle} icon="icons/Calendar.png" active={path === '/schedule'} onNavigate={this.props.onNavigate}>Schedule</NavBtn>
			</div>
		);
	}
}

class UserSection extends React.PureComponent<UserProps,{}>{
	render(){
		return (
			<div className="user-section">
				<span className="username">{_.get(this.props.user, 'name')}</span>
				<UserDropdown user={this.props.user} />
			</div>
		);
	}
}

export default class SiteNavbar extends React.PureComponent<Props, {}> {
	render(){
		const {path} = this.props;
		return (
			<nav className="site-navbar" {..._.omit(this.props, ['onNavigate', 'path', 'user'])}>
				<SiteLogo />
				<NavSection {...this.props} />
				<div style={{position: 'absolute', top: 7, right: 190}}>
					{this.props.children}
				</div>
				<UserSection user={this.props.user} />
			</nav>
		);
	}

}
