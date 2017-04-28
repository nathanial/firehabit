// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import DayPicker from "../DayPicker";
import NewFoodDialog from './NewFoodDialog';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

const CaloriesFormWrapper = styled.div`
	position: relative;
	width: 500px;
	margin: 50px;
	& > h2 {
		text-align: left;
		margin-bottom: 20px;
	}
`;

const CaloriesList = styled.ul`
	border: 1px solid #ccc;
	width: 500px;
	min-height: 300px;
`;


function FoodEntry(props){
	return (
		<li>Food Entry</li>
	);
}

const SearchResultsWrapper = styled.ul`
	
`;

class SearchResults extends React.Component {
	render(){
		return (
			<SearchResultsWrapper>
				{this.props.allFoods.map(food => {
					return (
						<li key={food.name}>{food.name}</li>
					);
				})}
			</SearchResultsWrapper>
		);
	}
}



export default class CaloriesForm extends React.Component {

	static propTypes = {
		consumedFoods: PropTypes.array.isRequired,
		allFoods: PropTypes.array.isRequired
	};

	state = {
		value: ''
	};

	render() {
		return (
			<CaloriesFormWrapper>
				<h2>Calories</h2>
				<DayPicker />
				<div className="pt-input-group">
					<span className="pt-icon pt-icon-search"></span>
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
			console.log("All Foods", this.props.allFoods);
			return (
				<div>
					<SearchResults search={this.state.value} allFoods={this.props.allFoods} />
					<NewFoodDialog />
				</div>
			);
		}
		return (
			<CaloriesList>
				{this.props.consumedFoods.map(entry => {
					return <FoodEntry entry={entry} />
				})}
			</CaloriesList>
		);
	}

}
