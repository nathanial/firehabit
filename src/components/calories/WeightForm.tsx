import * as _ from 'lodash';
import * as React from 'react';
import {db} from '../../util';
import cxs from 'cxs';

const weightFormClass = cxs({
	display: 'block',
	width: '100%',
	position: 'relative'
});

interface WeightFormProps {
	date: string;
	days: Day[];
}

export default class WeightForm extends React.Component<WeightFormProps, {}> {
	render(){
		const days = this.props.days;
		const day = _.find(days, day => day.date === this.props.date);
		const weight = _.get(day, 'weight', '') as string;
		return (
			<div className={`pt-card pt-elevation-2 ${weightFormClass} weight-form`} >
				<div className="pt-input-group">
					<span className="pt-icon pt-icon-step-chart" />
					<input type="text" className="pt-input" placeholder="Weight of the day..." value={weight} onChange={this.onUpdateWeight}/>
				</div>
			</div>
		);
	}

	onUpdateWeight = (event) => {
		const newWeight = parseInt(event.target.value, 10);
		const day = _.find(this.props.days, {date: this.props.date});
		day.set({weight: newWeight});
		this.forceUpdate();
	}
}