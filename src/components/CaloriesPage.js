import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import {state} from '../util';
import _ from 'lodash';

const CaloriesPageWrapper = styled.div`
`;

const CaloriesFormWrapper = styled.div`
	width: 500px;
	margin: 50px;
	& > h2 {
		text-align: left;
		margin-bottom: 20px;
	}
`;

const CaloriesList = styled.ul`
`;

function FoodEntry(props){
	return (
		<li>Food Entry</li>
	);
}

class SearchResults extends React.Component {
	render(){
		return <h1>Search Results</h1>;
	}
}

class CaloriesForm extends React.Component {

	state = {
		value: ''
	};

	render() {
		return (
			<CaloriesFormWrapper>
				<h2>Calories</h2>
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
			return <SearchResults />
		}
		return (
			<h1>Calories List</h1>
		);
		// return (
		// 	<CaloriesList>
		// 		{this.props.foodEntries.map(entry => {
		// 			return <FoodEntry entry={entry} />
		// 		})}
		// 	</CaloriesList>
		// );
	}

}

class CaloriesPage extends React.Component {
	render(){
		const foodEntries = state.foodEntries;
		return (
			<CaloriesPageWrapper>
				<CaloriesForm foodEntries={foodEntries} />
			</CaloriesPageWrapper>
		);
	}
}

export default observer(CaloriesPage);