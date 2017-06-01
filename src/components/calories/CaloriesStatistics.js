import React from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import _ from 'lodash';
import {appState, history} from '../../util';
import {Button} from '@blueprintjs/core';

const CalorieStatisticsWrapper = styled.div`
	display: inline-block;
	position: relative;
	width: 200px;
	height: 200px;
	vertical-align: top;
	margin-top: 50px;
	
	& > .pt-running-text {
		margin-top: 20px;
		& > .total-calories-label {
			margin-right: 10px;
		}
	}
	
	.settings-btn {
		position: absolute;
		right: 0;
		top: 0;
	}
`;

@observer
export default class CalorieStatistics extends React.Component {

	static propTypes = {
		date: React.PropTypes.string.isRequired,
	};

	render(){
		const day = _.find(appState.days, day => day.date === this.props.date);
		if(!day || !day.consumed) {
			return <div></div>
		}
		return (
			<CalorieStatisticsWrapper className="pt-card pt-elevation-1">
				<p className="pt-running-text">
					<span className="total-calories-label">Total Calories: </span>
					<span>{_.sum(_.map(day.consumed, f => parseInt(f.calories, 10)))}</span>
				</p>
				<Button className="settings-btn pt-minimal" iconName="settings" onClick={this.gotoSettings}></Button>
			</CalorieStatisticsWrapper>
		);
	}

	gotoSettings = () => {
		history.push('/calories/settings');
	}
}