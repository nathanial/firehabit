import React from 'react';
import {observer} from 'mobx-react';
import {appState} from '../../util';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
const CaloriesListWrapper = styled.ul`
	border: 1px solid #ccc;
	width: 500px;
	height: 500px;
	overflow-y: scroll;
	list-style-type: none;
	text-align: left;
	padding: 0;
	
	&> li:nth-child(odd) {
		background: #eee;
	}
	& > li {
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

export default observer(class ConsumedFoodsList extends React.Component {
	render(){
		return (
			<CaloriesListWrapper>
				{appState.consumedFoods.map((entry, index) => {
					return (
						<li key={index}>
							<span className="food-name">{entry.name}</span>
							<span className="calories">{entry.calories}</span>
							<Button iconName="trash" onClick={() => this.onRemoveFood(entry)} />
						</li>
					);
				})}
			</CaloriesListWrapper>
		);
	}
})