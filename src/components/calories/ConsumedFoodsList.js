import React from 'react';
import PropTypes from 'prop-types';
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
			display: inline-block;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 220px;
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

	static propTypes = {
		day: PropTypes.string.isRequired
	};

	render(){
		const day = _.find(appState.days, day => day.date === this.props.day);
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
								<Button iconName="repeat" onClick={() => this.onRepeatFood(day, entry)} />
								<Button iconName="trash" onClick={() => this.onRemoveFood(day, entry)} />
							</div>
						</li>
					);
				})}
			</CaloriesListWrapper>
		);
	}

	onRepeatFood = (day, entry) => {
		appState.addConsumedFood(day, entry);
	};

	onRemoveFood = (day, entry) => {
		appState.removeConsumedFood(day, entry);
	};

});