// Line Limit 100
import * as React from 'react';
import styled from 'styled-components';
import DayPicker from '../DayPicker';
import NewFoodDialog from './NewFoodDialog';
import * as _ from 'lodash';
import SearchResults from './SearchResults';
import {db} from '../../util';
import ConsumedFoodsList from './ConsumedFoodsList';
import DialogService from "../../services/DialogService";
import FoodDefinitionForm from "./FoodDefinitionForm";
import WeightForm from "./WeightForm";

const CaloriesFormWrapper = styled.div`
	position: relative;
	& > h2 {
		text-align: left;
		margin-bottom: 20px;
		margin-top: 10px;
	}
	min-width: 540px;
	margin-top: 30px;
`;

const CaloriesFormOuterWrapper = styled.div`
	display: inline-block;
	position: relative;
	margin: 50px;
`;

interface CaloriesFormProps {
	date: string;
	onChangeDate(newDate: string);
}

interface CaloriesFormState {

}

export default class CaloriesForm extends React.Component<CaloriesFormProps, CaloriesFormState> {

	state = {
		value: ''
	};

	search: HTMLInputElement;

	render() {
		return (
			<CaloriesFormOuterWrapper>
				<WeightForm date={this.props.date} />
				<CaloriesFormWrapper className="pt-card pt-elevation-2">
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
				</CaloriesFormWrapper>
			</CaloriesFormOuterWrapper>
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
								   foodDefinitions={db.foodDefinitionsDB.foodDefinitions}
								   onAddFood={this.onAddFood}
								   onRemoveFoodDefinition={this.onRemoveFoodDefinition}
								   onEditFoodDefinition={this.onEditFoodDefinition}/>
					<NewFoodDialog defaultName={this.state.value} />
				</div>
			);
		}
		return (
			<ConsumedFoodsList day={this.props.date} />
		);
	};

	onAddFood = async (food) => {
		await db.daysDB.addConsumedFood(this.props.date, food);
		this.setState({
			value: ''
		});
	};

	onRemoveFoodDefinition = async (food) => {
		await db.foodDefinitionsDB.removeFoodDefinition(food);
	};

	onEditFoodDefinition = async (food) => {
		let updatedFoodDefinition;
		function onChange(newValue){
			updatedFoodDefinition = newValue;
		}
		const result = await DialogService.showDialog("Food Definition", "Ok", "Cancel", (
			<FoodDefinitionForm foodDefinition={food} onChange={onChange} />
		));
		if(result && updatedFoodDefinition){
			await db.foodDefinitionsDB.updateFoodDefinition(_.extend({}, food,  updatedFoodDefinition));
		}
	};

}
