import React from 'react';
import moment from 'moment';
import {observer} from 'mobx-react';
import {appState} from '../../util';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import _ from 'lodash';

const CaloriesListWrapper = styled.ul`
	border: 1px solid #ccc;
	width: 500px;
	min-height: 100px;
	max-height: 500px;
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
		
		& > .pt-button-group {
			position: absolute;
			right: 10px;
			top: 15px;
		}
	}
`;

export default observer(class ConsumedFoodsList extends React.Component {
	render(){
		const date = moment().format('MM/DD/YY')
		const day = _.find(appState.days, day => day.date === date);
		if(!day || !day.consumed) {
			return <div></div>
		}
		return (
			<CaloriesListWrapper>
				{day.consumed.map((entry, index) => {
					return (
						<li key={index}>
							<span className="food-name">{entry.name}</span>
							<span className="calories">{entry.calories}</span>
							<div className="pt-button-group">
								<Button iconName="repeat" onClick={() => this.onRepeatFood(entry)} />
								<Button iconName="trash" onClick={() => this.onRemoveFood(entry)} />
							</div>
						</li>
					);
				})}
			</CaloriesListWrapper>
		);
	}

	onRepeatFood = (entry) => {
		appState.addConsumedFood(entry);
	};

	onRemoveFood = (entry) => {
		appState.removeConsumedFood(entry);
	}
})