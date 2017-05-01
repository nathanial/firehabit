import React from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';

const CalorieStatisticsWrapper = styled.div`
	display: inline-block;
	border: 1px solid black;
	background: red;
`;

export default observer(class CalorieStatistics extends React.Component {
	render(){
		return (
			<CalorieStatisticsWrapper>
			</CalorieStatisticsWrapper>
		);
	}
});