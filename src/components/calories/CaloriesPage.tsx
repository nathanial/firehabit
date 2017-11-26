import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';
import cxs from 'cxs';
import {generatePushID} from '../../db/util';
import WeightGraph from './WeightGraph';

type Props = {
    caloriesState: CaloriesState;
}

const caloriesPageClass = cxs({
    width: 900,
    margin: '0 auto',
});

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

        const statisticsStyle = {
            left :0,
            top: 0,
            flex: '0'
        };

        return (
            <div className={caloriesPageClass}>
                <WeightGraph days={days} />
                <CalorieStatistics style={statisticsStyle} date={selectedDate} days={days} caloriesState={this.props.caloriesState} />
                <CaloriesForm date={selectedDate} 
                            days={days}
                            onChangeDate={this.onChangeDate} 
                            foodDefinitions={foodDefinitions} 
                            consumedFoods={consumedFoods} />
            </div>
        );
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}