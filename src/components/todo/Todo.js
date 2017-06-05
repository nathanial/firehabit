import _ from 'lodash';
import update from 'immutability-helper';
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {EditableText, Button, Intent} from "@blueprintjs/core";
import mobx from 'mobx';
import {appState} from '../../util';
import styled from 'styled-components';
import DialogService from "../../services/DialogService";

const TodoContentWrapper = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	.pt-editable-text {
		max-width: 180px;
	}
	
	flex: 2 0 0; 
`;

const TodoWrapper = styled.div`
	position: relative;
	padding: 10px 0;
	display: flex;
	flex-direction: row;
	.drag-handle {
		bottom: 0;
		width: 30px;
		font-size: 24px;
		
		.inner-icon {
			position: absolute;
			top: 50%;
			margin-top: -17px;
		}
	}
	border-radius: 0;
	
	&:hover {
		.todo-controls {
			opacity: 1;
		}
	}
	
	.todo-controls {
		height: 37px;
		position: relative;
		display: flex;
		flex-direction: column;
		background: white;
		border-left: 1px solid #ccc;
		border-top: 1px solid #ccc;
		border-bottom: 1px solid #ccc;
		border-top-left-radius: 3px;
		border-bottom-left-radius: 3px;
		opacity: 0;
		.delete-btn {
			min-width: 18px;
			min-height: 18px;
			line-height: 18px;
			transition: opacity 0.2s ease-out;
			&:before {
				font-size: 12px;
				vertical-align: middle;
			}
		}
		
		transition: opacity 0.2s ease-in-out;
		
		.add-subtask-btn {
			min-width: 18px;
			min-height: 18px;
			line-height: 10px;
			&:before {
				font-size: 12px;
				vertical-align: middle;
			}		
		}
	}
`;

const SubtasksList = styled.ul`
	list-style-type: none;
	margin: 0;
	padding: 0;
	font-size: 12px;
	border-top: 1px solid #ccc;
	padding-left: 28px;
	margin-right: 0;
	margin-top: 0px;
	padding-top: 10px;
	padding-bottom: 10px;
	& > li {
		position: relative;
		padding: 2px 0;
		margin: 0;
		margin-left: 2px;
		
		.pt-editable-text {
			width: 180px;
		}
		
		& > .close-btn {
			position: absolute;
			right: 6px;
			top: 1px;
			padding: 0;
			min-height: 10px;
			min-width: 10px;
			font-size: 10px;
			line-height: 15px;
		}
	}
	
	.delete-subtask-btn {
		margin-right: -4px;
		opacity: 0;
	}
	&:hover {
		.delete-subtask-btn {
			opacity: 1 ;
		}
	}
`;

const OuterTodoWrapper = styled.div`
`;


@DragSource('todo',{
		beginDrag(props) {
			return {
				todo: props.todo
			};
		}
	},
	(connect, monitor) => {
		return {
			connectDragSource: connect.dragSource(),
			connectDragPreview: connect.dragPreview(),
			isDragging: monitor.isDragging()
		};
	})
class Todo extends React.Component {

	static propTypes = {
		todo: PropTypes.object.isRequired,
		confirmDeletion: PropTypes.bool.isRequired,
		isDragging: PropTypes.bool.isRequired,
		connectDragSource: PropTypes.func.isRequired,
		connectDragPreview: PropTypes.func.isRequired
	};

	state = {

	};

	constructor(){
		super(...arguments);
		this.state.updatedTodo = _.cloneDeep(mobx.toJS(this.props.todo));
	}

	render(){
		const { connectDragSource, connectDragPreview } = this.props;
		return (
			connectDragPreview(
				<li className="pt-card pt-elevation-2" style={{padding:0}}>
					<OuterTodoWrapper>
						<TodoWrapper onClick={this.onClick}>
							{connectDragSource(
								<div className="drag-handle">
									<div className="inner-icon pt-icon-drag-handle-vertical"/>
								</div>
							)}
							<TodoContentWrapper>
								<EditableText value={this.state.updatedTodo.name}
															multiline={true}
															onChange={this.onNameChanged}
															onConfirm={this.onUpdatedTodo} />
							</TodoContentWrapper>
							<div className="todo-controls">
								<Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo} />
								<Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" onClick={this.onAddSubtask} />
							</div>
						</TodoWrapper>
						{this.renderSubtasks()}
					</OuterTodoWrapper>
				</li>
			)
		);
	}

	renderSubtasks = () => {
		const subtasks = this.state.updatedTodo.subtasks;
		if(_.isArray(subtasks) && !_.isEmpty(subtasks)) {
			return (
				<SubtasksList>
					{_.map(this.state.updatedTodo.subtasks, (task, i) => {
						return (
							<li key={i} className="subtask-item">
								<EditableText value={task.name}
															multiline={true}
															onChange={(newName) => this.onSubtaskNameChanged(i, task, newName)}
															onConfirm={() => this.onUpdatedSubtask(task)} />
								<Button className="delete-subtask-btn close-btn pt-minimal pt-intent-danger" iconName="cross" onClick={() => this.onDeleteSubtask(task, i)} />
							</li>
						);
					})}
				</SubtasksList>
			);
		}
	};

	onNameChanged = (newName) => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		updatedTodo.name = newName;
		this.setState({updatedTodo});
	};

	onUpdatedTodo = () =>{
		appState.updateTodo(this.state.updatedTodo);
	};

	onDeleteTodo = async () => {
		if(this.props.confirmDeletion) {
			const result = await DialogService.showDangerDialog("Are you sure you want to delete this TODO?", "Delete", "Cancel");
			if(result){
				appState.deleteTodo(this.props.todo);
			}
		} else {
			appState.deleteTodo(this.props.todo);
		}
	};

	onAddSubtask = async () => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		if(_.isUndefined(updatedTodo.subtasks)) {
			updatedTodo.subtasks = [];
		}
		updatedTodo.subtasks.push({name: 'New Task'});
		appState.updateTodo(updatedTodo);
		this.setState({updatedTodo});
	};

	onSubtaskNameChanged = (index, subtask, newName) => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		updatedTodo.subtasks[index].name = newName;
		this.setState({updatedTodo});
	};

	onUpdatedSubtask = (subtask) => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		appState.updateTodo(updatedTodo);
	};

	onDeleteSubtask = (subtask, index) => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		updatedTodo.subtasks.splice(index, 1);
		appState.updateTodo(updatedTodo);
		this.setState({updatedTodo});
	}
}

export default Todo;