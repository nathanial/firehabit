import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import CaloriesSettings from "./CaloriesSettings";
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';

type CaloriesDataPageProps = {
    caloriesState: CaloriesState;
}

class CaloriesDataPage extends React.PureComponent<CaloriesDataPageProps, {}> {
    render(){
        const {selectedDate, foodDefinitions, days} = this.props.caloriesState;
        const selectedDay = _.find(days, d => d.date === selectedDate);
        const consumedFoods = _.get(selectedDay, 'consumed', []);
        return (
            <div style={{marginLeft: 20}}>
                <CalorieStatistics date={selectedDate} days={days} calorieSettings={this.props.caloriesState['calorie-settings']} />
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

type CaloriesPageProps = {
    caloriesState: CaloriesState;
}

export default class CaloriesPage extends React.Component<CaloriesPageProps,{}> {
    render() {
        return (
            <div style={{width: 800, minWidth: 800, maxWidth: 800, marginLeft: '-400px', left: '50%', position:'absolute'}}>
                {this.renderPage()}
            </div>
        );
    }

    private renderPage(){
        const caloriesState = this.props.caloriesState;
        if(history.location.pathname === '/calories/settings') {
            return <CaloriesSettings caloriesState={caloriesState}  />
        } else {
            return <CaloriesDataPage caloriesState={caloriesState} />;
        }
    }
}