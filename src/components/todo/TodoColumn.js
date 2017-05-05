import * as _ from 'lodash';
import React from 'react';
import {Button, EditableText} from "@blueprintjs/core";
import {appState} from '../../util';
import DialogService from "../../services/DialogService";
import styled from 'styled-components';
import {observer} from 'mobx-react';

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

class TodoEditForm extends React.Component {
	render(){
		return (
			<div>
				<h1>Todo Edit Form</h1>
			</div>
		);
	}
}

class Todo extends React.Component {

	state = {
		updatedTodo: _.cloneDeep(this.props.todo)
	};

	render(){
		return (
			<li className="pt-card pt-elevation-2" onClick={this.onClick}>
				{this.props.todo.name}
			</li>
		);
	}

	onClick = async () => {
		const result = await DialogService.showDialog(`Edit Todo`, 'Save', 'Cancel',
			<TodoEditForm todo={this.props.todo} onChange={this.onDialogChange} />
		);
		if(result){
			appState.updateTodo(this.state.updatedTodo);
		}
		this.setState({updatedTodo: _.cloneDeep(this.props.todo)});
	};

	onDialogChange = (newValue) => {
		this.setState({
			updatedTodo: newValue
		});
	}
}

export default observer(class TodoColumn extends React.Component {

	static propTypes = {
		column: React.PropTypes.object.isRequired
	};

	state = {
		columnName: this.props.column.name
	};

	render(){
		const todos = this.props.column.todos || [];
		return (
			<TodoColumnWrapper className="pt-card pt-elevation-2">
				<EditableText value={this.state.columnName} onChange={this.onChangeColumnName} onConfirm={this.onFinishEditingColumnName} />
				<Button iconName="trash" className="trash-btn pt-minimal pt-intent-danger" onClick={this.onStartDelete} />
				<Button iconName="plus" className="add-todo-btn pt-minimal pt-intent-success" onClick={this.onAddTodo} />

				<TodoListWrapper>
					{todos.map((todo, i) => {
						return <Todo key={i} todo={todo} />;
					})}
				</TodoListWrapper>
			</TodoColumnWrapper>
		);
	}

	onAddTodo = async () => {
		const firstTodo = _.isUndefined(this.props.column.todos) || this.props.column.todos.length === 0;
		appState.addTodo(this.props.column, {name: 'NEW TODO'});
		if(firstTodo){
			setTimeout(() => {
				this.forceUpdate();
			}, 100);
		}
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