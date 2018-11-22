import * as $ from 'jquery';
import * as React from 'react';
import ScrollArea from '../ScrollArea';
import * as _ from 'lodash';
import {CaloriesState} from "../../state";
import * as moment from 'moment';
import {generatePushID} from '../../db/util';
import {Icon, Button} from '@blueprintjs/core';
import InlineText from '../InlineText';

type Props = {
    visible: boolean;
    foodDefinitions: FoodDefinition[];
    days: Day[];
    selectedDay: Date;
    onClose();
}

type State = {
    search: string;
    active: string;
}

export class AddFoodDialog extends React.PureComponent<Props,State> {
    private scrollbar: any;

    state = {
        search: '',
        active: ''
    }

    render(){
        let classes = "add-food-dialog";
        if(this.props.visible){
            classes += " visible";
        }
        return (
            <div className={classes}>
                <div className="search-input-container">
                    <Icon icon="search" className="search-icon" />
                    <input type="text" className="food-search-input" placeholder="Hamburger" autoFocus={true}
                        onChange={this.onSearchChanged}
                        onKeyDown={this.onKeyDown}/>
                    <Button className="pt-minimal close-btn" icon="cross" onClick={this.props.onClose} />
                </div>
                {this.renderSearchResults()}
            </div>
        );
    }

    componentWillReceiveProps(nextProps: Props) {
        if(nextProps.visible && !this.props.visible){
            if(!$(".food-search-input").is(":focus")){
                setTimeout(() => {
                    $(".food-search-input").focus();
                }, 500);
            }
        }
    }

    private renderSearchResults(){
        const results = this.filteredDefinitions();
        if(results.length === 0){
            return (
                <div className="search-results">
                    <Button text="Add New Food" className="add-new-food-btn" onClick={this.onAddNewFood} />
                </div>
            );
        } else {
            return (
                <div className="search-results">
                    <ScrollArea ref={scrollbar => this.scrollbar = scrollbar} className="search-results-content">
                        {_.map(results, match => {
                            return (
                                <div key={match.id} className="search-result">
                                    <Button className="add-btn pt-minimal" icon="plus" onClick={() => this.onSelectResult(match)} />
                                    <InlineText className="food-name"
                                                value={match.name}
                                                onChange={(newValue) => this.onNameChanged(match, newValue)} />
                                    <InlineText className="food-calories"
                                                value={match.calories}
                                                onChange={(newValue) => this.onCaloriesChanged(match, newValue)} />
                                </div>
                            );
                        })}
                    </ScrollArea>
                </div>
            );
        }
    }

    private onNameChanged = (definition: FoodDefinition, newValue) => {
        definition.set({
            name: newValue
        });
    }

    private onCaloriesChanged = (definition: FoodDefinition, newValue) => {
        definition.set({
            calories: newValue
        });
    }

    private onEditClick = (event, id) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            active: id
        });
    };

    private onAddNewFood = () => {
        const search = this.state.search;
        this.props.foodDefinitions.push({
            id: generatePushID(),
            name: search,
            calories: '0'
        });
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
        const foodDefinitions = this.props.foodDefinitions;
        const matches = _.filter(foodDefinitions, (definition: FoodDefinition) => {
            return _.includes(definition.name.toLowerCase(), this.state.search.toLowerCase())
        });
        return _.sortBy(matches, (m: FoodDefinition) => m.id);
    }

    private onEditDefinition = (match: FoodDefinition) => {
        console.log("Edit Definition", match);
    }

    private onSearchChanged = (event) => {
        this.setState({
            search: event.target.value
        });
        if(this.scrollbar){
            this.scrollbar.stayInPlace = false;
            this.scrollbar.resetTop().then(() => {
                this.scrollbar.stayInPlace = true;
            });
        }
    }

    private onSelectResult = (match: FoodDefinition) => {
        let day = moment(this.props.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(this.props.days, (d: Day) => d.date === day);
        if(_.isUndefined(dayObj)){
            this.props.days.push({
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
