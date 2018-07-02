import * as React from 'react';
import * as _ from 'lodash';
import {daysOfTheWeek} from './DaysOfTheWeek';
import {CalendarEvent} from './CalendarEvent';
import * as moment from 'moment';
import DialogService from "../../services/DialogService";

type EventColumnsProps = {
    currentWeek: Date;
    calendarEvents: BigCalendarEvent[];
}

export class EventColumns extends React.PureComponent<EventColumnsProps, {}> {
    render(): any {
        return (
            _.map(daysOfTheWeek, (day, dayIndex) => {
                return (
                    <div key={day} className="day-column">
                        <div className="day-name" style={{opacity: 0}}><div></div></div>
                        {_.map(this.getEventsForDay(dayIndex), (calendarEvent) => {
                            return (
                                <CalendarEvent key={calendarEvent.id} calendarEvent={calendarEvent} onDelete={this.onDeleteCalendarEvent} />
                            );
                        })}
                    </div>
                );
            })
        )
    }

    private getEventsForDay(day: number): BigCalendarEvent[] {
        const targetDay = moment(this.props.currentWeek).startOf('week').add(day, 'days').toDate().getTime();
        const events = _.filter(this.props.calendarEvents, event => {
            const eventStartDay = moment(event.start).startOf('day').toDate().getTime();
            return targetDay === eventStartDay;
        });
        return events;
    }

    private onDeleteCalendarEvent = async (id: string) => {
        const result = await DialogService.showDangerDialog("Are you sure you want to delete this Event?", "Delete", "Cancel");
        if(result){
            const index = _.findIndex(this.props.calendarEvents, {id});
            if(index !== -1){
                this.props.calendarEvents.splice(index, 1);
            }
        }
    }
}
