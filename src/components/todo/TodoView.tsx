import * as $ from 'jquery';
import * as  _ from 'lodash';
import * as React from 'react';
import {EditableText, Button} from "@blueprintjs/core";
import * as mobx from 'mobx';
import {db} from '../../util';
import styled from 'styled-components';
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import {dndService} from "../dnd/DragAndDropLayer";
import cxs from 'cxs';
import * as ReactDOM from "react-dom";

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

class TodoDragPreview extends React.Component<PreviewProps,{}> {
	render(){
		return (
			<div className={`pt-card pt-elevation-2 ${todoItemClass}`}
				 style={{padding:0, background: '#eee', margin: 0}}>
				<div>
					<TodoWrapper >
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

export default class TodoView extends React.Component<Props, State> {

	state = {
		updatedTodo:_.cloneDeep(mobx.toJS(this.props.todo)),
		dragging: false
	};

	render(){
		return (
			<div className={`todo-view pt-card pt-elevation-2 ${todoItemClass}`}
				 data-todo-id={this.props.todo.id}
				 style={{
					padding:0,
					background: '#eee',
					opacity: this.state.dragging ? 0 : 1 }}
				 onDragStart={this.onDragStart}>
				<div>
					<TodoWrapper >
						<div className="drag-handle" draggable={true}>
							<div className="inner-icon pt-icon-drag-handle-vertical"/>
						</div>
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
			</div>
		);
	}

	onDragStart = async (event) => {
		event.preventDefault();
		const el = ReactDOM.findDOMNode(this);
		const $el = $(el);
		const offset = $el.offset();
		const x = offset.left;
		const y = offset.top;
		this.setState({
			dragging: true
		});
		await dndService.startDrag({x, y, width: $el.width(), height: $el.height()}, this.props.todo,
			<TodoDragPreview todo={this.props.todo} />
		);
		this.setState({
			dragging: false
		});
	};

	onNameChanged = (newName) => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		updatedTodo.name = newName;
		this.setState({updatedTodo});
	};

	onUpdatedTodo = () => {
		this.props.todo.set(this.state.updatedTodo);
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

	onAddSubtask = async () => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		if(_.isUndefined(updatedTodo.subtasks)) {
			updatedTodo.subtasks = [];
		}
		updatedTodo.subtasks.push({name: 'New Task'} as any);
		this.props.todo.set(updatedTodo);
		this.setState({updatedTodo});
	};

}

