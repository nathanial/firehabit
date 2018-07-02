import *  as React from 'react';
import * as moment from 'moment';
import {Button} from '@blueprintjs/core';

type Props = {
    date: Date
    onChange(newDate: Date)
}

export class WeekPicker extends React.PureComponent<Props, {}> {
    render(){
        const props = this.props;
		const currentDate = moment(props.date as any, 'MM/DD/YY');

		const prevDay = () => {
			const newDate = moment(currentDate);
			newDate.subtract(1, 'week');
			props.onChange(newDate.toDate());
		};

		const nextDay = () => {
			const newDate = moment(currentDate);
			newDate.add(1, 'week');
			props.onChange(newDate.toDate());
		};

		return (
			<div className="month-picker">
				<Button iconName="chevron-left" className="pt-minimal" onClick={prevDay} />
				<span>{moment(props.date).startOf("week").format("MM/DD/YY")}</span>
				<Button iconName="chevron-right" className="pt-minimal" onClick={nextDay} />
			</div>
		);
    }
}
