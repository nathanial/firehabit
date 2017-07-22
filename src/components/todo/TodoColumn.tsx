import * as _ from 'lodash';
import * as React from 'react';
import * as $ from 'jquery';
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
import {TimelineMax} from 'gsap';
import * as ReactDOM from "react-dom";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";

declare class ScrollArea extends React.Component<any, {}>{
	handleKeyDown(e);
}

class CustomScrollArea extends ScrollArea {
	render(){
		return super.render();
	}
	handleKeyDown(e){
		if (e.target.tagName.toLowerCase() === 'textarea') {
			return;
		} else {
			return super.handleKeyDown(e);
		}
	}
}

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
	showSettings: boolean;
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
		columnName: this.props.column.name,
		showSettings: false
	};
	private columnOffsetLeft: number;
	private animating: boolean;

	render(){
		const column = this.props.column;
		const todos = column.todos || [];
		const columnColor = column.color;
		const {connectDropTarget} = this.props;
		return(
			<div className="todo-column-and-settings" style={{display:'inline-block', position: 'relative'}}>
				{connectDropTarget(
					<div className="todo-column" style={{display:'inline-block'}}>
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
								<CustomScrollArea
									speed={0.8}
									horizontal={false}>
									{todos.map((todo) => {
										return <TodoView key={todo.id} todo={todo} confirmDeletion={column.confirmDeletion} />;
									})}
								</CustomScrollArea>
							</TodoListWrapper>
						</TodoColumnWrapper>
					</div>
				)}
				{this.renderSettings()}
			</div>
		);
	}

	private renderSettings = () => {
		if(this.state.showSettings){
			return (
				<TodoColumnSettingsPage style={{
					position: 'absolute',
					left: 300, top: 0,
					opacity: 0
				}} column={this.props.column} goBack={() => this.hideSettings()} />
			);
		}
	};

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
		if(this.animating){
			return;
		}
		if(!this.state.showSettings){
			this.showSettings();
		} else {
			this.hideSettings();
		}
	};

	private showSettings() {
		this.animating = true;
		this.setState({
			showSettings: true
		}, () => {
			const el = ReactDOM.findDOMNode(this);
			const elements = _.filter($('.todo-column-and-settings').toArray(), e => e !== el);
			const settingsEl = $(el).find('.todo-column-settings-page')[0];
			const timeline = new TimelineMax({
				onComplete: () =>{
					this.animating = false;
				}
			});
			this.columnOffsetLeft = el.offsetLeft;
			const width = $(window).outerWidth();
			const columnWidth = $(el).outerWidth();
			timeline.to(elements, 0.5, {opacity: 0});
			timeline.to(el, 0.0, {position: 'absolute'});
			timeline.to(el, 0.5, {left: width / 2 - columnWidth + 30, 'z-index': 9});
			timeline.to(settingsEl, 0.25, {opacity: 1});
		});
	}

	private hideSettings(){
		this.animating = true;
		let el;
		try {
			el = ReactDOM.findDOMNode(this);
		} catch(error) {
			console.log(error);
		}
		const elements = _.filter($('.todo-column-and-settings').toArray(), e => e !== el);
		const timeline = new TimelineMax({
			onComplete: () => {
				this.animating = false;
				this.setState({showSettings: false});
			}
		});
		if(el){
			const settingsEl = $(el).find('.todo-column-settings-page')[0];
			timeline.to(settingsEl, 0.25, {opacity: 0});
			timeline.to(el, 0.5, {left: this.columnOffsetLeft});
			timeline.to(el, 0.0, {display: 'inline-block', position: 'static', left: '', 'z-index': 0});
		}
		timeline.to(elements, 0.5, {opacity: 1});
	}

	private onClearColumn = async () => {
		const column = this.props.column;
		const result = await DialogService.showDangerDialog(`Clear Column "${column.name}"?`, 'Clear', 'Cancel');
		if(result){
			db.todoColumnsDB.updateTodoColumn(column.id, {todos: []});
		}
	};
}