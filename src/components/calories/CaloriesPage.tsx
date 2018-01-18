import * as $ from 'jquery';
import * as React from 'react';
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';
import cxs from 'cxs';
import {generatePushID} from '../../db/util';
import DayPicker from 'react-day-picker';
import * as moment from 'moment';
import 'react-day-picker/lib/style.css';
import InlineText from '../InlineText';
import ScrollArea from '../ScrollArea';
import * as Plot from 'react-plotly.js'
import {Button} from '@blueprintjs/core';
import {ConsumedFoodsList} from './ConsumedFoodsList';
import {Calendar} from './Calendar';
import {WeightForm} from './WeightForm';

type Props = {
    caloriesState: CaloriesState;
}

const plotBackground = "#FFF";

// smoothing whole array
function lpf(values: number[], smoothing: number){
    var value = values[0];
    for (var i = 1; i < values.length; i++){
        var currentValue = values[i];
        value += (currentValue - value) / smoothing;
        values[i] = Math.round(value);
    }
}

type State = {
    selectedDay: Date;
    showAddFoodDialog: boolean;
    search: string;
}

export default class CaloriesPage extends React.Component<Props,State> {

    state = {
        selectedDay: new Date(),
        showAddFoodDialog: false,
        search: ''
    };

    render() {
        let classes = "left-column";
        if(this.state.showAddFoodDialog){
            classes += " hide-shadow";
        }
        return (
            <div className="calories-page pt-card pt-elevation-3">
                <div className={classes}>
                    <Calendar selectedDay={this.state.selectedDay} caloriesState={this.props.caloriesState} onChange={this.onDateChanged} />
                    <WeightForm caloriesState={this.props.caloriesState} selectedDay={this.state.selectedDay} />
                    {this.renderFoodEaten()}
                    {this.renderCaloriesPercentage()}
                </div>
                <div className="right-column">
                    <div className="graphs">
                        {this.renderWeightPlot()}
                        {this.renderCaloriesPlot()}
                    </div>
                    {this.renderNewFoodDialog()}
                </div>
            </div>
        );
    }

    private onDateChanged = (newDate) => {
        this.setState({
            selectedDay: newDate
        });
    }

    private renderNewFoodDialog(){
        let classes = "new-food-dialog";
        if(this.state.showAddFoodDialog){
            classes += " visible";
            setTimeout(() => {
                $(".food-search-input").focus();
            }, 500);
        }
        return (
            <div className={classes}>
                <input type="text" className="food-search-input" placeholder="Hamburger" autoFocus={true}
                       onChange={this.onSearchChanged}/>
                <div className="search-results">
                    {this.renderSearchResults()}
                </div>
            </div>
        );
    }

    private onSearchChanged = (event) => {
        this.setState({
            search: event.target.value
        });
    }

    private renderSearchResults(){
        return <div />;
        // const foodDefinitions = this.props.caloriesState.foodDefinitions;
        // const matches = _.filter(foodDefinitions, (definition: FoodDefinition) => {
        //     return definition.name === this.
        // });

    }

    private renderCaloriesPercentage(){
        const caloriesState = this.props.caloriesState;
        let day = moment(this.state.selectedDay).format("MM/DD/YY");
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

    private renderFoodEaten() {
        const caloriesState = this.props.caloriesState;
        let day = moment(this.state.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        return (
            <div className="food-eaten">
                <h3>Consumed Foods</h3>
                <Button iconName="plus" className="pt-minimal add-food-btn" onClick={this.onAddFoodClick}/>
                <ConsumedFoodsList day={dayObj} />
            </div>
        );
    }

    private onAddFoodClick = () => {
        this.setState({
            showAddFoodDialog: !this.state.showAddFoodDialog
        });
    }

    private renderWeightPlot(){
        var months = this.getMonths();

        const data = _.map(_.keys(months), (month) => {
            const days = months[month];
            return {
                type: 'box',
                name: month,
                y: _.filter(_.map(days, d => d.weight), x => x > 0)
            };
        });
        const layout = {
            width: 728,
            height: 500,
            showlegend: false,
            title: 'Weight',
            margin: {
                l: 50,
                r: 0,
                b: 50,
                t: 70,
                pad: 0
            },
            xaxis: {
                fixedrange: true
            },
            yaxis: {
                fixedrange: true
            },
            paper_bgcolor: plotBackground,
            plot_bgcolor: plotBackground
        };
        return (
            <Plot data={data} layout={layout} config={{displayModeBar:false, editable: false, scrollZoom: false}}/>
        );
    }

    private renderCaloriesPlot(){
        const days = this.props.caloriesState.days;
        const values = _.filter(_.map(days, d => ({date: d.date, calories: _.sumBy(d.consumed, c => parseInt(c.calories, 10))})), x => x.calories !== 0)
        const calories = _.map(values, v => v.calories);
        lpf(calories, 30.0);
        const data = [{
           type: 'line' ,
           name: 'Calories',
           x: _.map(values, v => moment(v.date).format('MM/DD')),
           y: calories
        }];
        const layout = {
            width: 728,
            height: 300,
            showlegend: false,
            title: 'Calories Per Day',
            margin: {
                l: 50,
                r: 20,
                b: 70,
                t: 70,
                pad: 0
            },
            xaxis: {
                fixedrange: true
            },
            yaxis: {
                fixedrange: true
            },
            paper_bgcolor: plotBackground,
            plot_bgcolor: plotBackground
        };
        return (
            <Plot data={data} layout={layout} config={{displayModeBar:false, editable: false, scrollZoom: false}}/>
        );
    }

    private getMonths = () => {
        const days = this.props.caloriesState.days;
        const months = _.groupBy(days, (day: Day) => {
            return moment(day.date).format('MM/YY');
        });
        return months;
    };

    private onDayClick = (newDate) => {
        this.setState({
            selectedDay: newDate
        });
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}
