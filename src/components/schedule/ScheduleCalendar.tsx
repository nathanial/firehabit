import * as React from 'react';
import * as $ from 'jquery';
import * as moment from 'moment';
import * as _ from 'lodash';
import { generatePushID } from '../../db/util';

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

export class ScheduleCalendar extends React.PureComponent<Props,{}>{
    private root: HTMLDivElement | null;

    render(){
        const month = this.getMonth();
        const startOfWeek = this.getStartOfWeek();
        const endOfWeek = this.getEndOfWeek();
        const currentHour = this.getCurrentHour();
        return (
            <div className="schedule-calendar" ref={this.setRef}>
                <div className="current-month">{month} {startOfWeek} - {endOfWeek}</div>
                <div className="calendar-body" >
                    <TimeColumn currentHour={currentHour} />
                    {_.map(daysOfTheWeek, (day, dayIndex) =>
                        <div key={day} className="day-column">
                            <div className="day-name"><div>{day}</div></div>
                            {_.times(24, hour => {
                                const classes = ["hour-row"];
                                const active = hour === currentHour;
                                if(active){
                                    classes.push("current-hour");
                                }
                                return (
                                    <div key={hour} className={classes.join(' ')} data-hour={hour} data-day={dayIndex} onMouseDown={this.onMouseDown}>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
        const calendarEvent = _.find(this.props.calendarEvents, {id: this.draggingCalendarEventID});
        calendarEvent.set({end: moment(calendarEvent.start).add(endHour, 'hours').toDate()});
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
}
