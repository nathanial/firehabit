import * as _ from 'lodash';
import * as React from 'react';
import * as $ from 'jquery';
import {Button, EditableText} from "@blueprintjs/core";
import {history} from '../../util';
import {generatePushID} from '../../db/util';
import styled from 'styled-components';
import TodoView from "./TodoView";
import ScrollArea from '../ScrollArea';
import * as colors from '../../theme/colors';
import cxs from 'cxs';
import DialogService from "../../services/DialogService";
import * as ReactDOM from "react-dom";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import InlineText from '../InlineText';
import {dndService, Draggable, intersects} from "../dnd/DragAndDropLayer";
import * as  ReactCSSTransitionGroup from 'react-addons-css-transition-group';


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
    marginTop: '-12px',
    width: '200px'
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

const todoListClass = cxs({
    'list-style-type': 'none',
    margin: 0,
    paddingTop: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '35px',
    '.todo-view': {
        marginLeft: '20px'
    }
});

const toolbarBorderClass = cxs({
    borderBottom: '1px solid rgba(0,0,0,0.15)',
    boxShadow: "1px 4px 7px 0px rgba(0,0,0,0.03)",
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25px',
    height: '10px',
    zIndex: 9999
});

interface Props {
    column: TodoColumn;
    onDeleteColumn(column: TodoColumn);
}

export default class TodoColumnView extends React.PureComponent<Props> {
    private animating: boolean;
    private unregisterDropTarget: () => void;

    render(){
        const columnColor = this.props.column.color;
        const column = this.props.column;
        return(
            <div className={`todo-column-and-settings pt-card pt-elevation-2 ${todoColumnClass}`} style={{display:'inline-block', position: 'relative', height: 'calc(100% - 30px)', background: columnColor}}>
                <InlineText className={columnNameClass}
                            editing={this.props.column.editingName}
                            value={this.props.column.name}
                            onChange={this.onChangeColumnName}
                            onStartEditing={this.onStartEditing}
                            onStopEditing={this.onStopEditing}/>
                <Button iconName="settings"
                        className="settings-btn pt-minimal"
                        onClick={this.gotoColumnSettings} />
                <Button iconName="plus"
                        className={`${addTodoBtnClass} pt-minimal pt-intent-success`}
                        onClick={this.onAddTodo} />
                {this.renderTrashBtn()}
                <div className={toolbarBorderClass}></div>
                {this.renderContent()}
            </div>
        );
    }

    componentDidMount(){
        const element = ReactDOM.findDOMNode(this);
        this.unregisterDropTarget = dndService.addDropTarget({
            element,
            canDrop: (draggable: Draggable,) => {
                return true;
            },
            onDrop: (draggable: Draggable) => {
                const {todoID, direction} = this.findNeighbor(draggable);
                let index = this.props.column.todos.length;
                if(todoID){
                    const todo = _.find(this.props.column.todos, (todo: Todo) => todo.id === todoID);
                    index = _.findIndex(this.props.column.todos, (todo: Todo) => todo.id === todoID);
                    if(direction !== 'above'){
                        index += 1;
                    }
                }
                this.dropTodo(draggable.data,index);
            },
            onHover: (draggable: Draggable) => {
                const {todoID, direction} = this.findNeighbor(draggable);
                let index = this.props.column.todos.length;
                if(todoID){
                    const todo = _.find(this.props.column.todos, (todo: Todo) => todo.id === todoID);
                    index = _.findIndex(this.props.column.todos, (todo: Todo) => todo.id === todoID);
                    if(direction !== 'above'){
                        index += 1;
                    }
                }
            }
        });
    }

    componentWillUnmount(){
        if(this.unregisterDropTarget){
            this.unregisterDropTarget();
            this.unregisterDropTarget = null;
        }
    }

    private renderContent(){
        const columnColor = this.props.column.color;
        const column = this.props.column;
        if(this.props.column.showSettings){
            return this.renderSettings();
        }
        return (
            <ScrollArea className={todoListClass}>
                <ReactCSSTransitionGroup transitionName="todo-view" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                    {column.todos.map((todo) => {
                        return <TodoView key={todo.id} todo={todo} confirmDeletion={column.confirmDeletion} onDelete={this.onDeleteTodo} />;
                    })}
                </ReactCSSTransitionGroup>
            </ScrollArea>
        );
    }

    private onStartEditing = () => {
        this.props.column.set({editingName: true});
    };

    private onStopEditing = () => {
        this.props.column.set({editingName: false});
    };

    private dropTodo(todo: Todo, index: number){
        const newTodo = _.cloneDeep(todo);
        newTodo.id = generatePushID();
        newTodo.dragged = true;
        this.props.column.todos.splice(index, 0, newTodo);
    }

    private onDeleteTodo = (todo: Todo) => {
        const index = _.findIndex(this.props.column.todos, t => t.id === todo.id);
        if(index >= 0){
            this.props.column.todos.splice(index, 1);
        }
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
            return (
                <TodoColumnSettingsPage 
                    column={this.props.column} 
                    onDelete={this.onDeleteColumn} />
            );
        }
    };

    private onDeleteColumn = (columnID: string) => {
        this.props.onDeleteColumn(this.props.column);
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
        this.props.column.todos.unshift({
            id: generatePushID(), 
            name: 'NEW TODO', 
            subtasks: [],
            attachments: []
        });
    };

    private onChangeColumnName = (newName) => {
        this.props.column.set({name: newName});
    };

    private gotoColumnSettings = () => {
        this.props.column.set({showSettings: !this.props.column.showSettings});
    };

    private onClearColumn = async () => {
        const column = this.props.column;
        const result = await DialogService.showDangerDialog(`Clear Column "${column.name}"?`, 'Clear', 'Cancel');
        if(result){
            this.props.column.set({todos: []});
        }
    };

}