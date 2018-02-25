import * as _ from 'lodash';
import * as React from 'react';
import * as $ from 'jquery';
import {Button, EditableText, Tabs2, Tab2} from "@blueprintjs/core";
import {history} from '../../util';
import {generatePushID} from '../../db/util';
import TodoView from "./TodoView";
import {TodoColumnTabs} from './TodoColumnTabs';
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
});

const columnNameClass = cxs({
    marginTop: '7px',
    marginLeft: '30px',
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

const toolbarBorderClass = cxs({
    borderBottom: '1px solid rgba(0,0,0,0.15)',
    boxShadow: "1px 4px 7px 0px rgba(0,0,0,0.03)",
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25px',
    height: '10px',
    zIndex: 99
});

interface Props {
    column: TodoColumn;
    onMoveColumnLeft(column: TodoColumn);
    onMoveColumnRight(column: TodoColumn);
    onDeleteColumn(column: TodoColumn);
}

export default class TodoColumnView extends React.PureComponent<Props> {
    private animating: boolean;
    private scrollbar: ScrollArea;
    private unregisterDropTarget: () => void;

    render(){
        const columnColor = this.props.column.color;
        const column = this.props.column;
        return(
            <div className={`todo-column-and-settings pt-card pt-elevation-2 ${todoColumnClass}`} style={{display:'inline-block', position: 'relative', height: 'calc(100% - 30px)', background: columnColor}}>
                <div className="todo-column-header" style={{background: columnColor}}>
                    <InlineText className={columnNameClass}
                                style={{color: 'white'}}
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
                    {this.renderTodoCount()}
                    <div className={toolbarBorderClass}></div>
                </div>
                {this.renderContent()}
            </div>
        );
    }

    componentDidMount(){
        const element = ReactDOM.findDOMNode(this);
        this.unregisterDropTarget = dndService.addDropTarget({
            element,
            canDrop: (draggable: Draggable) => {
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

    private renderTodoCount(){
        if(this.props.column.showTodoCount){
            return (
                <div className="todo-count">({this.props.column.todos.length})</div>
            );
        }
    }

    private renderContent(){
        const columnColor = this.props.column.color;
        const column = this.props.column;
        return (
            <div>
                {this.renderSettings()}
                {this.props.column.enableTabs &&
                    <TodoColumnTabs column={column}
                                    onHandleTabChanged={this.onHandleTabChanged} />}
                <ScrollArea ref={scrollbar => this.scrollbar = scrollbar} className="todo-list">
                    <ReactCSSTransitionGroup transitionName="todo-view" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                        {this.renderTodos()}
                    </ReactCSSTransitionGroup>
                </ScrollArea>
            </div>
        )
    }

    private renderTodos = () => {
        const column = this.props.column;
        return column.todos.map((todo) => {
            const visible = _.isUndefined(column.activeTab) || (column.activeTab === '0' && _.isUndefined(todo.tab)) || todo.tab === column.activeTab;
            return (
                <TodoView key={todo.id}
                          todo={todo}
                          visible={visible}
                          confirmDeletion={column.confirmDeletion}
                          onDelete={this.onDeleteTodo} />
            );
        });
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
        newTodo.tab = this.props.column.activeTab || '0';
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
        const narrowedDraggable = this.createNarrowedDraggable(draggable);
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

            if(intersects(narrowedDraggable, lowerHalf)){
                return {todoID: $(todoView).data('todo-id'), direction:'below'};
            }
            if(intersects(narrowedDraggable, upperHalf)){
                return {todoID: $(todoView).data('todo-id'), direction:'above'};
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
            const topTodo = _.first(todoViews);
            let todoID;
            if(topTodo){
                todoID = $(topTodo).data('todo-id');
            }
            return {
                todoID,
                direction: 'above'
            };
        }
        return {
            todoID: null,
            direction: 'none'
        };
    }

    private createNarrowedDraggable(draggable: Draggable): Draggable {
        if(draggable.height > 40){
            const deltaHeight = draggable.height - 40;
            return {
                ...draggable,
                x: draggable.x,
                y: deltaHeight / 2 + draggable.y,
                width: draggable.width,
                height: 40
            };
        }
    }

    private renderSettings = () => {
        return (
            <ReactCSSTransitionGroup transitionName="settings" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                {this.props.column.showSettings &&
                    <TodoColumnSettingsPage column={this.props.column}
                                            onDelete={this.onDeleteColumn}
                                            onMoveLeft={this.props.onMoveColumnLeft}
                                            onMoveRight={this.props.onMoveColumnRight} />
                }
            </ReactCSSTransitionGroup>
        );
    };

    private onHandleTabChanged = (id: string) => {
        this.props.column.set({activeTab: id});
        this.scrollbar.stayInPlace = false;
        this.scrollbar.resetTop().then(() => {
            this.scrollbar.stayInPlace = true;
        });
    }

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
            name: '',
            subtasks: [],
            attachments: [],
            editing: true,
            tab: this.props.column.activeTab || '0'
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
