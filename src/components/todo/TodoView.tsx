import * as $ from 'jquery';
import * as  _ from 'lodash';
import * as React from 'react';
import {EditableText, Button} from "@blueprintjs/core";
import {db} from '../../util';
import styled from 'styled-components';
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import {dndService} from "../dnd/DragAndDropLayer";
import cxs from 'cxs';
import * as ReactDOM from "react-dom";
import * as uuidv4 from 'uuid/v4';
import {Motion, spring} from 'react-motion';

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

const todoItemClass = cxs({
	padding: '10px',
	margin: '10px',
	color: 'black',
	'text-align': 'left',
	cursor: 'pointer',
	width: '240px'
});

const todoWrapperClass = cxs({
	position: 'relative',
	padding: '10px 0',
	display: 'flex',
	'flex-direction': 'row'
});

const TodoWrapper = styled.div`
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

interface Props {
	todo: Todo;
	confirmDeletion: boolean;
	isDragging?: boolean;
	onDelete(todo: Todo);
}

interface State {
	updatedTodo: Partial<Todo>;
	dragging: boolean;
}

type PreviewProps = {
	todo: Todo;
}

class TodoDragPreview extends React.PureComponent<PreviewProps,{}> {
	render(){
		return (
			<div className={`pt-card pt-elevation-2 ${todoItemClass}`}
				 style={{padding:0, background: '#eee', margin: 0}}>
				<div>
					<TodoWrapper className={todoWrapperClass} >
						<div className="drag-handle">
							<div className="inner-icon pt-icon-drag-handle-vertical"/>
						</div>
						<TodoContentWrapper>
							<EditableText value={this.props.todo.name}
										  multiline={true}/>
						</TodoContentWrapper>
						<div className="todo-controls">
							<Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" />
							<Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" />
						</div>
					</TodoWrapper>
					<SubtaskList todo={this.props.todo} />
				</div>
			</div>
		);
	}
}

export default class TodoView extends React.PureComponent<Props> {

	render(){
		const height = this.props.todo.dragging ? spring(0) : spring(500);
		return (
			<Motion defaultStyle={{maxHeight: 500, margin: 10}} style={{
				maxHeight: height
			}}>				
				{value => {
					const margin = (value.maxHeight / 500) * 15 - 5;
					return (
						<div style={{maxHeight: value.maxHeight, margin, overflow: 'hidden'}}>
							<div className={`todo-view pt-card pt-elevation-2 ${todoItemClass}`}
								data-todo-id={this.props.todo.id}
								style={{
									padding:0,
									background: '#eee',
									margin: 0,
									opacity: this.props.todo.dragging ? 0 : 1 }}>
								<div>
									<TodoWrapper  className={todoWrapperClass} >
										<div className="drag-handle" draggable={true} 
											onMouseDown={this.onDragStart}>
											<div className="inner-icon pt-icon-drag-handle-vertical"/>
										</div>
										<TodoContentWrapper>
											<EditableText value={this.props.todo.name}
														multiline={true}
														onChange={this.onNameChange} />
										</TodoContentWrapper>
										<div className="todo-controls">
											<Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo} />
											<Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" onClick={this.onAddSubtask} />
										</div>
									</TodoWrapper>
									<SubtaskList todo={this.props.todo} />
								</div>
							</div>
						</div>
					);
				}}
			</Motion>
		);
	}

	onAddSubtask = () => {
		this.props.todo.subtasks.push({name: 'New Subtask', complete: false});
	}

	onNameChange = (name) => {
		this.props.todo.set({name});
	}

	onDragStart = async (event) => {
		event.preventDefault();
		const el = ReactDOM.findDOMNode(this);
		const $el = $(el);
		const offset = $el.offset();
		const x = offset.left;
		const y = offset.top;
		this.props.todo.set({dragging: true});
		const result = await dndService.startDrag({x, y, width: $el.width(), height: $el.height()}, this.props.todo,
			<TodoDragPreview todo={this.props.todo} />
		) as {column: TodoColumn, index: number};
		if(result){
			const {column, index} = result;
			column.todos.push({...this.props.todo, id: uuidv4(), dragging: false} as Todo);
			this.props.onDelete(this.props.todo);
		}
		this.props.todo.set({dragging: false});
	};

	onDeleteTodo = async () => {
		if(this.props.confirmDeletion) {
			const result = await DialogService.showDangerDialog("Are you sure you want to delete this TODO?", "Delete", "Cancel");
			if(result){
				this.props.onDelete(this.props.todo);
			}
		} else {
			this.props.onDelete(this.props.todo);
		}
	};

}

