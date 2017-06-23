import * as React from 'react';
import * as _ from 'lodash';
import {EditableText, Button} from '@blueprintjs/core';
import {db} from '../../util';
import cxs from 'cxs';

const subtaskCompleted = cxs({
	'.pt-editable-text:not(.pt-editable-editing)': {
		textDecoration: 'line-through'
	}
});

const subtaskListClass = cxs({
	listStyleType: 'none',
	margin: 0,
	padding: 0,
	fontSize: 12,
	borderTop: '1px solid #ccc',
	paddingLeft: 28,
	marginRight: 0,
	marginTop: 0,
	paddingTop: 10,
	paddingBottom: 10,
	'li': {
		position: 'relative',
		padding: '2px 0',
		margin: 0,
		marginLeft: 2,
		'.pt-editable-text': {
			width: 180,
		},
		'.close-btn': {
			position: 'absolute',
			right: 25,
			top: 1,
			padding: 0,
			minHeight: 10,
			minWidth: 10,
			fontSize: '10px',
			lineHeight: '15px',
			opacity: 0
		},

		'.complete-subtask-btn': {
			position: 'absolute',
			right: 6,
			top: 1,
			padding: 0,
			minHeight: 10,
			minWidth: 10,
			fontSize: '10px',
			lineHeight: '15px',
			opacity: 0
		},

		':hover': {
			'.delete-subtask-btn': {
				opacity: 1
			},
			'.complete-subtask-btn': {
				opacity: 1
			}
		}
	}
});

interface Props {
	todo: Todo;
	onChange(todo: Partial<Todo>);
}

export class SubtaskList extends React.Component<Props, {}> {
	render(){
		const subtasks = this.props.todo.subtasks;
		if(_.isArray(subtasks) && !_.isEmpty(subtasks)) {
			return (
				<div className={subtaskListClass}>
					{_.map(subtasks, (task, i) => {
						let classes = "subtask-item";
						if(task.complete) {
							classes += ' ' + subtaskCompleted;
						}
						return (
							<li key={i} className={classes}>
								<EditableText value={task.name}
											  multiline={true}
											  onChange={(newName) => this.onSubtaskNameChanged(i, task, newName)}
											  onConfirm={() => this.onUpdatedSubtask()} />
								<Button className="complete-subtask-btn pt-minimal pt-intent-success"
												iconName="tick"
												onClick={() => this.onCompleteSubtask(task, i)} />
								<Button className="delete-subtask-btn close-btn pt-minimal pt-intent-danger"
												iconName="cross"
												onClick={() => this.onDeleteSubtask(task, i)} />
							</li>
						);
					})}
				</div>
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

	onUpdatedSubtask = () => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		db.updateTodo(updatedTodo);
	};

	onCompleteSubtask = (subtask, index) => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		updatedTodo.subtasks[index].complete = !updatedTodo.subtasks[index].complete;
		db.updateTodo(updatedTodo);
		this.props.onChange(updatedTodo);
	};

	onDeleteSubtask = (subtask, index) => {
		const updatedTodo = _.cloneDeep(this.props.todo);
		updatedTodo.subtasks.splice(index, 1);
		db.updateTodo(updatedTodo);
		this.props.onChange(updatedTodo);
	};
}
