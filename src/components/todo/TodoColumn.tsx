import * as React from 'react';
import {Button, EditableText} from "@blueprintjs/core";
import {db, history} from '../../util';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoView from "./TodoView";
import {DropTarget} from 'react-dnd';
import ScrollArea from 'react-scrollbar';
import * as colors from '../../theme/colors';

const TodoColumnWrapper = styled.div`
	display: inline-block;
	margin: 10px;
	padding: 20px 10px 10px 10px;
	width: 280px;
	text-align: center;
	height: 600px;
	position: relative;
	vertical-align: top;
	
	& > .column-name {
		margin-top: -12px;
	}

	& > .add-todo-btn {
		position: absolute;
		top: 0;
		left: 0;
	}
	
	& > .settings-btn {
		position: absolute;
		top: 0;
		right: 0;
	}
	
	& > h4 {
		margin-top: 0;
	}
	
	overflow: hidden;
`;

const TodoListWrapper = styled.ul`
	list-style-type: none;
	margin: 0;
	padding: 0;
	overflow-y: auto;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 40px;
	
	& > .scrollarea {
		height: 100%;
		& > .scrollarea-content {
			padding-left: 10px;
			padding-right: 10px;
		}
		
		& > .scrollbar-container.vertical {
			& > .scrollbar {
				background: ${colors.primaryColor2};
			}
			&:hover {
				background: ${colors.primaryColor1};
			}
		}
	}

	& > .scrollarea > .scrollarea-content > li {
		padding: 10px;
		background: #eee !important;
		margin: 10px;
		color: black;
		text-align: left;
		cursor: pointer;
		
		&:first-child {
			margin-top: 0;
		}
		
	}
`;

interface Props {
	column: TodoColumn;
	connectDropTarget?: any;
}

interface State {
	columnName: string;
}

@DropTarget("todo", {
	drop(props, monitor) {
		const {todo} = monitor.getItem();
		db.todoColumnsDB.moveTodo(todo, props.column);
	}
}, (connect, monitor) => {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
})
@observer
export default class TodoColumnView extends React.Component<Props, State> {

	state = {
		columnName: this.props.column.name
	};

	render(){
		const column = this.props.column;
		const todos = column.todos || [];
		const columnColor = column.color;
		const {connectDropTarget} = this.props;
		return connectDropTarget(
			<div style={{display:'inline-block'}}>
				<TodoColumnWrapper className="pt-card pt-elevation-2" style={{background: columnColor}}>
					<EditableText className="column-name" value={this.state.columnName} onChange={this.onChangeColumnName} onConfirm={this.onFinishEditingColumnName} />
					<Button iconName="settings" className="settings-btn pt-minimal" onClick={this.gotoColumnSettings} />
					<Button iconName="plus" className="add-todo-btn pt-minimal pt-intent-success" onClick={this.onAddTodo} />

					<TodoListWrapper>
						<ScrollArea
							speed={0.8}
							horizontal={false}>
							{todos.map((todo) => {
								return <TodoView key={todo.id} todo={todo} confirmDeletion={column.confirmDeletion} />;
							})}
						</ScrollArea>
					</TodoListWrapper>
				</TodoColumnWrapper>
			</div>
		);
	}

	onAddTodo = async () => {
		db.todoColumnsDB.addTodo(this.props.column, {name: 'NEW TODO'});
	};

	onChangeColumnName = (newName) => {
		this.setState({
			columnName: newName
		});
	};

	onFinishEditingColumnName = () => {
		db.todoColumnsDB.updateTodoColumn(this.props.column.id, {name: this.state.columnName});
	};

	gotoColumnSettings = () => {
		history.push(`/todo/column/${this.props.column.id}/settings`);
	}
}