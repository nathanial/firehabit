import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {EditableText, Button, Intent} from "@blueprintjs/core";
import {appState} from '../../util';
import styled from 'styled-components';

const TodoContentWrapper = styled.div`
	position: relative;
	button {
		position: absolute;
		top: -5px;
		right: -5px;
		padding: 0;
	}
	
	.pt-editable-text {
		max-width: 180px;
	}
	
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
		const { isDragging, connectDragSource } = this.props;
		return connectDragSource(
			<li className="pt-card pt-elevation-2" onClick={this.onClick}>
				<TodoContentWrapper>
					<EditableText value={this.state.updatedTodo.name}
												multiline={true}
												onChange={this.onNameChanged}
												onConfirm={this.onUpdatedTodo} />
					<Button iconName="trash" className="pt-minimal" intent={Intent.DANGER} onClick={this.onRemove} />
				</TodoContentWrapper>
			</li>
		);
	}

	onNameChanged = (newName) => {
		const updatedTodo = _.cloneDeep(this.state.updatedTodo);
		updatedTodo.name = newName;
		this.setState({updatedTodo});
	}

	onUpdatedTodo = () =>{
		appState.updateTodo(this.state.updatedTodo);
	}

	onRemove = () => {
		appState.removeTodo(this.props.todo);
	}

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