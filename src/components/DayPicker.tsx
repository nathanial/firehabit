import * as React from 'react';
import * as moment from 'moment';
import {Button} from "@blueprintjs/core";
import cxs from 'cxs';

const dayPickerClass = cxs({
	position: 'absolute',
	left: 200,
	top: 26,
	'> span': {
		fontSize: 14
	},
	'> button:first-child': {
		marginRight: 10,
	},
	'> button:last-child': {
		marginLeft: 10
	}
});

type Props = {
	date: String
	onChange(newDate: String)
}

export default class DayPicker extends React.PureComponent<Props> {
	render(){
		const props = this.props;
		const currentDate = moment(props.date as any, 'MM/DD/YY');

		const prevDay = () => {
			const newDate = moment(currentDate);
			newDate.subtract(1, 'day');
			props.onChange(newDate.format('MM/DD/YY'));
		};

		const nextDay = () => {
			const newDate = moment(currentDate);
			newDate.add(1, 'day');
			props.onChange(newDate.format('MM/DD/YY'));
		};

		return (
			<div className={dayPickerClass + " day-picker"}>
				<span>Date</span>
				<Button icon="chevron-left" className="pt-minimal" onClick={prevDay} />
				<span>{props.date}</span>
				<Button icon="chevron-right" className="pt-minimal" onClick={nextDay} />
			</div>
		);
	}
}
