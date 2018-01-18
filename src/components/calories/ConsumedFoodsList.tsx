import * as React from 'react';
import {db} from '../../util';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import * as _ from 'lodash';
import { Icon } from '@blueprintjs/core';

interface Props {
	day: Day;
}

export class ConsumedFoodsList extends React.Component<Props, {}> {

	render(){
		const day = this.props.day;
		let groups = [];
		if(day){
			groups = this.getEntryGroups(day);
		}
		return (
			<ul className="consumed-foods-list">
				{groups.map((entry, index) => {
					let name = entry.name;
					if(entry.count > 1){
						name += ` x${entry.count}`;
					}
					return (
						<li key={JSON.stringify(entry)}>
							<span className="food-name">{name}</span>
							<span className="calories">{entry.calories}</span>
							<Icon iconName="plus" onClick={() => this.onRepeatFood(day, _.last(entry.group))}/>
							<Icon iconName="trash" onClick={() => this.onRemoveFood(day, _.last(entry.group))} />
						</li>
					);
				})}
			</ul>
		);
	}

	getEntryGroups = (day: Day) => {
		const pairs = _.toPairs(_.groupBy(day.consumed, 'name'));
		return _.sortBy(_.map(pairs, ([name, group]) => {
			return {
				name,
				count: group.length,
				calories: _.sumBy(group, (e: ConsumedFood) => parseInt(e.calories, 10)),
				group: group
			};
		}), group => group.name);
	};

	onRepeatFood = (day: Day, entry) => {
		day.consumed.push({calories: entry.calories, name: entry.name});
	};

	onRemoveFood = (day: Day, entry) => {
		day.consumed.splice(_.findIndex(day.consumed, f => f.name === entry.name), 1);
	};

}
