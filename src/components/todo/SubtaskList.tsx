import * as React from 'react';
import * as _ from 'lodash';
import {EditableText, Button} from '@blueprintjs/core';
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
	style?: Object;
	subtasks: Subtask[];
	onChange(index: number, subtask: Partial<Subtask>);
	onDelete(index: number, subtask: Subtask);
}

export class SubtaskList extends React.PureComponent<Props> {
	render(){
		const subtasks = this.props.subtasks;
		if(!_.isEmpty(subtasks)) {
			return (
				<div className={subtaskListClass} style={this.props.style}>
					{subtasks.map((task: Subtask, i: number) => {
						let classes = "subtask-item";
						if(task.complete) {
							classes += ' ' + subtaskCompleted;
						}
						return (
							<li key={i} className={classes}>
								<EditableText value={task.name}
											  multiline={true}
											  onChange={(newName) => this.props.onChange(i, {name: newName})} />
								<Button className="complete-subtask-btn pt-minimal pt-intent-success"
												iconName="tick"
												onClick={() => this.props.onChange(i, {complete: !task.complete})} />
								<Button className="delete-subtask-btn close-btn pt-minimal pt-intent-danger"
												iconName="cross"
												onClick={() => this.props.onDelete(i, task)} />
							</li>
						);
					})}
				</div>
			);
		} else {
			return <div></div>;
		}
	}


}
