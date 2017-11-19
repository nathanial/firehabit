import * as React from 'react';
import {db} from '../../util';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import * as _ from 'lodash';

interface Props {
	day: Day;
}

export default class ConsumedFoodsList extends React.Component<Props, {}> {

	render(){
		const day = this.props.day;
		let groups = [];
		if(day){
			groups = this.getEntryGroups(day);
		}
		return (
			<div className="calories-list-wrapper">
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
			</div>
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

	onRepeatFood = (day: Day, entry) => {
		day.consumed.push({calories: entry.calories, name: entry.name});
	};

	onRemoveFood = (day: Day, entry) => {
		day.consumed.splice(_.findIndex(day.consumed, f => f.name === entry.name), 1);
	};

}