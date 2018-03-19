import * as React from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export class ScheduleCalendar extends React.PureComponent<{},{}>{
    render(){
        const month = this.getMonth();
        const startOfWeek = this.getStartOfWeek();
        const endOfWeek = this.getEndOfWeek();
        const currentHour = this.getCurrentHour();
        return (
            <div className="schedule-calendar">
                <div className="current-month">{month} {startOfWeek} - {endOfWeek}</div>
                <div className="calendar-body">
                    <div className="time-column">
                        <div className="day-name"><div>Times</div></div>
                        {_.times(24, hour => {
                            const suffix = hour > 12 ? "PM" : "AM";
                            const active = hour === currentHour;
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
                    {_.map(daysOfTheWeek, (day) =>
                        <div key={day} className="day-column">
                            <div className="day-name"><div>{day}</div></div>
                            {_.times(24, hour => {
                                const classes = ["hour-row"];
                                const active = hour === currentHour;
                                if(active){
                                    classes.push("current-hour");
                                }
                                return (
                                    <div key={hour} className={classes.join(' ')}>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
