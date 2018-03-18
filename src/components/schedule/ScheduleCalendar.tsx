import * as React from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export class ScheduleCalendar extends React.PureComponent<{},{}>{
    render(){
        const month = this.getMonth();
        const startOfWeek = this.getStartOfWeek();
        const endOfWeek = this.getEndOfWeek();
        return (
            <div className="schedule-calendar">
                <div className="current-month">{month} {startOfWeek} - {endOfWeek}</div>
                <div className="calendar-body">
                    <div className="time-column">
                        <div className="day-name">Times</div>
                        {_.times(24, hour => {
                            const suffix = hour > 12 ? "PM" : "AM";
                            if(hour === 0){
                                hour = 12;
                            }
                            if(hour > 12){
                                hour -= 12;
                            }
                            return (
                                <div className="hour-row">
                                    <div className="hour-value">{hour} {suffix}</div>
                                </div>
                            );
                        })}
                    </div>
                    {_.map(daysOfTheWeek, (day) =>
                        <div className="day-column">
                            <div className="day-name">{day}</div>
                            {_.times(24, hour => {
                                return (
                                    <div className="hour-row">
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
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
