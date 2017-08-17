import * as React from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import * as _ from 'lodash';
import {db, history} from '../../util';
import {Button} from '@blueprintjs/core';
import cxs from 'cxs';

const CalorieStatisticsWrapper = styled.div`
	display: inline-block;
	position: relative;
	text-align: left;
	width: 700px;
	max-width: 700px;
	min-width: 700px;
	vertical-align: top;
	margin-top: 20px;
	padding-left: 40px;

	& .pt-running-text {
		display: inline-block;
		margin: 10px;
		text-align: left;
		& > .total-calories-label {
			margin-right: 10px;
		}
	}
	
	.smiley {
		position: absolute;
		left: -100px;
		top:80px;
	}
`;

const settingsBtn = cxs({
	position: 'absolute',
	right: '0px',
	top: '7px'
});

interface CalorieStatisticsProps {
	date: string;
}

@observer
export default class CalorieStatistics extends React.Component<CalorieStatisticsProps, {}> {
	render() {
		const day = _.find(db.daysDB.days, day => day.date === this.props.date);
		let dailyTotal;
		if(day){
			dailyTotal = _.sum(_.map(day.consumed, f => parseInt(f.calories, 10)));
		} else {
			dailyTotal = 0;
		}

		const goal = db.calorieSettingsDB.calorieSettings.caloricGoal;
		const remaining = goal - dailyTotal;
		const weightStasisGoal = db.calorieSettingsDB.calorieSettings.weightStasisGoal;
		const caloriesInPound = 3500;
		const poundsLost = Math.round(((weightStasisGoal - dailyTotal) / caloriesInPound) * 100) / 100;
		return (
			<CalorieStatisticsWrapper>
				{this.renderSmileyFace(poundsLost)}
				<div>
					{this.renderDailyTotal(dailyTotal)}
					<span>|</span>
					{this.renderGoal(goal)}
					<span>|</span>
					{this.renderRemaining(remaining)}
					<span>|</span>
					{this.renderPoundsLost(poundsLost)}
				</div>
				<Button className={`pt-minimal ${settingsBtn}`}
						iconName="settings"
						onClick={this.gotoSettings} />
			</CalorieStatisticsWrapper>
		);
	}

	private renderDailyTotal = (dailyTotal: number) => {
		return (
			<p className="pt-running-text">
				<span className="total-calories-label">Total Calories: </span>
				<span>{dailyTotal}</span>
			</p>
		);
	};

	private renderGoal = (goal: number) => {
		return (
			<p className="pt-running-text">
				<span className="goal-label">Goal: </span>
				<span>{goal}</span>
			</p>
		);
	};

	private renderSmileyFace = (poundsLost: number) => {
		if(poundsLost > (2 / 7)) {
			return (
				<img className="smiley" src="icons/happy.png" width="128" />
			);
		} else if(poundsLost > 0) {
			return (
				<img className="smiley" src="icons/dread.png" width="128"  />
			);
		} else {
			return (
				<img className="smiley" src="icons/crying.png" width="128"/>
			);
		}
	};

	private renderRemaining = (remaining: number) => {
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
	};

	private renderPoundsLost = (poundsLost: number) => {
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
	};

	private gotoSettings = () => {
		history.push('/calories/settings');
	}
}