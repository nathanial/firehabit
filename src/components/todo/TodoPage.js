import React from 'react';
import {appState} from '../../util';
import {Button, EditableText} from "@blueprintjs/core";
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoColumn from "./TodoColumn";

const TodoPageWrapper = styled.div`
	display: block;
	text-align: left;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	padding: 15px;
	white-space: nowrap;
	
	& > .add-column-btn {
		margin-left: 10px;
		margin-top: 10px;
	}
`;

const ColumnsContainer = styled.div`
	
`;

export default observer(class TodoPage extends React.Component {
	render(){
		const todoColumns = appState.todoColumns;
		return (
			<TodoPageWrapper>
				<ColumnsContainer>
					{todoColumns.map((column, i) => {
						return <TodoColumn key={i} column={column} />
					})}
				</ColumnsContainer>
				<Button className="add-column-btn" onClick={this.onAddColumn}>Add Column</Button>
			</TodoPageWrapper>
		);
	}

	onAddColumn = () => {
		appState.addTodoColumn('New Column');
	}
})