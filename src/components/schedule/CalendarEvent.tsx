import * as React from 'react';
import * as moment from 'moment';
import * as Color from 'color';
import DialogService from "../../services/DialogService";
import InlineText from '../InlineText';
import {Button} from "@blueprintjs/core";
import {ChromePicker} from 'react-color';

type CalendarEventProps = {
    calendarEvent: BigCalendarEvent;
    onDelete(id: string);
}

const hourRowHeight = 26;

export type Offset = {
    left: number;
    top: number;
}

export class CalendarEvent extends React.PureComponent<CalendarEventProps, {}> {
    render(){
        const {calendarEvent} = this.props;
        const start = moment(calendarEvent.start).startOf('hour');
        const end = moment(calendarEvent.end).startOf('hour');
        const delta = end.diff(start);
        const hourStart = start.hours();
        const hourEnd = hourStart + (delta / 1000 / 60 / 60);
        const style: any = {
            gridRowStart: hourStart+2, gridRowEnd: hourEnd + 2
        };
        style.background = this.props.calendarEvent.color;

        const backgroundColor = this.props.calendarEvent.color || '#eee';
        let foregroundColor;
        if(Color(backgroundColor).light()){
            foregroundColor = 'black';
        } else {
            foregroundColor = 'white';
        }
        style.color = foregroundColor;
        return (
            <div className="calendar-event" style={style}>
                <div className="event-title">
                    <InlineText value={calendarEvent.title}
                            multiline={true}
                            style={{color: foregroundColor}}
                            placeholder="New Event"
                            editing={calendarEvent.editing || false}
                            onChange={this.onTitleChanged}
                            onStartEditing={this.onStartEditing}
                            onStopEditing={this.onStopEditing}/>
                </div>
                <div className="calendar-event-controls">
                    <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDelete} />
                    <Button className="settings-btn pt-intent-success pt-minimal" iconName="cog" onClick={this.onOpenSettings} />
                </div>
                <div className="top-dragger" onMouseDown={this.onTopDraggerMouseDown}>
                </div>
                <div className="bottom-dragger" onMouseDown={this.onBottomDraggerMouseDown}>
                </div>
            </div>
        );
    }

    private dragDirection: 'top' | 'bottom';
    private startPosition: Offset;
    private hourStart: Date;

    private onTopDraggerMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.addEventListener('mousemove', this.onMouseMove, true);
        window.addEventListener('mouseup', this.onMouseUp, true);
        this.dragDirection = 'top';
        this.startPosition = {left: event.pageX, top: event.pageY};
        this.hourStart = this.props.calendarEvent.start;
    }

    private onBottomDraggerMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.addEventListener('mousemove', this.onMouseMove, true);
        window.addEventListener('mouseup', this.onMouseUp, true);
        this.dragDirection = 'bottom';
        this.startPosition = {left: event.pageX, top: event.pageY};
        this.hourStart = this.props.calendarEvent.end;
    }

    private onMouseMove = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const {pageX, pageY} = event;
        const deltaY = pageY - this.startPosition.top;
        const hourDelta = parseInt((deltaY / hourRowHeight).toString());
        if(this.dragDirection === 'top'){
            const newValue = moment(this.hourStart).add('hours', hourDelta).toDate();
            this.props.calendarEvent.set({start: newValue})
        } else {
            const newValue = moment(this.hourStart).add('hours', hourDelta).toDate();
            this.props.calendarEvent.set({end: newValue})
        }
    }

    private onMouseUp = (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.removeEventListener('mousemove', this.onMouseMove, true);
        window.removeEventListener('mouseup', this.onMouseUp, true);
    }

    private onDelete = () => {
        this.props.onDelete(this.props.calendarEvent.id);
    }

    private onOpenSettings = async () => {
        const changeColor = (newColor) => {
            this.props.calendarEvent.set({color: newColor.hex});
        };
        const result = await DialogService.showDialog("Todo Settings", "Save", "Cancel", (
            <div>
                <label className="pt-label pt-inline">
                    Color
                    <ChromePicker color={this.props.calendarEvent.color} onChange={changeColor}/>
                </label>
            </div>
        ));
    }

    private onTitleChanged = (newValue: string) => {
        this.props.calendarEvent.set({title: newValue});
    }

    private onStartEditing = () => {
        this.props.calendarEvent.set({editing: true});
    }

    private onStopEditing = () => {
        this.props.calendarEvent.set({editing: false});
    }
}
