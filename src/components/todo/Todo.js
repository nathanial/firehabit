import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {EditableText, Button} from "@blueprintjs/core";
import mobx from 'mobx';
import {appState} from '../../util';
import styled from 'styled-components';
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";

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
					<div>
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
						<SubtaskList todo={this.state.updatedTodo} onChange={(updatedTodo) => this.setState({updatedTodo})} />
					</div>
				</li>
			)
		);
	}

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


}

export default Todo;