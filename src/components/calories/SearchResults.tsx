// Line Limit 50
import * as React from 'react';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import {observer} from 'mobx-react';
const SearchResultsWrapper = styled.ul`
	list-style-type: none;
	padding: 20px;
	text-align: left;
	max-height: 300px;
	overflow-y: auto;
	
	& > li {
		position: relative;
		height: 30px;
		line-height: 30px;
		margin: 10px 0;
		& > .food-name {
			display: inline-block;
			left: 30px;
			position: absolute;
			max-width: 230px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
		& > .calories {
			display: inline-block;
			position: absolute;
			right: 150px;
		}
		& > .pt-button-group {
			display: inline-block;
			position: absolute;
			right: 10px;
			top: 0px;
		}
	}
	
`;

interface SearchResultsProps {
	search: string;
	foodDefinitions: FoodDefinition[];
	onAddFood(foodDefinition: FoodDefinition);
	onRemoveFoodDefinition(foodDefinition: FoodDefinition);
	onEditFoodDefinition(foodDefinition: FoodDefinition);
}

@observer
export default class SearchResults extends React.Component<SearchResultsProps, {}> {

	render(){
		return (
			<SearchResultsWrapper>
				{this.props.foodDefinitions.map((food, i) => {
					if(food.name.toLowerCase().indexOf(this.props.search.toLowerCase()) !== -1) {
						return (
							<li key={i}>
								<div className="food-name">{food.name}</div>
								<div className="calories">{food.calories}</div>
								<div className="pt-button-group">
									<Button iconName="trash" onClick={() => this.props.onRemoveFoodDefinition(food)} />
									<Button iconName="edit" onClick={() => this.props.onEditFoodDefinition(food)} />
									<Button iconName="plus" onClick={() => this.props.onAddFood(food)} />
								</div>
							</li>
						);
					}
				})}
			</SearchResultsWrapper>
		);
	}
}