import * as React from 'react';
import {Button, EditableText} from "@blueprintjs/core";
import {db, history} from '../../util';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoView from "./TodoView";
import {DropTarget} from 'react-dnd';
import ScrollArea from 'react-scrollbar';
import * as colors from '../../theme/colors';
import cxs from 'cxs';
import DialogService from "../../services/DialogService";

const todoColumnClass = cxs({
	display: 'inline-block',
	margin: '10px',
	padding: '20px 10px 10px 10px',
	width: '280px',
	textAlign: 'center',
	height: '600px',
	position: 'relative',
	verticalAlign: 'top'
}) ;

const columnNameClass = cxs({
	marginTop: '-12px'
});

const addTodoBtnClass = cxs({
	position: 'absolute',
	left: 0,
	top: 0
});

const trashBtnClass = cxs({
	position: 'absolute',
	right: 30,
	top: 0
});

const TodoColumnWrapper = styled.div`
	& > .settings-btn {
		position: absolute;
		top: 0;
		right: 0;
	}
	
	& > h4 {
		margin-top: 0;
	}
	
	overflow: hidden;
`;

const TodoListWrapper = styled.ul`
	list-style-type: none;
	margin: 0;
	padding: 0;
	overflow-y: auto;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 40px;
	
	& > .scrollarea {
		height: 100%;
		& > .scrollarea-content {
			padding-left: 10px;
			padding-right: 10px;
		}
		
		.scrollbar-container {
			z-index: 1;
		 }
		
		& > .scrollbar-container.vertical {
			& > .scrollbar {
				background: ${colors.primaryColor2};
			}
			&:hover {
				background: ${colors.primaryColor1};
			}
		}
	}

	& > .scrollarea > .scrollarea-content > li {
		padding: 10px;
		background: #eee !important;
		margin: 10px;
		color: black;
		text-align: left;
		cursor: pointer;
		
		&:first-child {
			margin-top: 0;
		}
		
	}
`;

interface Props {
	column: TodoColumn;
	connectDropTarget?: any;
}

interface State {
	columnName: string;
}

@DropTarget("todo", {
	drop(props, monitor) {
		const {todo} = monitor.getItem();
		db.todoColumnsDB.moveTodo(todo, props.column);
	}
}, (connect, monitor) => {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
})
@observer
export default class TodoColumnView extends React.Component<Props, State> {

	state = {
		columnName: this.props.column.name
	};

	render(){
		const column = this.props.column;
		const todos = column.todos || [];
		const columnColor = column.color;
		const {connectDropTarget} = this.props;
		return connectDropTarget(
			<div style={{display:'inline-block'}}>
				<TodoColumnWrapper className={`pt-card pt-elevation-2 ${todoColumnClass}`}
								   style={{background: columnColor}}>
					<EditableText className={columnNameClass}
								  value={this.state.columnName}
								  onChange={this.onChangeColumnName}
								  onConfirm={this.onFinishEditingColumnName} />
					<Button iconName="settings"
							className="settings-btn pt-minimal"
							onClick={this.gotoColumnSettings} />
					<Button iconName="plus"
							className={`${addTodoBtnClass} pt-minimal pt-intent-success`}
							onClick={this.onAddTodo} />
					{this.renderTrashBtn()}
					<TodoListWrapper>
						<ScrollArea
							speed={0.8}
							horizontal={false}>
							{todos.map((todo) => {
								return <TodoView key={todo.id} todo={todo} confirmDeletion={column.confirmDeletion} />;
							})}
						</ScrollArea>
					</TodoListWrapper>
				</TodoColumnWrapper>
			</div>
		);
	}

	private renderTrashBtn = () => {
		if(this.props.column.showClearButton){
			return (
				<Button iconName="trash"
						className={`${trashBtnClass} pt-minimal pt-intent-danger`}
						onClick={this.onClearColumn} />
			);
		}
	};

	private onAddTodo = async () => {
		db.todoColumnsDB.addTodo(this.props.column, {name: 'NEW TODO'});
	};

	private onChangeColumnName = (newName) => {
		this.setState({
			columnName: newName
		});
	};

	private onFinishEditingColumnName = () => {
		db.todoColumnsDB.updateTodoColumn(this.props.column.id, {name: this.state.columnName});
	};

	private gotoColumnSettings = () => {
		history.push(`/todo/column/${this.props.column.id}/settings`);
	};

	private onClearColumn = async () => {
		const column = this.props.column;
		const result = await DialogService.showDangerDialog(`Clear Column "${column.name}"?`, 'Clear', 'Cancel');
		if(result){
			db.todoColumnsDB.updateTodoColumn(column.id, {todos: []});
		}
	};
}