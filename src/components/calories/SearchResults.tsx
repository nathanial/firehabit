// Line Limit 50
import * as React from 'react';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";

interface SearchResultsProps {
	search: string;
	foodDefinitions: FoodDefinition[];
	onAddFood(foodDefinition: FoodDefinition);
	onRemoveFoodDefinition(foodDefinition: FoodDefinition);
	onEditFoodDefinition(foodDefinition: FoodDefinition);
}

export default class SearchResults extends React.Component<SearchResultsProps, {}> {

	render(){
		return (
			<div className="search-results-wrapper">
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
			</div>
		);
	}
}