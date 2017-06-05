import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {EditableText, Button} from '@blueprintjs/core';
import {appState} from '../../util';

const SubtaskListWrapper = styled.ul`
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
			right: 25px;
			top: 1px;
			padding: 0;
			min-height: 10px;
			min-width: 10px;
			font-size: 10px;
			line-height: 15px;
			opacity: 0;
		}
		
		& > .complete-subtask-btn {
			position: absolute;
			right: 6px;
			top: 1px;
			padding: 0;
			min-height: 10px;
			min-width: 10px;
			font-size: 10px;
			line-height: 15px;
			opacity: 0;
		}
		
		&.completed {
			.pt-editable-text:not(.pt-editable-editing) {
				text-decoration: line-through;
			}
		}
		
		&:hover {
			.delete-subtask-btn, .complete-subtask-btn {
				opacity: 1 ;
			}
		}
	}
	

`;


export class SubtaskList extends React.Component {
	static propTypes = {
		todo: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired
	};

	render(){
		const subtasks = this.props.todo.subtasks;
		if(_.isArray(subtasks) && !_.isEmpty(subtasks)) {
			return (
				<SubtaskListWrapper>
					{_.map(subtasks, (task, i) => {
						let classes = "subtask-item";
						if(task.complete) {
							classes += ' completed';
						}
						return (
							<li key={i} className={classes}>
								<EditableText value={task.name}
															multiline={true}
															onChange={(newName) => this.onSubtaskNameChanged(i, task, newName)}
															onConfirm={() => this.onUpdatedSubtask(task)} />
								<Button className="complete-subtask-btn pt-minimal pt-intent-success"
												iconName="tick"
												onClick={() => this.onCompleteSubtask(task, i)} />
								<Button className="delete-subtask-btn close-btn pt-minimal pt-intent-danger"
												iconName="cross"
												onClick={() => this.onDeleteSubtask(task, i)} />
							</li>
						);
					})}
				</SubtaskListWrapper>
			);
		} else {
			return <div></div>;
		}
	}

	onSubtaskNameChanged = (index, subtask, newName) => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		updatedTodo.subtasks[index].name = newName;
		this.props.onChange(updatedTodo);
	};

	onUpdatedSubtask = (subtask) => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		appState.updateTodo(updatedTodo);
	};

	onCompleteSubtask = (subtask, index) => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		updatedTodo.subtasks[index].complete = !updatedTodo.subtasks[index].complete;
		appState.updateTodo(updatedTodo);
		this.props.onChange(updatedTodo);
	};

	onDeleteSubtask = (subtask, index) => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		updatedTodo.subtasks.splice(index, 1);
		appState.updateTodo(updatedTodo);
		this.props.onChange(updatedTodo);
	};
}
