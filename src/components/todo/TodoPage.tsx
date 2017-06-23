import * as React from 'react';
import {db} from '../../util';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoColumn from "./TodoColumn";
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Route} from "react-router-dom";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import TodoSidebar from "./TodoSidebar";

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
`;

const ColumnsContainer = styled.div`
`;

@observer
class ColumnsPage extends React.Component<{},{}> {
	render(){
		const todoColumns = db.todoColumns;
		return (
			<TodoPageWrapper>
				<TodoSidebar />
				<ColumnsContainer>
					{todoColumns.map((column, i) => {
						return <TodoColumn key={i} column={column} />
					})}
				</ColumnsContainer>
			</TodoPageWrapper>
		);
	}
}

@DragDropContext(HTML5Backend)
export default class TodoPage extends React.Component {
	render(){
		return (
			<div>
				<Route exact path="/todo" component={ColumnsPage} />
				<Route exact path="/todo/column/:columnID/settings" component={TodoColumnSettingsPage} />
			</div>
		);
	}
}