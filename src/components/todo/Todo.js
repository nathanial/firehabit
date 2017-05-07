import _ from 'lodash';
import React from 'react';
import DialogService from "../../services/DialogService";
import {appState} from '../../util';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';

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

const todoSource = {
	beginDrag(props) {
		console.log("Begin Drag", props);
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