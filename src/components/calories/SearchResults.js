// Line Limit 50
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import {appState} from '../../util';
import {observer} from 'mobx-react';

const SearchResultsWrapper = styled.ul`
	list-style-type: none;
	padding: 20px;
	text-align: left;
	border: 1px solid #ccc;
	
	& > li {
		position: relative;
		height: 30px;
		line-height: 30px;
		& > .food-name {
			display: inline-block;
			left: 30px;
			position: absolute;
		}
		& > .calories {
			display: inline-block;
			position: absolute;
			right: 100px;
		}
		& > button {
			display: inline-block;
			position: absolute;
			right: 10px;
			top: 0px;
		}
	}
	
`;

export default observer(class SearchResults extends React.Component {

	static propTypes = {
		onAddFood: PropTypes.func.isRequired
	};

	render(){
		return (
			<SearchResultsWrapper>
				{appState.foodDefinitions.map(food => {
					return (
						<li key={food.name}>
							<div className="food-name">{food.name}</div>
							<div className="calories">{food.calories}</div>
							<Button iconName="plus" onClick={() => this.onAddFood(food)} />
						</li>
					);
				})}
			</SearchResultsWrapper>
		);
	}

	onAddFood = (food) => {
		this.props.onAddFood(food);
	}
})