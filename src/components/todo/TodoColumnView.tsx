import * as _ from 'lodash';
import * as React from 'react';
import * as $ from 'jquery';
import {Button, EditableText} from "@blueprintjs/core";
import {history} from '../../util';
import styled from 'styled-components';
import TodoView from "./TodoView";
import ScrollArea from 'react-scrollbar';
import * as colors from '../../theme/colors';
import cxs from 'cxs';
import DialogService from "../../services/DialogService";
import {TimelineMax} from 'gsap';
import * as ReactDOM from "react-dom";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import {dndService, Draggable, intersects} from "../dnd/DragAndDropLayer";

/**
 * Animation Plan
 *
 * 	Step 1. don't display none other columns
 * 	Step 2. use relative positioning to move column to the right spot
 * 	Step 3. let is snap back into place by setting left: 0
 *
**/

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
	height: '100%',
	position: 'relative',
	verticalAlign: 'top',
	overflow: 'hidden',
	'.settings-btn': {
		position: 'absolute',
		top: 0,
		right: 0
	},
	'h4' : {
		'margin-top': '4px'
	}
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
		&:first-child {
			margin-top: 0;
		}
	}
`;

interface Props {
	column: TodoColumn;
	onTodoDropped(todo: Todo, column: TodoColumn, index: number);
	onUpdateTodo(column: TodoColumn, todo: Todo);
	onDeleteTodo(column: TodoColumn, todo: Todo);
	onAddTodo(column: TodoColumn, todo: Partial<Todo>);
	onUpdateColumn(columnID: string, changes: Partial<TodoColumn>);
}

interface State {
	columnName: string;
	showSettings: boolean;
}

export default class TodoColumnView extends React.Component<Props, State> {
	state = {
		columnName: this.props.column.name,
		showSettings: false
	};
	private animating: boolean;
	private unregisterDropTarget: () => void;

	render(){
		const column = this.props.column;
		const todos = _.sortBy(column.todos, todo => todo.index);
		const columnColor = column.color;
		return(
			<div className="todo-column-and-settings" style={{display:'inline-block', position: 'relative', height: '100%'}}>
				<div className="todo-column" style={{display:'inline-block', height: 'calc(100% - 30px)'}}>
					<div className={`pt-card pt-elevation-2 ${todoColumnClass}`}
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
									return <TodoView key={todo.id} todo={todo} confirmDeletion={column.confirmDeletion} onUpdate={this.onUpdateTodo} onDelete={this.onDeleteTodo} />;
								})}
							</CustomScrollArea>
						</TodoListWrapper>
					</div>
				</div>
				{this.renderSettings()}
			</div>
		);
	}

	componentDidMount(){
		const element = ReactDOM.findDOMNode(this);
		this.unregisterDropTarget = dndService.addDropTarget({
			element,
			onDrop: (draggable: Draggable) => {
				const {todoID, direction} = this.findNeighbor(draggable);
				let index = this.props.column.todos.length;
				if(todoID){
                    const todo = _.find(this.props.column.todos, (todo: Todo) => todo.id === todoID);
					index = _.find(this.props.column.todos, (todo: Todo) => todo.id === todoID).index;
                    if(direction === 'above'){
						index -= 1;
					}
				}
				this.props.onTodoDropped(draggable.data, this.props.column,index);
			}
		});
	}

	componentWillUnmount(){
		if(this.unregisterDropTarget){
			this.unregisterDropTarget();
			this.unregisterDropTarget = null;
		}
	}

	private onUpdateTodo = (todo: Todo) => {
		this.props.onUpdateTodo(this.props.column, todo);
	};

	private onDeleteTodo = (todo: Todo) => {
		this.props.onDeleteTodo(this.props.column, todo);
	};

	private findNeighbor(draggable: Draggable){
		const $el = $(ReactDOM.findDOMNode(this));
		const todoViews = $el.find('.todo-view').toArray();
		if(_.isEmpty(todoViews)){
			return {
				todoID: null,
				direction: 'none'
			};
		}

		for(let todoView of todoViews){
			const rect = todoView.getBoundingClientRect();
			const upperHalf = {
				left: rect.left,
				right: rect.right,
				top: rect.top,
				bottom: rect.height / 2 + rect.top
			};
			const lowerHalf = {
				left: rect.left,
				right: rect.right,
				top: rect.height / 2 + rect.top,
				bottom: rect.bottom
			};
			if(intersects(draggable, upperHalf)){
				return {todoID: $(todoView).data('todo-id'), direction:'above'};
			}
			if(intersects(draggable, lowerHalf)){
				return {todoID: $(todoView).data('todo-id'), direction:'below'};
			}
		}
		// above all
		function lessThanAll(){
			return !_.some(todoViews, (todoView) => {
				const rect = todoView.getBoundingClientRect();
				const draggableBottom = draggable.y + draggable.height;
				return draggableBottom > rect.top;
			});
		}
		if(lessThanAll()){
			return {
				todoID: _.first(todoViews),
				direction: 'above'
			};
		}
		return {
			todoID: null,
			direction: 'none'
		};
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
		this.props.onAddTodo(this.props.column, {name: 'NEW TODO'});
	};

	private onChangeColumnName = (newName) => {
		this.setState({
			columnName: newName
		});
	};

	private onFinishEditingColumnName = () => {
		this.props.onUpdateColumn(this.props.column.id, {name: this.state.columnName});
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
			const columnWidth = $(el).outerWidth();
			const width = $(window).outerWidth();
			const centerX = width / 2 - columnWidth;
			const actualX = $(el).offset().left;
			timeline.to(elements, 0.5, {opacity: 0});
			timeline.to(el, 0.5, {position: 'relative', left: centerX - actualX, 'z-index': 9});
			timeline.to(settingsEl, 0.25, {opacity: 1});
		});
	}

	private hideSettings(){
		this.animating = true;
		let el = null;
		try {
			el = ReactDOM.findDOMNode(this);
		} catch(err){

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
			timeline.to(el, 0.5, {position: 'relative', left: 0, 'z-index': 0});
		}

		timeline.to(elements, 0.5, {opacity: 1});
	}

	private onClearColumn = async () => {
		const column = this.props.column;
		const result = await DialogService.showDangerDialog(`Clear Column "${column.name}"?`, 'Clear', 'Cancel');
		if(result){
			this.props.onUpdateColumn(column.id, {todos: []});
		}
	};

}