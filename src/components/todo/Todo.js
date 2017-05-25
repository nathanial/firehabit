import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {EditableText, Button, Intent} from "@blueprintjs/core";
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
		right: 20px;
		top: -6px;
		opacity: 0.2;
		transition: opacity 0.2s ease-out;
		&:hover {
			opacity: 1;
		}
	}
`;

const TodoWrapper = styled.div`
	position: relative;
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
		updatedTodo: _.cloneDeep(this.props.todo)
	};

	render(){
		const { connectDragSource, connectDragPreview } = this.props;
		return (
			connectDragPreview(
				<li className="pt-card pt-elevation-2" style={{paddingLeft: 0}}>
					<TodoWrapper onClick={this.onClick}>
						{connectDragSource(<div className="drag-handle"><div className="inner-icon pt-icon-drag-handle-vertical"></div></div>)}
						<TodoContentWrapper>
							<EditableText value={this.state.updatedTodo.name}
														multiline={true}
														onChange={this.onNameChanged}
														onConfirm={this.onUpdatedTodo} />
							<Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo}></Button>
						</TodoContentWrapper>
					</TodoWrapper>
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
		const result = await DialogService.showDangerDialog("Are you sure you want to delete this TODO?", "Delete", "Cancel");
		if(result){
			appState.deleteTodo(this.props.todo);
		}
	}
}

export default Todo;