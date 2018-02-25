import * as React from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
import {CaloriesState} from "../../state";
import {Button} from '@blueprintjs/core';

type Props = {
    caloriesState: CaloriesState;
    selectedDay: Date;
    onOpenSettings();
}

export class CaloriesPercentage extends React.PureComponent<Props,{}>{
    private cursorTimer;

    render(){
        const caloriesState = this.props.caloriesState;
        const {caloricGoal, weightStasisGoal} = caloriesState['calorie-settings']
        const day = this.getSelectedDate();
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        const caloriesOfTheDay = _.sumBy(dayObj.consumed, c => parseInt(c.calories, 10));
        const percentage = Math.round(caloriesOfTheDay / weightStasisGoal * 100);
        let classes = "percentage-marker ";
        if(percentage > 100) {
            classes += "danger";
        } else if(percentage > 75){
            classes += "warning";
        }
        return (
            <div className="calories-percentage-wrapper">
                <div className="calories-percentage">
                    <div className={classes} style={{width: `${Math.min(percentage, 100)}%`}} />
                    <span>{caloriesOfTheDay}/{weightStasisGoal}</span>
                    {this.renderCursor()}
                </div>
                <Button className="calories-settings-btn pt-minimal" iconName="settings" onClick={this.props.onOpenSettings} />
            </div>
        );
    }

    componentDidMount() {
        this.cursorTimer = setInterval(() => {
            this.forceUpdate();
        }, 1000 * 10); // run once every 10 seconds
    }

    componentWillUnmount(){
        clearInterval(this.cursorTimer);
    }

    private renderCursor(){
        if(moment().format('MM/DD/YY') === this.getSelectedDate()){
            const percentage = (moment().hours() + moment().minutes() / 60) / 24;
            return <div className="calories-cursor" style={{left: `${percentage * 100}%`}} />
        }
    }

    private getSelectedDate(){
        let day = moment(this.props.selectedDay).format("MM/DD/YY");
        return day;
    }
}
