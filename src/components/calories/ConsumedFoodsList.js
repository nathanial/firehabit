import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {appState} from '../../util';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import _ from 'lodash';

const CaloriesListWrapper = styled.ul`
	border: 1px solid #000;
	width: 500px;
	min-height: 100px;
	max-height: 500px;
	overflow-y: scroll;
	list-style-type: none;
	text-align: left;
	padding: 0;
	
	&> li:nth-child(odd) {
		background: #475969;
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
		const groups = this.getEntryGroups(day);
		return (
			<CaloriesListWrapper>
				{groups.map((entry, index) => {
					let name = entry.name;
					if(entry.count > 1){
						name += ` x${entry.count}`;
					}
					return (
						<li key={JSON.stringify(entry)}>
							<span className="food-name">{name}</span>
							<span className="calories">{entry.calories}</span>
							<div className="pt-button-group">
								<Button iconName="plus" onClick={() => this.onRepeatFood(day, _.last(entry.group))} />
								<Button iconName="trash" onClick={() => this.onRemoveFood(day, _.last(entry.group))} />
							</div>
						</li>
					);
				})}
			</CaloriesListWrapper>
		);
	}

	getEntryGroups = (day) => {
		const pairs = _.toPairs(_.groupBy(day.consumed, 'name'));
		return _.map(pairs, ([name, group]) => {
			return {
				name,
				count: group.length,
				calories: _.sumBy(group, e => parseInt(e.calories, 10)),
				group: group
			};
		});
	};

	onRepeatFood = (day, entry) => {
		appState.addConsumedFood(day, entry);
	};

	onRemoveFood = (day, entry) => {
		appState.removeConsumedFood(day, entry);
	};

});