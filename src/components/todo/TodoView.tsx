import * as $ from 'jquery';
import * as  _ from 'lodash';
import * as React from 'react';
import * as Color from 'color';
import {Spinner, Button} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import InlineText from '../InlineText';
import {dndService} from "../dnd/DragAndDropLayer";
import cxs from 'cxs';
import * as ReactDOM from "react-dom";
import * as cloudinary from 'cloudinary-core';
import TodoSettingsDialog from './TodoSettingsDialog';

const cloudName = 'dsv1fug8x';
const unsignedUploadPreset = 'fnddxf5w';
const cl = new cloudinary.Cloudinary({cloud_name: cloudName, secure: true});



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
    position: 'relative',
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

const spinnerContainerClass = cxs({
    background: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
});

const spinnerClass = cxs({
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginTop: '-26px',
    marginLeft: '-28px'
});

interface Props {
    todo: Todo;
    visible?: boolean;
    style?: Object;
    confirmDeletion: boolean;
    onDelete(todo: Todo);
}

type PreviewProps = {
    todo: Todo;
}

function getColorStyle(todo: Todo){
    const backgroundColor = _.get(todo, 'settings.color', '#eee');
    let foregroundColor;
    if(Color(backgroundColor).light()){
        foregroundColor = 'black';
    } else {
        foregroundColor = 'white';
    }
    const colorStyle = {background: backgroundColor, color: foregroundColor};
    return colorStyle;
}

class TodoDragPreview extends React.PureComponent<PreviewProps> {
    render(){
        const colorStyle = getColorStyle(this.props.todo);
        return (
            <div className={`todo-view pt-card pt-elevation-2 ${todoItemClass}`}
                 style={{padding:0, background: '#eee', margin: 0}}>
                <div>
                    <div className={'todo-wrapper ' + todoWrapperClass} style={colorStyle} >
                        <div className="drag-handle">
                            <div className="inner-icon pt-icon-drag-handle-vertical"/>
                        </div>
                        <div className={todoContentWrapperClass}>
                            <InlineText value={this.props.todo.name}
                                        editing={this.props.todo.editing}
                                        style={colorStyle}
                                        multiline={true}
                                        onChange={() => {}}
                                        onStartEditing={()=>{}}
                                        onStopEditing={()=>{}}/>
                        </div>
                        <div className="todo-controls">
                            <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" />
                            <Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" />
                            <Button className="file-upload-btn pt-intent-success pt-minimal" iconName="document" />
                        </div>
                    </div>
                    {!_.isEmpty(this.props.todo.subtasks) && <SubtaskList style={colorStyle} subtasks={this.props.todo.subtasks} onChange={_.noop} onDelete={_.noop}  /> }
                </div>
            </div>
        );
    }
}

class TodoView extends React.PureComponent<Props, {}> {

    render(){
        let extraClasses = '';
        if(this.props.todo.dragged){
            extraClasses += ' dragged';
        }
        const colorStyle = getColorStyle(this.props.todo);
        const editingClass = this.props.todo.editing ? 'editing' : '';
        const style = {
            display: this.props.visible ? 'block' : 'none',
            padding:0,
            background: '#eee',
            opacity: this.props.todo.isDragging ? 0 : undefined,
            transition: 'none',
            ...(this.props.style || {})
        };
        return (
            <div className={`todo-view pt-card pt-elevation-2 ${todoItemClass} ${extraClasses} ${editingClass}`}
                 data-todo-id={this.props.todo.id}
                 style={style}
                 onDragStart={this.onDragStart}>
                <div>
                    <div className={'todo-wrapper ' + todoWrapperClass} style={colorStyle} >
                        <div className="drag-handle" draggable={true}>
                            <div className="inner-icon pt-icon-drag-handle-vertical"/>
                        </div>
                        <div className={todoContentWrapperClass}>
                            <InlineText value={this.props.todo.name}
                                        multiline={true}
                                        style={colorStyle}
                                        placeholder="New Todo"
                                        editing={this.props.todo.editing || false}
                                        onChange={this.onNameChanged}
                                        onStartEditing={this.onStartEditing}
                                        onStopEditing={this.onStopEditing} />
                        </div>
                        <div className="todo-controls">
                            <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo} />
                            <Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" onClick={this.onAddSubtask} />
                            <Button className="todo-settings-btn pt-intent-success pt-minimal" iconName="cog" onClick={this.onOpenTodoSettings} />
                        </div>
                    </div>
                    {!_.isEmpty(this.props.todo.subtasks) && <SubtaskList style={colorStyle} subtasks={this.props.todo.subtasks} onChange={(i, changes) => this.onSubtaskChanged(i, changes)} onDelete={(i) => this.onDeleteSubtask(i)}/>}
                </div>
            </div>
        );
    }

    private onStartEditing = () => {
        this.props.todo.set({editing: true});
    }

    private onStopEditing = () => {
        this.props.todo.set({editing: false});
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
        this.props.todo.set({isDragging: true});
        const acceptDrop = await dndService.startDrag({x, y, width: $el.width(), height: $el.height()}, this.props.todo,
            <TodoDragPreview todo={this.props.todo} />
        );
        if(acceptDrop){
            acceptDrop()
            this.props.onDelete(this.props.todo);
        } else {
            this.props.todo.set({isDragging: false});
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

    private onAddSubtask = () => {
        if(!this.props.todo.subtasks){
            this.props.todo.set({
                subtasks: [{name: 'New Task'} as any]
            });
        } else {
            this.props.todo.subtasks.push({name: 'New Task'} as any);
        }
    };

    private onOpenTodoSettings = async () => {
        let settings: TodoSettings = this.props.todo.settings || {
            recurring: false,
            color: '#eee'
        };
        function onChange(newSettings: TodoSettings){
            settings = newSettings;
        }
        const result = await DialogService.showDialog("Todo Settings", "Save", "Cancel", (
            <TodoSettingsDialog settings={settings} onChange={onChange}>
            </TodoSettingsDialog>
        ));

        if(result){
            this.props.todo.set({settings});
        }
    }

    // *********** Upload file to Cloudinary ******************** //


}

export default TodoView;
