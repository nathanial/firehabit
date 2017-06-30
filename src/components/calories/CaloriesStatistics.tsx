import * as React from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import * as _ from 'lodash';
import {db, history} from '../../util';
import {Button} from '@blueprintjs/core';

const CalorieStatisticsWrapper = styled.div`
	display: inline-block;
	position: relative;
	text-align: left;
	width: 250px;
	height: 200px;
	vertical-align: top;
	margin-top: 50px;

	& > .pt-running-text {
		margin-top: 5px;
		margin-bottom: 0;
		& > .total-calories-label {
			margin-right: 10px;
		}
	}
	
	.settings-btn {
		position: absolute;
		right: 0;
		top: 0;
	}
	
	.smiley {
		position: absolute;
		right: 30px;
		top: 110px;
	}
`;

interface CalorieStatisticsProps {
	date: string;
}

@observer
export default class CalorieStatistics extends React.Component<CalorieStatisticsProps, {}> {
	render() {
		const day = _.find(db.daysDB.days, day => day.date === this.props.date);
		if (!day || !day.consumed) {
			return <div></div>
		}
		const goal = db.calorieSettingsDB.calorieSettings.caloricGoal;
		const dailyTotal = _.sum(_.map(day.consumed, f => parseInt(f.calories, 10)));
		const remaining = goal - dailyTotal;
		const weightStasisGoal = db.calorieSettingsDB.calorieSettings.weightStasisGoal;
		const caloriesInPound = 3500;
		const poundsLost = Math.round(((weightStasisGoal - dailyTotal) / caloriesInPound) * 100) / 100;
		return (
			<CalorieStatisticsWrapper className="pt-card pt-elevation-1">
				{this.renderSmileyFace(poundsLost)}
				<div style={{marginTop: 20}}>
					<p className="pt-running-text">
						<span className="total-calories-label">Total Calories: </span>
						<span>{dailyTotal}</span>
					</p>
					<p className="pt-running-text">
						<span className="goal-label">Goal: </span>
						<span>{goal}</span>
					</p>
					{this.renderRemaining(remaining)}
					{this.renderPoundsLost(poundsLost)}
				</div>
				<Button className="settings-btn pt-minimal" iconName="settings" onClick={this.gotoSettings}></Button>
			</CalorieStatisticsWrapper>
		);
	}

	renderSmileyFace(poundsLost) {
		if(poundsLost > (2 / 7)) {
			return (
				<img className="smiley" src="icons/happy.png" width="32" />
			);
		} else if(poundsLost > 0) {
			return (
				<img className="smiley" src="icons/dread.png" width="32"  />
			);
		} else {
			return (
				<img className="smiley" src="icons/crying.png" width="32"/>
			);
		}
	}

	renderRemaining(remaining) {
		const style = {} as any;
		if(remaining > 0) {
			style.color = '#00FF00';
		} else {
			style.color = '#ff0000';
		}
		return (
			<p className="pt-running-text" style={style}>
				<span className="goal-label">Remaining: </span>
				<span>{remaining}</span>
			</p>
		);
	}

	renderPoundsLost(poundsLost){
		const style = {} as any;
		if(poundsLost > (2 / 7)){
			style.color = '#00FF00';
			style.fontWeight = 'bold';
		} else if(poundsLost > 0) {
			style.color = '#ffbb05';
			style.fontWeight = 'bold';
		} else {
			style.color = '#ff0000';
			style.fontWeight = 'bold';
		}
		return (
			<p className="pt-running-text" style={style}>
				<span className="goal-label">Pounds Lost Today: </span>
				<span>{poundsLost}</span>
			</p>
		);
	}

	gotoSettings = () => {
		history.push('/calories/settings');
	}
}