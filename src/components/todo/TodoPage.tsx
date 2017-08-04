import * as React from 'react';
import TodoColumnView from "./TodoColumnView";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import TodoTopbar from "./TodoTopbar";
import cxs from 'cxs';
import {DragAndDropLayer} from "../dnd/DragAndDropLayer";

const todoPageClass = cxs({
	display: 'block',
	'text-align': 'left',
	position: 'absolute',
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
	padding: '15px 0',
	'white-space': 'nowrap'
});

const columnsContainerClass = cxs({
	width: '100%',
	height: `calc(100% - 37px)`,
	'overflow-x': 'auto',
	'padding': '0 20px'
});

type Props = {
	todoColumns: TodoColumn[];
}

class ColumnsPage extends React.PureComponent<Props> {
	render(){
		const todoColumns = this.props.todoColumns;
		return (
			<div className={todoPageClass}>
				<TodoTopbar todoColumns={todoColumns} />
				<div className={columnsContainerClass}>
					{todoColumns.map((column) => {
						return <TodoColumnView key={column.id} column={column} onDelete={this.onDeleteColumn} />
					})}
				</div>
				<DragAndDropLayer />
			</div>
		);
	}

	onDeleteColumn = (column) => this.props.todoColumns.splice(this.props.todoColumns.indexOf(column), 1);
}

type TodoPageProps = {
	todoColumns: TodoColumn[];
}

export default class TodoPage extends React.PureComponent<TodoPageProps> {
	render(){
		return (
			<ColumnsPage todoColumns={this.props.todoColumns} />
		);
	}
}