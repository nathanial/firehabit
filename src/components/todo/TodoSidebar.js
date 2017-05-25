import React from 'react';
import styled from 'styled-components';
import {Button} from '@blueprintjs/core';
import {appState} from "../../util";

const Wrapper = styled.div`
	margin-left: 10px;
	& > .add-column-btn {
	}
`;

const InnerWrapper = styled.div`
	display: inline-block;
	padding: 2px;
`;


export default class TodoSidebar extends React.Component {
	render(){
		return (
			<Wrapper>
				<InnerWrapper className="pt-card">
					<Button className="add-column-btn pt-intent-success" iconName="plus" onClick={this.onAddColumn}></Button>
				</InnerWrapper>
			</Wrapper>
		);
	}

	onAddColumn = () => {
		appState.addTodoColumn('New Column');
	}
}