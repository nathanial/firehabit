import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';

type Props = {
    caloriesState: CaloriesState;
}

export default class CaloriesPage extends React.Component<Props,{}> {
    render() {
        const caloriesState = this.props.caloriesState;
        const {selectedDate, foodDefinitions, days} = this.props.caloriesState;
        const selectedDay = _.find(days, d => d.date === selectedDate);
        if(!selectedDay){
            return <div />;
        }
        const consumedFoods = selectedDay.consumed;
        return (
            <div style={{width: 800, minWidth: 800, maxWidth: 800, marginLeft: '-400px', left: '50%', position:'relative'}}>
                <div style={{marginLeft: 20}}>
                    <CalorieStatistics date={selectedDate} days={days} caloriesState={this.props.caloriesState} />
                    <CaloriesForm date={selectedDate} 
                                days={days}
                                onChangeDate={this.onChangeDate} 
                                foodDefinitions={foodDefinitions} 
                                consumedFoods={consumedFoods} />
                </div>
            </div>
        );
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}