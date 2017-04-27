import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {history} from '../util';
const SiteNavbarContainer = styled.div`
	border-bottom: 1px solid black;
	padding: 10px;
	text-align: left;
	background: white;
`;

const NavbarButton = styled.div`
	background: white;
	border: 1px solid black;
	display: inline-block;
	padding: 5px 15px;
	margin: 0 5px;
	cursor: pointer;
	background: ${(props) => props.active ? 'red' : 'white'}
`;

export default class SiteNavbar extends React.Component {

	static propTypes = {
		onNavigate: PropTypes.func.isRequired
	}

	render(){
		const path = history.location.pathname;
		return (
			<SiteNavbarContainer>
				<NavbarButton active={path === '/' || path === '/habits'} onClick={() => this.goto('habits')}>Habits</NavbarButton>
				<NavbarButton active={path === '/calories'} onClick={() => this.goto('calories')}>Calories</NavbarButton>
				<NavbarButton active={path === '/todo'} onClick={() => this.goto('todo')}>TODO</NavbarButton>
				<NavbarButton active={path === '/notes'} onClick={() => this.goto('notes')}>Notes</NavbarButton>
				<NavbarButton active={path === '/schedule'} onClick={() => this.goto('schedule')}>Schedule</NavbarButton>
			</SiteNavbarContainer>
		);
	}

	goto = (tab) => {
		this.props.onNavigate(tab);
	}
}