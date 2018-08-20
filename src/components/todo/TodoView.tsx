import * as  _ from 'lodash';
import * as React from 'react';
import * as Color from 'color';
import {Spinner, Button} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import InlineText from '../InlineText';
import cxs from 'cxs';
import * as ReactDOM from "react-dom";
import {CompactPicker} from 'react-color';
import posed from 'react-pose';

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

type State = {
    settingsVisible: Boolean
}

const Drawer = posed.div({
    visible: {
        height: props => props.height
    },
    hidden: {
        height: 0
    }
})

const availableColors = [
    '#EEEEEE', // default color
    '#4D4D4D', '#999999', '#FFFFFF',
    '#F44E3B', '#FE9200', '#FCDC00',
    '#DBDF00', '#A4DD00', '#68CCCA',
    '#73D8FF', '#AEA1FF', '#FDA1FF',
    '#333333', '#808080', '#cccccc',
    '#D33115', '#E27300', '#FCC400',
    '#B0BC00', '#68BC00', '#16A5A5',
    '#009CE0', '#7B64FF', '#FA28FF',
    '#000000', '#666666', '#B3B3B3',
    '#9F0500', '#C45100', '#FB9E00',
    '#808900', '#194D33', '#0C797D',
    '#0062B1', '#653294', '#AB149E'
]

export default class TodoView extends React.PureComponent<Props, State> {

    state = {
        settingsVisible: false
    }

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
        const otherProps = _.omit(this.props, ['todo', 'visible', 'style', 'confirmDeletion', 'onDelete']);
        return (
            <div className="todo-view-wrapper">
                <div className={`todo-view pt-card pt-elevation-2 ${extraClasses} ${editingClass}`}
                    data-todo-id={this.props.todo.id}
                    style={style}
                    {...otherProps}>
                    <div  style={colorStyle}>
                        <div className="todo-main-content">
                            <div className='todo-wrapper' >
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
                        <Drawer pose={this.state.settingsVisible ? 'visible' : 'hidden'} height={138} style={{background: 'white'}}>
                            {this.renderSettings()}
                        </Drawer>
                    </div>
                </div>
            </div>
        );
    }

    private renderSettings = () => {
        if(this.state.settingsVisible){
            const settings = this.props.todo.settings || {
                recurring: false,
                color: '#eee'
            };
            return (
                <div className="todo-settings" onMouseDown={(event) => event.stopPropagation()}>
                    <label>Is Recurring</label>
                    <CompactPicker color={settings.color} colors={availableColors} onChange={this.onChangeColor}/>
                </div>
            )
        }
    }

    private onChangeColor = (newColor) => {
        this.props.todo.set({
            settings: _.extend({}, this.props.todo.settings || {}, {color: newColor.hex}) as any
        });
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

    private onOpenTodoSettings = () => {
        this.setState({
            settingsVisible: !this.state.settingsVisible
        })
    }

}

