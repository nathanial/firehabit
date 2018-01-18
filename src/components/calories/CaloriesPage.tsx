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
import {CaloriesPercentage} from './CaloriesPercentage';
import {WeightPlot} from './WeightPlot';
import {CaloriesPlot} from './CaloriesPlot';

type Props = {
    caloriesState: CaloriesState;
}

const plotBackground = "#FFF";

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
        const caloriesState = this.props.caloriesState;
        let day = moment(this.state.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        return (
            <div className="calories-page pt-card pt-elevation-3">
                <div className={classes}>
                    <Calendar selectedDay={this.state.selectedDay} caloriesState={caloriesState} onChange={this.onDateChanged} />
                    <WeightForm caloriesState={caloriesState} selectedDay={this.state.selectedDay} />
                    <ConsumedFoodsList day={dayObj} onToggleAddFood={this.onToggleAddFood}/>
                    <CaloriesPercentage caloriesState={caloriesState} selectedDay={this.state.selectedDay} />
                </div>
                <div className="right-column">
                    <div className="graphs">
                        <WeightPlot caloriesState={this.props.caloriesState} />
                        <CaloriesPlot caloriesState={this.props.caloriesState} />
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
            if(!$(".food-search-input").is(":focus")){
                setTimeout(() => {
                    $(".food-search-input").focus();
                }, 500);
            }
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

    private onToggleAddFood = () => {
        this.setState({
            showAddFoodDialog: !this.state.showAddFoodDialog
        });
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
