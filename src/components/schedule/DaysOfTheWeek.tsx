import * as React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

export const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type DaysOfTheWeekProps = {
    currentWeek: Date;
    currentHour: number;
    currentDay: number;
    onMouseDown(event);
}

export class DaysOfTheWeek extends React.PureComponent<DaysOfTheWeekProps,{}>{
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
                            const active = (
                                hour === this.props.currentHour &&
                                dayIndex === this.props.currentDay &&
                                moment(this.props.currentWeek).week() === moment().week()
                            );
                            let minutePercentage = 0;
                            if(active){
                                classes.push("current-hour");
                                minutePercentage = (moment().minutes() / 60) * 100;
                                console.log("Minute Percentage", minutePercentage)
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
