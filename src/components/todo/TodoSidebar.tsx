import * as React from 'react';
import styled from 'styled-components';
import {Button} from '@blueprintjs/core';
import {db} from "../../util";

const Wrapper = styled.div`
	margin-left: 10px;
`;

const InnerWrapper = styled.div`
	display: inline-block;
	padding: 2px;
`;


export default class TodoSidebar extends React.Component<{},{}> {
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
		db.addTodoColumn('New Column');
	}
}