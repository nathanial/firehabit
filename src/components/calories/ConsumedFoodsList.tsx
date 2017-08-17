import * as React from 'react';
import {observer} from 'mobx-react';
import {db} from '../../util';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import * as _ from 'lodash';

const CaloriesListWrapper = styled.ul`
	border: 1px solid #000;
	width: 600px;
	max-width: 600px;
	min-width: 600px;
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

interface Props {
	day: string;
}

@observer
export default class ConsumedFoodsList extends React.Component<Props, {}> {

	render(){
		const day = _.find(db.daysDB.days, day => day.date === this.props.day);
		let groups = [];
		if(day){
			groups = this.getEntryGroups(day);
		}
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

	getEntryGroups = (day: Day) => {
		const pairs = _.toPairs(_.groupBy(day.consumed, 'name'));
		return _.map(pairs, ([name, group]) => {
			return {
				name,
				count: group.length,
				calories: _.sumBy(group, (e: ConsumedFood) => parseInt(e.calories, 10)),
				group: group
			};
		});
	};

	onRepeatFood = (day, entry) => {
		db.daysDB.addConsumedFood(day, entry);
	};

	onRemoveFood = (day, entry) => {
		db.daysDB.removeConsumedFood(day, entry);
	};

}