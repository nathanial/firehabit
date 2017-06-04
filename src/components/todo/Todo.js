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
	left: 30px;
	button {
		position: absolute;
		top: -5px;
		right: 20px;
		padding: 0;
	}
	
	.pt-editable-text {
		max-width: 180px;
	}
	
	.delete-btn {
		position: absolute;
		right: 35px;
		top: -6px;
		min-width: 18px;
		min-height: 18px;
		line-height: 18px;
		opacity: 0.2;
		transition: opacity 0.2s ease-out;
		&:hover {
			opacity: 1;
		}
		&:before {
			font-size: 12px;
			vertical-align: middle;
		}
	}
	
	.add-subtask-btn {
		position: absolute;
		top: 15px;
		right: 35px;
		min-width: 18px;
		min-height: 18px;
		line-height: 18px
		opacity: 0.2;
		&:hover {
			opacity: 1;
		}
		&:before {
			font-size: 12px;
			vertical-align: middle;
		}		
	}
`;

const TodoWrapper = styled.div`
	position: relative;
	padding: 10px 0;
	.drag-handle {
		position: absolute;
		left: 0;
		top: 0;
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
	 & > ul {
	 		border-top: 1px solid #999;
	 }
	}
`;

const SubtasksList = styled.ul`
	list-style-type: none;
	margin: 0;
	padding: 0;
	font-size: 12px;
	border-top: 1px solid #ccc;
	margin-right: 0;
	margin-top: 10px;
	padding-top: 10px;
	& > li {
		position: relative;
		padding: 2px 0;
		margin: 0;
		margin-left: 35px;
		
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
			opacity: 0.2;
			&:hover {
				opacity: 1;
			}
		}
	}
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
							<Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo} />
							<Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" onClick={this.onAddSubtask} />
						</TodoContentWrapper>
						{this.renderSubtasks()}
					</TodoWrapper>
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
								<Button className="close-btn pt-minimal pt-intent-danger" iconName="cross" onClick={() => this.onDeleteSubtask(task, i)} />
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
		const result = await DialogService.showDangerDialog("Are you sure you want to delete this TODO?", "Delete", "Cancel");
		if(result){
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