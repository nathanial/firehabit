import * as $ from 'jquery';
import * as  _ from 'lodash';
import * as React from 'react';
import * as Color from 'color';
import {Spinner, Button} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import InlineText from '../InlineText';
import cxs from 'cxs';
import * as ReactDOM from "react-dom";
import TodoSettingsDialog from './TodoSettingsDialog';

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

export default class TodoView extends React.PureComponent<Props, {}> {

    render(){
        console.log("RENDER ME", this.props.todo.name);
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
        const otherProps = _.omit(this.props, ['todo', 'visible', 'style', 'confirmDeletion', 'onDelete']);
        return (
            <div className="todo-view-wrapper">
                <div className={`todo-view pt-card pt-elevation-2 ${extraClasses} ${editingClass}`}
                    data-todo-id={this.props.todo.id}
                    style={style}
                    {...otherProps}>
                    <div>
                        <div className='todo-wrapper' style={colorStyle} >
                            <div className="drag-handle" draggable={true}>
                                <div className="inner-icon pt-icon-drag-handle-vertical"/>
                            </div>
                            <div className='todo-content-wrapper'>
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

}

