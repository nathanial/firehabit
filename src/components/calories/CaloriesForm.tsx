// Line Limit 100
import * as React from 'react';
import DayPicker from '../DayPicker';
import NewFoodDialog from './NewFoodDialog';
import * as _ from 'lodash';
import SearchResults from './SearchResults';
import {db} from '../../util';
import ConsumedFoodsList from './ConsumedFoodsList';
import DialogService from "../../services/DialogService";
import FoodDefinitionForm from "./FoodDefinitionForm";
import WeightForm from "./WeightForm";
import cxs from 'cxs';

const caloriesFormWrapperClass = cxs({
	position: 'relative',
	opacity: 0.95,
	'h2': {
		'text-align': 'left',
		'margin-bottom': '20px',
		'margin-top': '10px'
	},
	'min-width': '610px',
	'margin-top': '30px'
});

const caloriesFormOuterWrapperClass = cxs({
	display: 'inline-block',
	position: 'relative',
	margin: '10px',
	opacity: 0.95
});

interface CaloriesFormProps {
	date: string;
	days: Day[];
	foodDefinitions: FoodDefinition[];
	consumedFoods: ConsumedFood[];
	onChangeDate(newDate: string);
}


export default class CaloriesForm extends React.PureComponent<CaloriesFormProps,{}> {

	state = {
		value: ''
	};

	search: HTMLInputElement;

	render() {
		return (
			<div className={caloriesFormOuterWrapperClass}>
				<WeightForm date={this.props.date} days={this.props.days} />
				<div className={`pt-card pt-elevation-2 ${caloriesFormWrapperClass}`}>
					<h2>Calories</h2>
					<DayPicker date={this.props.date}
							 	onChange={(newDate) => this.props.onChangeDate(newDate)} />
					<div className="pt-input-group">
						<span className="pt-icon pt-icon-search"/>
						<input ref={(search) => this.search = search} value={this.state.value}
								 className="pt-input" type="search"
								 placeholder="Add Food" dir="auto"
								 onChange={this.onChange} />
					</div>
					{this.content()}
				</div>
			</div>
		);
	}

	onChange = () => {
		const value = this.search.value;
		this.setState({ value });
	};

	content = () =>{
		if(!_.isEmpty(this.state.value)){
			return (
				<div>
					<SearchResults search={this.state.value}
								   foodDefinitions={this.props.foodDefinitions}
								   onAddFood={this.onAddFood}
								   onRemoveFoodDefinition={this.onRemoveFoodDefinition}
								   onEditFoodDefinition={this.onEditFoodDefinition}/>
					<NewFoodDialog defaultName={this.state.value} foodDefinitions={this.props.foodDefinitions} />
				</div>
			);
		}
		const day = _.find(this.props.days, (d) => d.date === this.props.date);
		return (
			<ConsumedFoodsList day={day} />
		);
	};

	onAddFood = async (food: FoodDefinition) => {
		this.props.consumedFoods.push({name: food.name, calories: food.calories});
	};

	onRemoveFoodDefinition = async (food: FoodDefinition) => {
		const {foodDefinitions} = this.props;
		foodDefinitions.splice(_.findIndex(foodDefinitions, f => f.name === food.name), 1);
	};

	onEditFoodDefinition = async (food: FoodDefinition) => {
		let updatedFoodDefinition: FoodDefinition;
		function onChange(newValue: FoodDefinition){
			updatedFoodDefinition = newValue;
		}
		const result = await DialogService.showDialog("Food Definition", "Ok", "Cancel", (
			<FoodDefinitionForm foodDefinition={food} onChange={onChange} />
		));
		if(result && updatedFoodDefinition){
			food.set(updatedFoodDefinition);
		}
	};

}
