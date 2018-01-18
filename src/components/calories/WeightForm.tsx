import * as React from 'react';
import * as moment from 'moment';
import {CaloriesState} from "../../state";
import * as _ from 'lodash';
import InlineText from '../InlineText';
import {generatePushID} from '../../db/util';

type Props = {
    caloriesState: CaloriesState;
    selectedDay: Date;
}

export class WeightForm extends React.PureComponent<Props,{}> {
    render(){
        const caloriesState = this.props.caloriesState;
        let day = moment(this.props.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        const weight = _.get(dayObj, 'weight', 0).toString();
        return (
            <div className="weight-form">
                <h1>Weight on
                    <span className="date">{moment(this.props.selectedDay).format('MMM DD ')}</span>
                    :
                    <InlineText className="weight" value={weight} onChange={this.onWeightChanged}></InlineText>
                    <span className="suffix">lbs</span>
                </h1>
            </div>
        );
    }


    private onWeightChanged = (newWeight) => {
        const day = moment(this.props.selectedDay).format('MM/DD/YY');
        const dayObj = _.find(this.props.caloriesState.days, (d: Day) => d.date === day);
        if(_.isUndefined(dayObj)){
            this.props.caloriesState.days.push({
                id: generatePushID(),
                date: day,
                weight: newWeight,
                consumed: []
            })
        } else {
            dayObj.set({weight: newWeight});
        }
    }
}
