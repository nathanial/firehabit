import * as React from 'react';
import * as moment from 'moment'
import {ScheduleCalendar} from './ScheduleCalendar';

type ScheduleProps = {
    calendarEvents: BigCalendarEvent[];
}

export class SchedulePage extends React.PureComponent<ScheduleProps,{}> {
    render(){
        return (
            <div className="schedule-page">
                <ScheduleCalendar />
            </div>
        );
    }
}
