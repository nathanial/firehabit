// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import DayPicker from "../DayPicker";
import NewFoodDialog from './NewFoodDialog';
import * as _ from 'lodash';
import SearchResults from "./SearchResults";
import {appState} from '../../util';
import ConsumedFoodsList from "./ConsumedFoodsList";
import {observer} from 'mobx-react';
import moment from 'moment';

const CaloriesFormWrapper = styled.div`
	position: relative;
	width: 500px;
	margin: 50px;
	& > h2 {
		text-align: left;
		margin-bottom: 20px;
	}
`;




export default observer(class CaloriesForm extends React.Component {

	state = {
		value: '',
		date: moment().format('MM/DD/YY')
	};

	render() {
		return (
			<CaloriesFormWrapper>
				<h2>Calories</h2>
				<DayPicker date={this.state.date} onChange={(newDate) => this.setState({date: newDate})} />
				<div className="pt-input-group">
					<span className="pt-icon pt-icon-search"/>
					<input ref="search" value={this.state.value} className="pt-input" type="search" placeholder="Add Food" dir="auto" onChange={this.onChange} />
				</div>
				{this.content()}
			</CaloriesFormWrapper>
		);
	}

	onChange = () => {
		const value = this.refs.search.value;
		this.setState({
			value
		});
	};

	content = () =>{
		if(!_.isEmpty(this.state.value)){
			return (
				<div>
					<SearchResults search={this.state.value}
												 foodDefinitions={appState.foodDefinitions}
												 onAddFood={this.onAddFood}
											   onRemoveFoodDefinition={this.onRemoveFoodDefinition}/>
					<NewFoodDialog defaultName={this.state.value} />
				</div>
			);
		}
		return (
			<ConsumedFoodsList/>
		);
	};

	onAddFood = async (food) => {
		await appState.addConsumedFood(this.state.date, food);
		this.setState({
			value: ''
		});
	};

	onRemoveFoodDefinition = async (food) => {
		await appState.removeFoodDefinition(food);
	}

})
