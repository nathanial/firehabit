import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";

const DayPickerWrapper = styled.div`
	position: absolute;
	top: -3px;
	left: 200px;
	
	& > span {
		font-size: 14px;
	}
	
	& > button:first-child {
		margin-right: 10px;
	}
	& > button:last-child {
		margin-left: 10px;
	}
`;

export default function DayPicker(props){
	const currentDate = moment(props.date, 'MM/DD/YY');

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
		<DayPickerWrapper>
			<span>Date</span>
			<Button iconName="chevron-left" className="pt-minimal" onClick={prevDay} />
			<span>{props.date}</span>
			<Button iconName="chevron-right" className="pt-minimal" onClick={nextDay} />
		</DayPickerWrapper>
	);
}