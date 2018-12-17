import * as React from "react";
import {CompactPicker} from 'react-color';
import InlineText from "../InlineText";
import * as _ from "lodash";

type Props = {
    visible: Boolean;
    todo: Todo;
    settings: TodoSettings;
};

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
];

export default class TodoSettingsView extends React.PureComponent<Props> {
    render(){
        const settings = this.props.settings;
        if(this.props.visible){
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
            );
        }
        return <div/>;
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
}
