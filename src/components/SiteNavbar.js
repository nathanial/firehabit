import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {history} from '../util';

export default class SiteNavbar extends React.Component {
	static propTypes = {
		onNavigate: PropTypes.func.isRequired
	}

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
			<nav className="pt-navbar pt-dark" {..._.omit(this.props, _.keys(SiteNavbar.propTypes))}>
				<div className="pt-navbar-group pt-align-left">
					<div className="pt-navbar-heading">FireHabit</div>
					<span className="pt-navbar-divider"></span>
					<NavBtn goto="habits" icon="pt-icon-pulse" active={(path === '/' || path === '/habits')}>Habits</NavBtn>
					<NavBtn goto="calories" icon="pt-icon-heart" active={path === '/calories'}>Calories</NavBtn>
					<NavBtn goto="todo" icon="pt-icon-th" active={path === '/todo'}>TODO</NavBtn>
					<NavBtn goto="notes" icon="pt-icon-projects" active={path === '/notes'}>Notes</NavBtn>
					<NavBtn goto="schedule" icon="pt-icon-calendar" active={path === '/schedule'}>Schedule</NavBtn>
				</div>
				<div className="pt-navbar-group pt-align-right">
					<button className="pt-button pt-minimal pt-icon-user"></button>
					<button className="pt-button pt-minimal pt-icon-cog"></button>
				</div>
			</nav>
		);
	}
}