import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';
import cxs from 'cxs';
import {generatePushID} from '../../db/util';
import WeightGraph from './WeightGraph';
import DayPicker from 'react-day-picker';
import * as moment from 'moment';
import 'react-day-picker/lib/style.css';
import InlineText from '../InlineText';
import * as uuidv4 from 'uuid/v4';

type Props = {
    caloriesState: CaloriesState;
}


export default class CaloriesPage extends React.Component<Props,{}> {

    state = {
        selectedDay: new Date()
    };

    render() {
        const caloriesState = this.props.caloriesState;
        const goal = parseInt(caloriesState['calorie-settings'].weightStasisGoal as any, 10);
        const modifiers = {
            tooManyCalories: (day) => {
                day = moment(day).format("MM/DD/YY");
                const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
                if(!dayObj){
                    return false;
                }
                const calories = _.sumBy(dayObj.consumed, (c: ConsumedFood) => parseInt(c.calories, 10))
                if(calories > goal) {
                    return true;
                }
                return false;
            },
            zeroCalories: (day) => {
                day = moment(day).format("MM/DD/YY");
                const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
                if(!dayObj){
                    return true;
                }
                const calories = _.sumBy(dayObj.consumed, (c: ConsumedFood) => parseInt(c.calories, 10))
                if(calories === 0) {
                    return true;
                }
                return false;
            },
            justRight: (day) => {
                day = moment(day).format("MM/DD/YY");
                const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
                if(!dayObj){
                    return false;
                }
                const calories = _.sumBy(dayObj.consumed, (c: ConsumedFood) => parseInt(c.calories, 10))
                if(calories < goal && calories > 0) {
                    return true;
                }
                return false;
            }
        };
        const modifiersStyles = {
            tooManyCalories: {
                color: 'white',
                backgroundColor: `rgba(200,0,0,0.5)`,
            },
            justRight: {
                color: 'white',
                backgroundColor: `rgba(0,200,0,0.5)`
            },
            zeroCalories: {
            }
        };
        let day = moment(this.state.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        const weight = _.get(dayObj, 'weight', 0).toString();
        return (
            <div className="calories-page pt-card pt-elevation-3">
                <div className="left-column">
                    <DayPicker selectedDays={this.state.selectedDay} modifiers={modifiers} modifiersStyles={modifiersStyles} onDayClick={this.onDayClick}/>
                    <div className="weight-form">
                        <h1>Weight on
                            <span className="date">{moment(this.state.selectedDay).format('MMM DD ')}</span>
                            :
                            <InlineText className="weight" value={weight} onChange={this.onWeightChanged}></InlineText>
                            <span className="suffix">lbs</span>
                        </h1>
                    </div>
                </div>
            </div>
        );
    }

    private onWeightChanged = (newWeight) => {
        const day = moment(this.state.selectedDay).format('MM/DD/YY');
        const dayObj = _.find(this.props.caloriesState.days, (d: Day) => d.date === day);
        if(_.isUndefined(dayObj)){
            this.props.caloriesState.days.push({
                id: uuidv4(),
                date: day,
                weight: newWeight,
                consumed: []
            })
        } else {
            dayObj.set({weight: newWeight});
        }
    }

    private onDayClick = (newDate) => {
        this.setState({
            selectedDay: newDate
        });
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}
