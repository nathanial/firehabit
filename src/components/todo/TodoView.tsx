import * as $ from 'jquery';
import * as  _ from 'lodash';
import * as React from 'react';
import {EditableText, Button} from "@blueprintjs/core";
import styled from 'styled-components';
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import {dndService} from "../dnd/DragAndDropLayer";
import cxs from 'cxs';
import * as ReactDOM from "react-dom";

const todoContentWrapperClass = cxs({
    position: 'relative',
    display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
    '.pt-editable-text': {
        'max-width': '180px'
    },
    flex: '2 0 0' 
});

const todoItemClass = cxs({
    padding: '10px',
    margin: '10px',
    color: 'black',
    'text-align': 'left',
    cursor: 'pointer',
    width: '240px'
});

const todoWrapperClass = cxs({
    position: 'relative',
    padding: '10px 0',
    display: 'flex',
    'flex-direction': 'row'
});

const TodoWrapper = styled.div`
    .drag-handle {
        bottom: 0;
        width: 30px;
        font-size: 24px;
        
        .inner-icon {
            position: absolute;
            top: 50%;
            margin-top: -17px;
        }
    }
    border-radius: 0;
    
    &:hover {
        .todo-controls {
            opacity: 1;
        }
    }

    .todo-controls {
        height: 37px;
        position: relative;
        display: flex;
        flex-direction: column;
        background: white;
        border-left: 1px solid #ccc;
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
        opacity: 0;
        .delete-btn {
            min-width: 18px;
            min-height: 18px;
            line-height: 18px;
            transition: opacity 0.2s ease-out;
            &:before {
                font-size: 12px;
                vertical-align: middle;
            }
        }
        
        transition: opacity 0.2s ease-in-out;
        
        .add-subtask-btn {
            min-width: 18px;
            min-height: 18px;
            line-height: 10px;
            &:before {
                font-size: 12px;
                vertical-align: middle;
            }		
        }
    }
`;

interface Props {
    todo: Todo;
    confirmDeletion: boolean;
    isDragging?: boolean;
    onDelete(todo: Todo);
}

interface State {
    dragging: boolean;
}

type PreviewProps = {
    todo: Todo;
}

class TodoDragPreview extends React.PureComponent<PreviewProps> {
    render(){
        return (
            <div className={`pt-card pt-elevation-2 ${todoItemClass}`}
                 style={{padding:0, background: '#eee', margin: 0}}>
                <div>
                    <TodoWrapper className={todoWrapperClass} >
                        <div className="drag-handle">
                            <div className="inner-icon pt-icon-drag-handle-vertical"/>
                        </div>
                        <div className={todoContentWrapperClass}>
                            <EditableText value={this.props.todo.name}
                                          multiline={true}/>
                        </div>
                        <div className="todo-controls">
                            <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" />
                            <Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" />
                        </div>
                    </TodoWrapper>
                    <SubtaskList subtasks={this.props.todo.subtasks} onChange={_.noop} onDelete={_.noop}  />
                </div>
            </div>
        );
    }
}

class TodoView extends React.Component<Props, State> {

    state = {
        dragging: false
    };

    render(){
        return (
            <div className={`todo-view pt-card pt-elevation-2 ${todoItemClass}`}
                 data-todo-id={this.props.todo.id}
                 style={{
                    padding:0,
                    background: '#eee',
                    opacity: this.state.dragging ? 0 : undefined,
                    transition: 'none'
                }}
                 onDragStart={this.onDragStart}>
                <div>
                    <TodoWrapper className={todoWrapperClass} >
                        <div className="drag-handle" draggable={true}>
                            <div className="inner-icon pt-icon-drag-handle-vertical"/>
                        </div>
                        <div className={todoContentWrapperClass}>
                            <EditableText value={this.props.todo.name}
                                          multiline={true}
                                          onChange={this.onNameChanged} />
                        </div>
                        <div className="todo-controls">
                            <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo} />
                            <Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" onClick={this.onAddSubtask} />
                        </div>
                    </TodoWrapper>
                    <SubtaskList subtasks={this.props.todo.subtasks} onChange={(i, changes) => this.onSubtaskChanged(i, changes)} onDelete={(i) => this.onDeleteSubtask(i)}/>
                </div>
            </div>
        );
    }

    private onSubtaskChanged(index: number, changes: Partial<Subtask>){
        this.props.todo.subtasks[index].set(changes);
    }

    private onDeleteSubtask(index: number) {
        this.props.todo.subtasks.splice(index, 1);
    }

    private onDragStart = async (event) => {
        event.preventDefault();
        const el = ReactDOM.findDOMNode(this);
        const $el = $(el);
        const offset = $el.offset();
        const x = offset.left;
        const y = offset.top;
        this.setState({
            dragging: true
        });
        const dropped = await dndService.startDrag({x, y, width: $el.width(), height: $el.height()}, this.props.todo,
            <TodoDragPreview todo={this.props.todo} />
        );
        if(dropped){
            this.props.onDelete(this.props.todo);
        } else {
            this.setState({
                dragging: false
            });
        }
    };

    private onNameChanged = (newName) => {
        this.props.todo.set({name: newName});
    };

    private onDeleteTodo = async () => {
        if(this.props.confirmDeletion) {
            const result = await DialogService.showDangerDialog("Are you sure you want to delete this TODO?", "Delete", "Cancel");
            if(result){
                this.props.onDelete(this.props.todo);
            }
        } else {
            this.props.onDelete(this.props.todo);
        }
    };

    private onAddSubtask = async () => {
        this.props.todo.subtasks.push({name: 'New Task'} as any);
    };

}

export default TodoView;