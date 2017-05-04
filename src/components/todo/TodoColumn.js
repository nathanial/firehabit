import React from 'react';
import {Button, EditableText} from "@blueprintjs/core";
import {appState} from '../../util';
import DialogService from "../../services/DialogService";
import styled from 'styled-components';
import {observer} from 'mobx-react';

const TodoColumnWrapper = styled.div`
	display: inline-block;
	margin: 10px;
	padding: 7px 30px 30px 30px;
	width: 280px;
	text-align: center;
	height: 500px;
	position: relative;
	vertical-align: top;

	
	& > .trash-btn {
		position: absolute;
		top: 0;
		right: 0;
	}
	
	& > .add-todo-btn {
		position: absolute;
		top: 0;
		left: 0;
	}
	
	& > h4 {
		margin-top: 0;
	}
`;

const TodoListWrapper = styled.ul`

`;

function Todo(props){
	console.log("TODO", props.todo);
	return <li>{props.todo.name}</li>
}

export default observer(class TodoColumn extends React.Component {

	static propTypes = {
		column: React.PropTypes.object.isRequired
	};

	state = {
		columnName: this.props.column.name
	};

	render(){
		console.log("Column Name", this.state.columnName);
		const todos = (this.props.column.todos || []);
		return (
			<TodoColumnWrapper className="pt-card pt-elevation-2">
				<EditableText value={this.state.columnName} onChange={this.onChangeColumnName} onConfirm={this.onFinishEditingColumnName} />
				<Button iconName="trash" className="trash-btn pt-minimal pt-intent-danger" onClick={this.onStartDelete} />
				<Button iconName="plus" className="add-todo-btn pt-minimal pt-intent-success" onClick={this.onAddTodo} />

				<TodoListWrapper>
					{todos.map(todo => {
						return <Todo todo={todo} />;
					})}
				</TodoListWrapper>
			</TodoColumnWrapper>
		);
	}

	onAddTodo = async () => {
		appState.addTodo(this.props.column, {name: 'NEW TODO'});
	};

	onStartDelete = async () => {
		const shouldDelete = await DialogService.showDangerDialog(
			'Are you sure you want to delete this column?',
			'Delete Column',
			'Cancel'
		);
		if(shouldDelete){
			appState.deleteTodoColumn(this.props.column);
		}
	};

	onChangeColumnName = (newName) => {
		this.setState({
			columnName: newName
		});
	};

	onFinishEditingColumnName = () => {
		appState.updateTodoColumn(this.props.column.id, {name: this.state.columnName});
	}
});