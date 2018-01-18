import * as React from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
import {CaloriesState} from "../../state";

type Props = {
    caloriesState: CaloriesState;
    selectedDay: Date;
}

export class CaloriesPercentage extends React.PureComponent<Props,{}>{
    render(){
        const caloriesState = this.props.caloriesState;
        let day = moment(this.props.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        const {caloricGoal, weightStasisGoal} = caloriesState['calorie-settings']
        const caloriesOfTheDay = _.sumBy(dayObj.consumed, c => parseInt(c.calories, 10));
        const percentage = Math.round(caloriesOfTheDay / weightStasisGoal * 100);
        let classes = "percentage-marker ";
        if(percentage > 100) {
            classes += "danger";
        } else if(percentage > 75){
            classes += "warning";
        }
        return (
            <div className="calories-percentage">
                <div className={classes} style={{width: `${Math.min(percentage, 100)}%`}} />
                <span>{caloriesOfTheDay}/{weightStasisGoal}</span>
            </div>
        );
    }
}
