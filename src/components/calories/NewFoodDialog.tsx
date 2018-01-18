import * as $ from 'jquery';
import * as React from 'react';
import ScrollArea from '../ScrollArea';
import * as _ from 'lodash';
import {CaloriesState} from "../../state";
import * as moment from 'moment';
import {generatePushID} from '../../db/util';

type Props = {
    visible: boolean;
    caloriesState: CaloriesState;
    selectedDay: Date;
    onClose();
}

type State = {
    search: string;
}

export class NewFoodDialog extends React.PureComponent<Props,State> {
    private scrollbar: any;

    state = {
        search: ''
    }

    render(){
        let classes = "new-food-dialog";
        if(this.props.visible){
            classes += " visible";
            if(!$(".food-search-input").is(":focus")){
                setTimeout(() => {
                    $(".food-search-input").focus();
                }, 500);
            }
        }
        return (
            <div className={classes}>
                <div className="search-input-container">
                    <input type="text" className="food-search-input" placeholder="Hamburger" autoFocus={true}
                        onChange={this.onSearchChanged}
                        onKeyDown={this.onKeyDown}/>
                </div>
                <div className="search-results">
                    <ScrollArea ref={scrollbar => this.scrollbar = scrollbar} className="search-results-content">
                        {this.renderSearchResults()}
                    </ScrollArea>
                </div>
            </div>
        );
    }

    private onKeyDown = (event) => {
        if(event.keyCode === 13){
            const definitions = this.filteredDefinitions();
            if(definitions.length === 1){
                const selected = _.first(definitions);
                this.onSelectResult(selected);
            }
            this.props.onClose();
        }
    }

    private filteredDefinitions(){
        const foodDefinitions = this.props.caloriesState.foodDefinitions;
        const matches = _.filter(foodDefinitions, (definition: FoodDefinition) => {
            return _.includes(definition.name.toLowerCase(), this.state.search.toLowerCase())
        });
        return matches;
    }

    private renderSearchResults(){
        return (
            _.map(this.filteredDefinitions(), match => {
                return (
                    <div key={match.id} className="search-result" onClick={() => this.onSelectResult(match)}>
                        <span className="food-name">{match.name}</span>
                        <span className="food-calories">{match.calories}</span>
                    </div>
                );
            })
        );
    }

    private onSearchChanged = (event) => {
        this.setState({
            search: event.target.value
        });
        this.scrollbar.stayInPlace = false;
        this.scrollbar.resetTop().then(() => {
            this.scrollbar.stayInPlace = true;
        });
    }

    private onSelectResult = (match: FoodDefinition) => {
        let day = moment(this.props.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(this.props.caloriesState.days, (d: Day) => d.date === day);
        if(_.isUndefined(dayObj)){
            this.props.caloriesState.days.push({
                id: generatePushID(),
                date: day,
                weight: 0,
                consumed: [{name: match.name, calories: match.calories}]
            });
        } else {
            if(!dayObj.consumed){
                dayObj.set({
                    consumed: [{name: match.name, calories: match.calories}]
                });
            } else {
                dayObj.consumed.push({name: match.name, calories: match.calories});
            }
        }
    };
}
