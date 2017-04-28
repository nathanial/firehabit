import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
//Line Limit 50

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


export default function DayPicker(){
	const today = moment();
	return (
		<DayPickerWrapper>
			<span>Date</span>
			<button type="button" className="pt-button pt-minimal pt-icon-chevron-left"></button>
			<span>{today.format('MM/DD/YY')}</span>
			<button type="button" className="pt-button pt-minimal pt-icon-chevron-right"></button>
		</DayPickerWrapper>
	);
}