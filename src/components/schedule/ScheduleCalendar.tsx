import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import * as moment from 'moment';
import * as _ from 'lodash';
import { generatePushID } from '../../db/util';
import InlineText from '../InlineText';

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Props = {
    calendarEvents: BigCalendarEvent[];
}

type Offset = {
    left: number;
    top: number;
}

type TimeColumnProps = {
    currentHour: number;
}

class TimeColumn extends React.PureComponent<TimeColumnProps,{}>{
    render(){
        return(
            <div className="time-column">
                <div className="day-name"><div>Times</div></div>
                {_.times(24, hour => {
                    const suffix = hour > 12 ? "PM" : "AM";
                    const active = hour === this.props.currentHour;
                    const key = hour;
                    if(hour === 0){
                        hour = 12;
                    }
                    if(hour > 12){
                        hour -= 12;
                    }
                    const classes = ["hour-row"];
                    if(active){
                        classes.push("current-hour");
                    }
                    return (
                        <div key={key} className={classes.join(' ')}>
                            <div className="hour-value">{hour} {suffix}</div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

type DaysOfTheWeekProps = {
    currentHour: number;
    currentDay: number;
    onMouseDown(event);
}

class DaysOfTheWeek extends React.PureComponent<DaysOfTheWeekProps,{}>{
    render(): any {
        return (
            _.map(daysOfTheWeek, (day, dayIndex) => {
                const dayClasses = ['day-column'];
                if(dayIndex === this.props.currentDay){
                    dayClasses.push('current-day');
                }
                return (
                    <div key={day} className={dayClasses.join(' ')}>
                        <div className="day-name"><div>{day}</div></div>
                        {_.times(24, hour => {
                            const classes = ["hour-row"];
                            const active = hour === this.props.currentHour && dayIndex === this.props.currentDay;
                            let minutePercentage = 0;
                            if(active){
                                classes.push("current-hour");
                                minutePercentage = (moment().minutes() / 60) * 100;                            
                            }
                            return (
                                <div key={hour} className={classes.join(' ')} 
                                    data-hour={hour} data-day={dayIndex} 
                                    onMouseDown={this.props.onMouseDown}>
                                <div className="now-marker" style={{top: `${minutePercentage}%`}}></div>
                                </div>
                            );
                        })}
                    </div>
                );
            })
        );
    }
}


type EventColumnsProps = {
    calendarEvents: BigCalendarEvent[];
}

type CalendarEventProps = {
    calendarEvent: BigCalendarEvent;
}

class CalendarEvent extends React.PureComponent<CalendarEventProps, {}> {
    render(){
        const {calendarEvent} = this.props;
        const start = moment(calendarEvent.start).startOf('hour');
        const end = moment(calendarEvent.end).startOf('hour');
        const delta = end.diff(start);
        const hourStart = start.hours();
        const hourEnd = hourStart + (delta / 1000 / 60 / 60);
        return (
            <div className="calendar-event" style={{gridRowStart: hourStart+2, gridRowEnd: hourEnd + 2}} onMouseDown={this.onMouseDown}>
                <div className="event-title">
                    <InlineText value={calendarEvent.title}
                            multiline={true}
                            placeholder="New Event"
                            editing={calendarEvent.editing || false}
                            onChange={this.onTitleChanged}
                            onStartEditing={this.onStartEditing}
                            onStopEditing={this.onStopEditing}
                            rowCount={this.getRowCount()} />
                </div>
            </div>
        );
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

    private onMouseDown = (event) => {
   
    }

    private getRowCount(){
        let value = this.props.calendarEvent.title;
        value = value || "";
        const length = value.length;
        const newlineRows = _.filter(value, v => v === '\n').length;
        return Math.max(Math.ceil(length / 10) + newlineRows, 1);
    }

}

class EventColumns extends React.PureComponent<EventColumnsProps, {}> {
    render(): any {
        return (
            _.map(daysOfTheWeek, (day, dayIndex) => {
                return (
                    <div key={day} className="day-column">
                        <div className="day-name" style={{opacity: 0}}><div></div></div>
                        {_.map(this.getEventsForDay(dayIndex), (calendarEvent) => {
                   
                            return (
                                <CalendarEvent key={calendarEvent.id} calendarEvent={calendarEvent} />
                            );
                        })}
                    </div>
                );
            })
        )
    }

    private getEventsForDay(day: number): BigCalendarEvent[] {
        const targetDay = moment().startOf('week').add(day, 'days').toDate().getTime();
        const events = _.filter(this.props.calendarEvents, event => {
            const eventStartDay = moment(event.start).startOf('day').toDate().getTime();
            return targetDay === eventStartDay;
        });
        return events;
    }
}

export class ScheduleCalendar extends React.PureComponent<Props,{}>{
    private root: HTMLDivElement | null;

    render(){
        const month = this.getMonth();
        const startOfWeek = this.getStartOfWeek();
        const endOfWeek = this.getEndOfWeek();
        const currentHour = this.getCurrentHour();
        const currentDay = this.getCurrentDay();
        return (
            <div className="schedule-calendar" ref={this.setRef}>
                <div className="current-month">{month} {startOfWeek} - {endOfWeek}</div>
                <div className="calendar-body" >
                    <div className="background-grid">
                        <TimeColumn currentHour={currentHour} />
                        <DaysOfTheWeek currentHour={currentHour} currentDay={currentDay} onMouseDown={this.onMouseDown} />
                    </div>
                    <div className="event-grid">
                        <div></div>{/*placeholder for time column, so the rest of the event grid is aligned with the day columns*/}
                        <EventColumns calendarEvents={this.props.calendarEvents} />
                    </div>
                </div>
            </div>
        );
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
        console.log("DISCO");
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
        const start = moment().startOf('week').add(day, 'days').add(hour,'hours');
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
        console.log("Start Hour to End Hour", this.startHour, endHour);
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
        const now = moment();
        return now.hours();
    }

    private getCurrentDay(){
        return moment().startOf('day').days();
    }

    private getMonth(){
        const now = moment();
        return now.format("MMMM");
    }

    private getStartOfWeek(){
        return moment().startOf('week').format('DD');
    }

    private getEndOfWeek(){
        return moment().endOf('week').format('DD');
    }


    refreshInterval;

    componentDidMount(){
        this.refreshInterval = setInterval(() => this.forceUpdate(), 60 * 1000);
    }

    componentWillUnmount(){
        clearInterval(this.refreshInterval);
    }
}
