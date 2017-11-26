import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';
import cxs from 'cxs';
import {generatePushID} from '../../db/util';
import WeightGraph from './WeightGraph';
import WeightForm from "./WeightForm";
import DayPicker from '../DayPicker';

type Props = {
    caloriesState: CaloriesState;
}


export default class CaloriesPage extends React.Component<Props,{}> {
    render() {
        const caloriesState = this.props.caloriesState;
        const {selectedDate, foodDefinitions, days} = this.props.caloriesState;
        const selectedDay = _.find(days, d => d.date === selectedDate);
        if(!selectedDay){
            this.props.caloriesState.days.push({id: generatePushID(), date: selectedDate, consumed: [], weight: 0});
            return <div />;
        }
        const consumedFoods = selectedDay.consumed;

        return (
            <div className="calories-page">
                <WeightGraph days={days} />
                <CalorieStatistics date={selectedDate} days={days} caloriesState={this.props.caloriesState} />
                <WeightForm date={selectedDate} days={days} />
                <DayPicker date={selectedDate} onChange={(newDate) => this.onChangeDate(newDate)} />
                <CaloriesForm date={selectedDate} 
                            days={days}
                            foodDefinitions={foodDefinitions} 
                            consumedFoods={consumedFoods} />
            </div>
        );
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}