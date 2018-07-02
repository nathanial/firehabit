import * as React from 'react';
import * as moment from 'moment';
import {CaloriesState} from "../../state";
import * as _ from 'lodash';
import DayPicker from 'react-day-picker';

type Props = {
    weightStasisGoal: string | number;
    days: Day[];
    selectedDay: Date;
    onChange(selectedDay: Date);
}

export class Calendar extends React.PureComponent<Props,{}> {

    render(){
        const goal = parseInt(this.props.weightStasisGoal as any, 10);
        const days = this.props.days;

        let day = moment(this.props.selectedDay).format("MM/DD/YY");
        const modifiers = {
            tooManyCalories: (day) => {
                day = moment(day).format("MM/DD/YY");
                const dayObj = _.find(days, (d: Day) => d.date === day);
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
                const dayObj = _.find(days, (d: Day) => d.date === day);
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
                const dayObj = _.find(days, (d: Day) => d.date === day);
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
                color: '#AA2222',
                backgroundColor: `transparent`,
            },
            justRight: {
                color: 'green',
                fontWeight: 'bold',
                backgroundColor: `transparent`
            },
            zeroCalories: {
            }
        };
        return (
            <DayPicker selectedDays={this.props.selectedDay}
                       modifiers={modifiers}
                       modifiersStyles={modifiersStyles}
                       onDayClick={this.onDayClick}/>
        );
    }

    private onDayClick = (newDate) => {
        this.props.onChange(newDate);
    }



}
