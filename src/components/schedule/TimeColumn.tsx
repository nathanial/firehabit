import * as React from 'react';
import * as _ from 'lodash';

type TimeColumnProps = {
    currentHour: number;
}

export class TimeColumn extends React.PureComponent<TimeColumnProps,{}>{
    render(){
        return(
            <div className="time-column">
                <div className="day-name"><div>Times</div></div>
                {_.times(24, hour => {
                    const suffix = hour > 12 ? "PM" : "AM";
                    const active = hour === this.props.currentHour;
                    console.log("Current Hour", this.props.currentHour);
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
