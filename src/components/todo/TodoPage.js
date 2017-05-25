import React from 'react';
import {appState} from '../../util';
import {Button} from "@blueprintjs/core";
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoColumn from "./TodoColumn";
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Route} from "react-router-dom";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";

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

@DragDropContext(HTML5Backend)
@observer
export default class TodoPage extends React.Component {
	render(){
		return (
			<div>
				<Route exact path="/todo" render={this.renderColumns} />
				<Route exact path="/todo/column/:columnID/settings" component={TodoColumnSettingsPage} />
			</div>
		);
	}

	renderColumns = () => {
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
}