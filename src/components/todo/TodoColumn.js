import * as _ from 'lodash';
import React from 'react';
import {Button, EditableText} from "@blueprintjs/core";
import {appState} from '../../util';
import DialogService from "../../services/DialogService";
import styled from 'styled-components';
import {observer} from 'mobx-react';
import Todo from "./Todo";
import {DropTarget} from 'react-dnd';

const TodoColumnWrapper = styled.div`
	display: inline-block;
	margin: 10px;
	padding: 20px 10px 10px 10px;
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
	
	overflow: hidden;
`;

const TodoListWrapper = styled.ul`
	list-style-type: none;
	margin: 0;
	padding: 0 10px;
	overflow-y: auto;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 40px;

	& > li {
		padding: 10px;
		background: #eee !important;
		margin: 10px;
		color: black;
		text-align: left;
		cursor: pointer;
		
		&:hover {
			background: #bbb !important;
		}
	}
`;

const todoTarget = {
	drop(props, monitor) {
		console.log("Drop");
		const {todo} = monitor.getItem();
		appState.moveTodo(todo, props.column);
	}
};

function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
}


export default DropTarget("todo", todoTarget, collect)(observer(class TodoColumn extends React.Component {

	static propTypes = {
		column: React.PropTypes.object.isRequired
	};

	state = {
		columnName: this.props.column.name
	};

	render(){
		const todos = this.props.column.todos || [];
		const {connectDropTarget} = this.props;
		return connectDropTarget(
			<div style={{display:'inline-block'}}>
				<TodoColumnWrapper className="pt-card pt-elevation-2">
					<EditableText value={this.state.columnName} onChange={this.onChangeColumnName} onConfirm={this.onFinishEditingColumnName} />
					<Button iconName="trash" className="trash-btn pt-minimal pt-intent-danger" onClick={this.onStartDelete} />
					<Button iconName="plus" className="add-todo-btn pt-minimal pt-intent-success" onClick={this.onAddTodo} />

					<TodoListWrapper>
						{todos.map((todo) => {
							return <Todo key={todo.id} todo={todo} />;
						})}
					</TodoListWrapper>
				</TodoColumnWrapper>
			</div>
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
}));