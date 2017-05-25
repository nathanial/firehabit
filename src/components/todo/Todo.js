import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {EditableText, Button, Intent} from "@blueprintjs/core";
import {appState} from '../../util';
import styled from 'styled-components';

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
`;

const TodoWrapper = styled.li`
	position: relative;
	.drag-handle {
		position: absolute;
		width: 25px;
		height: 100%;
		left: 0;
		top: 0;
		font-size: 24px;
		
		.inner-icon {
			position: absolute;
			top: 50%;
			margin-top: -17px;
		}
	}
	border-radius: 0;
`;

class Todo extends React.Component {

	static propTypes = {
		todo: PropTypes.object.isRequired,
		isDragging: PropTypes.bool.isRequired,
		connectDragSource: PropTypes.func.isRequired
	};

	state = {
		updatedTodo: _.cloneDeep(this.props.todo)
	};

	render(){
		const { connectDragSource } = this.props;
		return (
			<TodoWrapper className="pt-card pt-elevation-2" onClick={this.onClick}>
				{connectDragSource(<div className="drag-handle"><div className="inner-icon pt-icon-drag-handle-vertical"></div></div>)}
				<TodoContentWrapper>
					<EditableText value={this.state.updatedTodo.name}
												multiline={true}
												onChange={this.onNameChanged}
												onConfirm={this.onUpdatedTodo} />
				</TodoContentWrapper>
			</TodoWrapper>
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

}

const todoSource = {
	beginDrag(props) {
		return {
			todo: props.todo
		};
	}
};

function collect(connect, monitor){
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
}

export default DragSource('todo', todoSource, collect)(Todo);