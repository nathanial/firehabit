import * as _ from 'lodash';
import * as React from 'react';
import {db} from '../../util';
import cxs from 'cxs';

const weightFormClass = cxs({
	display: 'block',
	width: '300px',
	position: 'relative'
});

interface WeightFormProps {
	date: string;
}

export default class WeightForm extends React.Component<WeightFormProps, {}> {
	render(){
		const day = _.find(db.daysDB.days, day => day.date === this.props.date);
		const weight = _.get(day, 'weight', '');
		return (
			<div className={`pt-card pt-elevation-2 ${weightFormClass}`} >
				<div className="pt-input-group">
					<span className="pt-icon pt-icon-step-chart" />
					<input type="text" className="pt-input" placeholder="Weight of the day..." value={weight} onChange={this.onUpdateWeight}/>
				</div>
			</div>
		);
	}

	onUpdateWeight = (event) => {
		const newWeight = parseInt(event.target.value, 10);
		db.daysDB.updateDay(this.props.date, {weight: newWeight});
		this.forceUpdate();
	}
}