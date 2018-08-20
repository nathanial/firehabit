import * as React from 'react';
import * as _ from 'lodash';
import {EditableText, Button} from '@blueprintjs/core';
import InlineText from '../InlineText';
import cxs from 'cxs';

const subtaskCompleted = cxs({
	'textarea': {
		textDecoration: 'line-through'
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
		return (
			<div className="subtask-list" style={this.props.style}>
				{subtasks.map((task: Subtask, i: number) => {
					let classes = "subtask-item";
					if(task.complete) {
						classes += ' ' + subtaskCompleted;
					}
					return (
						<li key={i} className={classes}>
							<InlineText value={task.name}
										multiline={true}
										editing={false}
										style={this.props.style}
										onChange={(newName) => this.props.onChange(i, {name: newName})}
										onStartEditing={() => {}}
										onStopEditing={() => {}} />
							<div className="subtask-btns">
								<Button className="complete-subtask-btn pt-minimal pt-intent-success"
												iconName="tick"
												onClick={() => this.props.onChange(i, {complete: !task.complete})} />
								<Button className="delete-subtask-btn close-btn pt-minimal pt-intent-danger"
												iconName="cross"
												onClick={() => this.props.onDelete(i, task)} />
							</div>
						</li>
					);
				})}
			</div>
		);
	}


}
