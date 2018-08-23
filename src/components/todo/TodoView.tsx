import * as  _ from 'lodash';
import * as React from 'react';
import * as Color from 'color';
import {Spinner, Button, Tooltip} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import InlineText from '../InlineText';
import cxs from 'cxs';
import * as ReactDOM from "react-dom";
import {CompactPicker} from 'react-color';
import posed from 'react-pose';
import { LAST_COMPLETED_FORMAT } from '../../db/DB';
import * as moment from 'moment';

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
                            {this.renderRecurring()}
                            {!_.isEmpty(this.props.todo.subtasks) && <SubtaskList style={colorStyle} subtasks={this.props.todo.subtasks} onChange={(i, changes) => this.onSubtaskChanged(i, changes)} onDelete={(i) => this.onDeleteSubtask(i)}/>}
                        </div>
                        <Drawer pose={this.state.settingsVisible ? 'visible' : 'hidden'} height={300} style={{background: 'white'}}>
                            <div className="settings-border" />
                            {this.renderSettings()}
                        </Drawer>
                    </div>
                </div>
            </div>
        );
    }

    private refreshInterval: any;
    componentDidMount(){
        const timed = _.get(this.props.todo.settings, 'timed', false);
        if(timed){
            this.refreshInterval = setInterval(() => this.forceUpdate(), 10 * 1000);
        }
    }

    componentWillUnmount(){
        clearInterval(this.refreshInterval);
    }

    private renderRecurring = () => {
        const todo = this.props.todo;
        const settings = this.getSettings();
        let lastCompleted = "never";
        if(todo.lastCompleted) {
            lastCompleted = moment(todo.lastCompleted, LAST_COMPLETED_FORMAT).fromNow();
        }
        if(settings.recurring){
            let intervalMinutes = 0;
            if(settings.recurringInterval == "hourly"){
                intervalMinutes = 60;
            } else if(settings.recurringInterval == "daily"){
                intervalMinutes = 60 * 24;
            } else if(settings.recurringInterval == "weekly") {
                intervalMinutes = 60 * 24 * 7;
            } else if(settings.recurringInterval == "monthly") {
                intervalMinutes = 60 * 24 * 30;
            } else if(settings.recurringInterval == "yearly") {
                intervalMinutes = 60 * 24 * 365;
            } else {
                throw new Error(`Unknown interval: ${settings.recurringInterval}`);
            }
            const timed = _.get(this.props.todo.settings, 'timed', false);
            const minutesRequiredPerInterval = _.get(this.props.todo.settings, 'minutesRequired', 0);
            let percentage = 0;
            let deficit = 0;
            if(timed){
                const intervalsSinceStart = this.getMinutesExpired() / intervalMinutes;
                const totalMinutes = intervalsSinceStart * minutesRequiredPerInterval;
                const workedMinutes = this.getTimeCompleted();
                deficit = totalMinutes - workedMinutes;
                percentage = 100 - (deficit / minutesRequiredPerInterval) * 100;
            } else {
                const minutesExpired = moment.duration(
                    moment().diff(moment(todo.lastCompleted, LAST_COMPLETED_FORMAT))).asMinutes();
                percentage = 100 - Math.floor(Math.min((minutesExpired / intervalMinutes) * 100, 100));
            }
            if(percentage < 0){
                percentage = 0
            }
            if(percentage > 100){
                percentage = 100
            }
            return (
                <div className="recurring-task">
                    <div className="recurring-progress">
                        <div className="progress-indicator" style={{width: `${percentage}%`}} />
                    </div>
                    {!timed &&
                        <div className="complete-btn" onMouseDown={this.onRecurringComplete}>
                            {percentage > 0 && <i className="fa fa-check" />}
                        </div>
                    }

                    {this.renderPauseAndPlay()}
                    {this.renderTimedStatus(lastCompleted, deficit)}
                    {this.renderControlButtons()}
                </div>
            )
        }
    }

    private renderTimedStatus = (lastCompleted: String, deficit: number) => {
        const timed = _.get(this.props.todo.settings, 'timed', false);
        if(timed){
            return [
                <span className="last-completed-title">Deficit:</span>,
                <span className="last-completed-value">{Math.round(deficit)} minutes</span>
            ]
        } else {
            return [
                <span className="last-completed-title">Last Completed:</span>,
                <span className="last-completed-value">{lastCompleted}</span>
            ];
        }

    }

    private getMinutesExpired = () => {
        const todo = this.props.todo;
        const timed = _.get(this.props.todo.settings, 'timed', false);
        if(timed){
            const start = _.first(this.props.todo.startStopEvents);
            if(start){
                return moment.duration(moment().diff(moment(start.time))).asMinutes();
            } else {
                return 0;
            }
        } else {
            return moment.duration(moment().diff(moment(todo.lastCompleted, LAST_COMPLETED_FORMAT))).asMinutes();
        }
    }

    private getTimeCompleted = () => {
        type Period = {start: moment.Moment; stop: moment.Moment}

        const startStopEvents = this.props.todo.startStopEvents || [];
        const periods: Period[] = [];
        let newPeriod: Period = null;
        for(let event of startStopEvents){
            if(event.kind === "play"){
                newPeriod = {start: moment(event.time), stop: null};
            }
            if(event.kind === "stop"){
                newPeriod.stop = moment(event.time);
                periods.push(newPeriod)
                newPeriod = null;
            }
        }
        if(newPeriod){
            newPeriod.stop = moment();
            periods.push(newPeriod);
        }
        return _.sumBy(periods, p => {
            return moment.duration(p.stop.diff(p.start)).asMinutes()
        }) + (this.props.todo.fiatMinutes || 0);
    }

    private renderPauseAndPlay = () => {
        const timed = _.get(this.props.todo.settings, 'timed');
        const startStopEvents = this.props.todo.startStopEvents || [];
        const lastEvent = _.last(startStopEvents)
        const isPlaying = _.get(lastEvent, 'kind') === 'play';

        if(timed){
            if(isPlaying){
               return (
                    <div className="stop-btn" onMouseDown={this.onStopTask}>
                        <i className="fa fa-pause" />
                    </div>
               );
            } else {
                return (
                    <div className="start-btn" onMouseDown={this.onStartTask}>
                        <i className="fa fa-play" />
                    </div>
                );
            }
        }
    }

    private renderControlButtons = () => {
        const timed = _.get(this.props.todo.settings, 'timed');
        if(timed){
            return (
                <div className="ctrl-btns">
                    <Tooltip content={<span>Add 10 Minutes to the Deficit</span>}>
                        <div className="ctrl-btn" onClick={this.onRemoveIncrementOfWork}>
                            <i className="fa fa-plus"></i>
                        </div>
                    </Tooltip>
                    <Tooltip content={<span>Remove 10 Minutes from the Deficit</span>}>
                        <div className="ctrl-btn" onClick={this.onAddIncrementOfWork}>
                            <i className="fa fa-minus"></i>
                        </div>
                    </Tooltip>
                </div>
            );
        }
    }

    private onAddIncrementOfWork = () => {
        this.props.todo.set({
            fiatMinutes: (this.props.todo.fiatMinutes || 0) + 10
        })
    }

    private onRemoveIncrementOfWork = () => {
        this.props.todo.set({
            fiatMinutes: (this.props.todo.fiatMinutes || 0) - 10
        })
    }

    private onStartTask = (event) =>  {
        event.preventDefault();
        event.stopPropagation();
        const currentEvents = this.props.todo.startStopEvents || [];
        this.props.todo.set({startStopEvents: currentEvents.concat(
            {kind: 'play', time: moment().format()}
        )})
    }

    private onStopTask = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const currentEvents = this.props.todo.startStopEvents || [];
        this.props.todo.set({startStopEvents: currentEvents.concat(
            {kind: 'stop', time: moment().format()}
        )})
    }

    private onRecurringComplete = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.todo.set({
            lastCompleted: moment().format(LAST_COMPLETED_FORMAT)
        })
    }

    private renderSettings = () => {
        if(this.state.settingsVisible){
            const settings = this.getSettings()
            return (
                <div className="todo-settings" onMouseDown={(event) => event.stopPropagation()}>
                    <div className="form-group">
                        <input type="checkbox" checked={settings.recurring} onClick={this.onChangeRecurring} />
                        <span className="pt-control-indicator">Recurring</span>
                    </div>
                    {this.renderRecurringSettings(settings)}
                    <div className="form-group">
                        <input type="checkbox" checked={settings.timed} onClick={this.onChangeTimed} />
                        <span className="pt-control-indicator">Timed</span>
                    </div>
                    {this.renderTimedSettings(settings)}
                    <button className="pt-small" onClick={this.onClearEvents}>Clear Events</button>
                    <button className="pt-small" onClick={this.onClearLastCompleted}>Clear Last Completed</button>
                    <CompactPicker color={settings.color} colors={availableColors} onChange={this.onChangeColor}/>
                </div>
            )
        }
    }

    private renderRecurringSettings = (settings: TodoSettings) => {
        if(settings.recurring){
            return [
                <div className="form-group frequency">
                    <select value={settings.recurringInterval} onChange={this.onChangeInterval}>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>,
                <div className="last-completed">
                    <span>Last Completed: </span>
                    <span>{this.props.todo.lastCompleted || "never"}</span>
                </div>
            ]
        }
    }

    private renderTimedSettings = (settings: TodoSettings) => {
        if(settings.timed){
            return [
                <div className="form-group time-required">
                    <label>Time Required (in minutes):</label>
                    <InlineText value={(settings.minutesRequired || 0).toString()} onChange={this.onChangeMinutesRequired} />
                </div>
            ]
        }
    }

    private onClearLastCompleted = () => {
        this.props.todo.set({
            lastCompleted: null
        });
    }

    private onClearEvents = () => {
        this.props.todo.set({
            startStopEvents: []
        });
    }

    private onChangeInterval = (event) => {
        const newInterval = event.target.value;
        this.props.todo.set({
            settings: _.extend({}, this.props.todo.settings || {}, {recurringInterval: newInterval}) as any
        });
    }

    private onChangeMinutesRequired = (value) => {
        this.props.todo.set({
            settings: _.extend({}, this.props.todo.settings || {}, {
                minutesRequired: parseInt(value, 10)
            }) as any
        });
    }

    private onChangeColor = (newColor) => {
        this.props.todo.set({
            settings: _.extend({}, this.props.todo.settings || {}, {color: newColor.hex}) as any
        });
    }

    private onChangeTimed = (event) => {
        const timed = _.get(this.props, 'todo.settings.timed', false);
        this.props.todo.set({
            settings: _.extend({}, this.props.todo.settings || {}, {timed: !timed}) as any
        });
    }

    private onChangeRecurring = (event) => {
        const recurring = _.get(this.props, 'todo.settings.recurring', false);
        this.props.todo.set({
            settings: _.extend({}, this.props.todo.settings || {}, {recurring: !recurring}) as any
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

    private getSettings = () => {
        return _.defaults(_.cloneDeep(this.props.todo.settings || {}), {
            recurring: false,
            color: '#eee',
            recurringInterval: 'daily'
        }) as TodoSettings;
    }
}

