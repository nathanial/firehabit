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
import ScrollArea from '../ScrollArea';
import * as Plot from 'react-plotly.js'
import {Button} from '@blueprintjs/core';
import {ConsumedFoodsList} from './ConsumedFoodsList';

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

export default class CaloriesPage extends React.Component<Props,{}> {

    state = {
        selectedDay: new Date()
    };

    render() {
        return (
            <div className="calories-page pt-card pt-elevation-3">
                <div className="left-column">
                    {this.renderCalendar()}
                    {this.renderWeight()}
                    {this.renderFoodEaten()}
                    {this.renderCaloriesPercentage()}
                </div>
                <div className="right-column">
                    <div className="graphs">
                        {this.renderWeightPlot()}
                        {this.renderCaloriesPlot()}
                    </div>
                </div>
            </div>
        );
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
                <div className={classes} style={{width: `${percentage}%`}} />
                <span>{percentage}%</span>
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
                <Button iconName="plus" className="pt-minimal add-food-btn" />
                <ConsumedFoodsList day={dayObj} />
            </div>
        );
    }

    private renderWeight(){
        const caloriesState = this.props.caloriesState;
        let day = moment(this.state.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        const weight = _.get(dayObj, 'weight', 0).toString();
        return (
            <div className="weight-form">
                <h1>Weight on
                    <span className="date">{moment(this.state.selectedDay).format('MMM DD ')}</span>
                    :
                    <InlineText className="weight" value={weight} onChange={this.onWeightChanged}></InlineText>
                    <span className="suffix">lbs</span>
                </h1>
            </div>
        );
    }

    private renderCalendar() {
        const caloriesState = this.props.caloriesState;
        const goal = parseInt(caloriesState['calorie-settings'].weightStasisGoal as any, 10);

        let day = moment(this.state.selectedDay).format("MM/DD/YY");
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
            <DayPicker selectedDays={this.state.selectedDay} modifiers={modifiers} modifiersStyles={modifiersStyles} onDayClick={this.onDayClick}/>
        );
    }

    private renderWeightPlot(){
        var months = this.getMonths();

        const data = _.map(_.keys(months), (month) => {
            const days = months[month];
            return {
                type: 'box',
                name: month,
                y: _.filter(_.map(days, d => d.weight), x => x !== 0)
            };
        });
        const layout = {
            width: 726,
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
            width: 726,
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

    private onWeightChanged = (newWeight) => {
        const day = moment(this.state.selectedDay).format('MM/DD/YY');
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

    private onDayClick = (newDate) => {
        this.setState({
            selectedDay: newDate
        });
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}
