import * as _ from 'lodash';
import * as React from 'react';
import * as $ from 'jquery';
import {Button, EditableText} from "@blueprintjs/core";
import styled from 'styled-components';
import TodoView from "./TodoView";
import * as colors from '../../theme/colors';
import cxs from 'cxs';
import DialogService from "../../services/DialogService";
import {TimelineMax} from 'gsap';
import * as ReactDOM from "react-dom";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import {dndService, Draggable, intersects} from "../dnd/DragAndDropLayer";
import * as uuidv4 from 'uuid/v4';
import TodoList from "./TodoList";

/**
 * Animation Plan
 *
 * 	Step 1. don't display none other columns
 * 	Step 2. use relative positioning to move column to the right spot
 * 	Step 3. let is snap back into place by setting left: 0
 *
**/


const todoColumnClass = cxs({
	display: 'inline-block',
	margin: '10px',
	padding: '20px 0px 10px 10px',
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

const settingsBtnClass = cxs({
	position: 'absolute',
	top: 0,
	right: 0
});


interface Props {
	column: TodoColumn;
	onDelete(column: TodoColumn);
}

export default class TodoColumnView extends React.PureComponent<Props> {
	private animating: boolean;
	private unregisterDropTarget: () => void;

	render(){
		const column = this.props.column;
		const todos = column.todos;
		const columnColor = column.color;
		return(
			<div className="todo-column-and-settings" style={{display:'inline-block', position: 'relative'}}>
				<div className="todo-column" style={{display:'inline-block'}}>
					<div style={{overflow: 'hidden', background: columnColor}} className={`pt-card pt-elevation-2 ${todoColumnClass}`}>
						<EditableText className={columnNameClass}
									  value={column.name}
									  onChange={this.onChangeColumnName}
									  onConfirm={this.onFinishEditingColumnName} />
						<Button iconName="settings"
								className={`${settingsBtnClass} pt-minimal`}
								onClick={this.gotoColumnSettings} />
						<Button iconName="plus"
								className={`${addTodoBtnClass} pt-minimal pt-intent-success`}
								onClick={this.onAddTodo} />
						{this.renderTrashBtn()}
						<TodoList column={this.props.column} />
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
				const todos = this.props.column.todos;
				let index = todos.length;
				console.log("Drop", todoID, direction);
				if(todoID){
					index = _.findIndex(todos, (todo: Todo) => todo.id === todoID);
					if(direction === 'above'){
						index -= 1;
					}
				}
				return {column: this.props.column, index};
			},
			onHover: (draggable: Draggable) => {
				const {todoID, direction} = this.findNeighbor(draggable);
				this.showPreviewOfDrop(todoID, direction, draggable);
			}
		});
	}

	componentWillUnmount(){
		if(this.unregisterDropTarget){
			this.unregisterDropTarget();
			this.unregisterDropTarget = null;
		}
	}

	private showPreviewOfDrop(todoID: string, direction: string, draggable: Draggable) {
		
		console.log("Show Preview of Drop", todoID, direction, draggable);
	}

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
		if(this.props.column.showSettings){
			const style = {
				position: 'absolute',
				left: 300, top: 0,
				opacity: 0
			};
			return (
				<TodoColumnSettingsPage
					style={style}
					column={this.props.column}
					goBack={() => this.hideSettings()}
					onDelete={() => this.props.onDelete(this.props.column)} />
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
		this.props.column.todos.push({
			id: uuidv4(),
			name: 'NEW TODO',
			subtasks: []
		});
	};

	private onChangeColumnName = (newName) => {
		this.setState({
			columnName: newName
		});
	};

	private onFinishEditingColumnName = () => {
		this.props.column.set({name: this.props.column.name});
	};

	private gotoColumnSettings = () => {
		if(this.animating){
			return;
		}
		if(!this.props.column.showSettings){
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
			column.todos.reset([]);
		}
	};

}