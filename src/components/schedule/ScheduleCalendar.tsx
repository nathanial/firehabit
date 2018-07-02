import * as React from 'react';
import * as Color from 'color';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import * as moment from 'moment';
import * as _ from 'lodash';
import { generatePushID } from '../../db/util';
import InlineText from '../InlineText';
import {Button} from "@blueprintjs/core";
import {WeekPicker} from './WeekPicker';
import {TimeColumn} from './TimeColumn';
import {DaysOfTheWeek, daysOfTheWeek} from './DaysOfTheWeek';
import {CalendarEvent, Offset} from './CalendarEvent';
import DialogService from "../../services/DialogService";
import {EventColumns} from './EventColumns';

type Props = {
    calendarEvents: BigCalendarEvent[];
}

type State = {
    currentWeek: Date
}

export class ScheduleCalendar extends React.Component<Props,State>{
    private root: HTMLDivElement | null;

    state = {
        currentWeek: moment().startOf("week").toDate()
    }

    render(){
        const currentDate = this.state.currentWeek
        const month = this.getMonth();
        const startOfWeek = this.getStartOfWeek();
        const endOfWeek = this.getEndOfWeek();
        const currentHour = this.getCurrentHour();
        const currentDay = this.getCurrentDay();
        return (
            <div className="schedule-calendar" ref={this.setRef}>
                <WeekPicker date={currentDate} onChange={this.onWeekChanged} />
                <div className="calendar-body" >
                    <div className="background-grid">
                        <TimeColumn
                            currentHour={currentHour} />
                        <DaysOfTheWeek
                            currentWeek={this.state.currentWeek}
                            currentHour={currentHour}
                            currentDay={currentDay}
                            onMouseDown={this.onMouseDown} />
                    </div>
                    <div className="event-grid">
                        <div></div>{/*placeholder for time column, so the rest of the event grid is aligned with the day columns*/}
                        <EventColumns
                            currentWeek={this.state.currentWeek}
                            calendarEvents={this.props.calendarEvents} />
                    </div>
                </div>
            </div>
        );
    }

    private onWeekChanged = (newDate: Date) => {
        this.setState({
            currentWeek: newDate
        })
    }

    private setRef = (root: HTMLDivElement) => {
        this.root = root;
    }

    private startPosition: Offset;
    private startHour: number;
    private hourHeight: number;
    private draggingCalendarEventID: string;

    private onMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const day = $(event.target).data('day');
        const hour = $(event.target).data('hour');
        this.startHour = parseInt(hour, 10);

        const hourBounds = (event.target as HTMLDivElement).getBoundingClientRect();
        this.hourHeight = hourBounds.height + 1 // + 1 for border;
        this.startPosition = {left: hourBounds.left, top: hourBounds.top};
        window.addEventListener('mousemove', this.onMouseMove, true);
        window.addEventListener('mouseup', this.onMouseUp, true);
        const newId = generatePushID();
        this.draggingCalendarEventID = newId;
        const start = this.now.startOf('week').add(day, 'days').add(hour,'hours');
        const end = start;
        this.props.calendarEvents.push({
            id: newId,
            title: 'New Event',
            start: start.toDate(),
            end: end.toDate()
        });
    }

    private onMouseMove = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const {pageX, pageY} = event;
        const deltaY = pageY - this.startPosition.top;
        const hourDelta = deltaY / this.hourHeight;
        const endHour = Math.floor(this.startHour + hourDelta);
        const calendarEvent = _.find(this.props.calendarEvents, {id: this.draggingCalendarEventID});
        calendarEvent.set({end: moment(calendarEvent.start).startOf('day').add(endHour, 'hours').toDate()});
    }

    private onMouseUp = (evnet) => {
        event.preventDefault();
        event.stopPropagation();
        window.removeEventListener('mousemove', this.onMouseMove, true);
        window.removeEventListener('mouseup', this.onMouseUp, true);
        this.draggingCalendarEventID = null;
        this.startHour = 0;
        this.startPosition = null;
    };

    private getCurrentHour(){
        return this.now.hours();
    }

    private getCurrentDay(){
        return this.now.startOf('day').days();
    }

    private getMonth(){
        return this.now.format("MMMM");
    }

    private getStartOfWeek(){
        return this.now.startOf('week').format('DD');
    }

    private getEndOfWeek(){
        return this.now.endOf('week').format('DD');
    }


    refreshInterval;

    componentDidMount(){
        this.refreshInterval = setInterval(() => this.forceUpdate(), 60 * 1000);
    }

    componentWillUnmount(){
        clearInterval(this.refreshInterval);
    }

    get now(){
        return moment(this.state.currentWeek);
    }
}
