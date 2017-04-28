// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import DayPicker from "../DayPicker";
import NewFoodDialog from './NewFoodDialog';
import * as _ from 'lodash';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import SearchResults from "./SearchResults";
import {Button} from "@blueprintjs/core/dist/components/button/buttons";

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
	list-style-type: none;
	text-align: left;
	padding: 0;
	
	& > li {
		background: #eee;
		padding: 20px;
		position: relative;
		
		& > .food-name {
		}
		
		& > .calories {
			position: absolute;
			right: 200px;
		}
		
		& > button {
			position: absolute;
			right: 10px;
			top: 15px;
		}
	}
`;


export default class CaloriesForm extends React.Component {

	static propTypes = {
		consumedFoods: PropTypes.array.isRequired,
		allFoods: PropTypes.array.isRequired
	};

	state = {
		value: ''
	};

	constructor(){
		super(...arguments);

		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.consumedFoodsRef = firebase.database().ref(`/users/${userId}/consumedFoods`);
	}

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
			return (
				<div>
					<SearchResults search={this.state.value} allFoods={this.props.allFoods} onAddFood={this.onAddFood} />
					<NewFoodDialog />
				</div>
			);
		}
		return (
			<CaloriesList>
				{this.props.consumedFoods.map((entry, index) => {
					return (
						<li key={index}>
							<span className="food-name">{entry.name}</span>
							<span className="calories">{entry.calories}</span>
							<Button iconName="trash" onClick={() => this.onRemoveFood(entry)} />
						</li>
					);
				})}
			</CaloriesList>
		);
	};

	onAddFood = async (food) => {
		await this.consumedFoodsRef.push(food);
		this.setState({
			value: ''
		});
	};

	onRemoveFood = async (food) => {
	}

}
