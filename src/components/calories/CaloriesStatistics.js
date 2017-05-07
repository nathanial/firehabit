import React from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import _ from 'lodash';
import {appState} from '../../util';

const CalorieStatisticsWrapper = styled.div`
	display: inline-block;
	border: 1px solid #aaa;
	width: 200px;
	height: 200px;
	vertical-align: top;
	margin-top: 90px;
	
	& > .pt-running-text {
		margin-top: 20px;
		& > .total-calories-label {
			margin-right: 10px;
		}
	}
	
	
`;

export default observer(class CalorieStatistics extends React.Component {

	static propTypes = {
		date: React.PropTypes.string.isRequired,
	};

	render(){
		const day = _.find(appState.days, day => day.date === this.props.date);
		if(!day || !day.consumed) {
			return <div></div>
		}
		return (
			<CalorieStatisticsWrapper>
				<p className="pt-running-text">
					<span className="total-calories-label">Total Calories: </span>
					<span>{_.sum(_.map(day.consumed, f => parseInt(f.calories, 10)))}</span>
				</p>
			</CalorieStatisticsWrapper>
		);
	}
});