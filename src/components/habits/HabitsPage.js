import React from 'react';
import styled from 'styled-components';
import {appState} from '../../util';
import {Button} from "@blueprintjs/core";

const HabitsPageWrapper = styled.div`
	& > h1 {
		margin-top: 30px;
	}
`;

const DailiesListWrapper = styled.div`
	margin-top: 30px;
`;

class DailiesList extends React.Component {
	render(){
		const dailies = appState.dailies;
		return (
			<DailiesListWrapper>
				{dailies.map((entry, index) => {
					return <div></div>;
				})}
				<Button>Add Daily...</Button>
			</DailiesListWrapper>
		);
	}
}

export default class HabitsPage extends React.Component {
	render(){
		return (
			<HabitsPageWrapper>
				<DailiesList></DailiesList>
			</HabitsPageWrapper>
		);
	}
}
