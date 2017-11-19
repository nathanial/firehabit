import * as React from 'react';
import * as _ from 'lodash';
import {db, history} from '../../util';
import {Button} from '@blueprintjs/core';
import DialogService from "../../services/DialogService";
import CaloriesSettings from "./CaloriesSettings";
import cxs from 'cxs';
import {CaloriesState} from '../../state';

const calorieStatisticsClass = cxs({
	position: 'relative',
	padding: '50px',
	textAlign: 'center',
	margin: '20px',
	width: 250,
	minWidth: 250,
	alignSelf: 'flex-start'
});

const settingsBtn = cxs({
	position: 'absolute',
	right: '7px',
	top: '7px'
});

const smileyClass = cxs({
	textAlign: 'center'
})

interface CalorieStatisticsProps {
	date: string;
	days: Day[];
	caloriesState: CaloriesState;
	style?: Object;
}

export default class CalorieStatistics extends React.Component<CalorieStatisticsProps, {}> {
	render() {
		const days = this.props.days;
		const day = _.find(days, day => day.date === this.props.date);
		let dailyTotal;
		if(day){
			dailyTotal = _.sum(_.map(day.consumed, f => parseInt(f.calories, 10)));
		} else {
			dailyTotal = 0;
		}

		const goal = this.props.caloriesState['calorie-settings'].caloricGoal;
		const remaining = goal - dailyTotal;
		const weightStasisGoal = this.props.caloriesState['calorie-settings'].weightStasisGoal;
		const caloriesInPound = 3500;
		const poundsLost = Math.round(((weightStasisGoal - dailyTotal) / caloriesInPound) * 100) / 100;
		return (
			<div style={this.props.style || {}} className={`pt-card pt-elevation-2 ${calorieStatisticsClass}` }>
				{this.renderSmileyFace(poundsLost)}
				<div style={{marginTop:30}} />
				{this.renderDailyTotal(dailyTotal)}
				{this.renderGoal(goal)}
				{this.renderRemaining(remaining)}
				{this.renderPoundsLost(poundsLost)}
				<Button className={`pt-minimal ${settingsBtn}`}
						iconName="settings"
						onClick={this.gotoSettings} />
			</div>
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
				<img className={smileyClass} src="icons/happy.png" width="128" />
			);
		} else if(poundsLost > 0) {
			return (
				<img className={smileyClass} src="icons/dread.png" width="128"  />
			);
		} else {
			return (
				<img className={smileyClass} src="icons/crying.png" width="128"/>
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
				<span className="goal-label">Pounds Lost: </span>
				<span>{poundsLost}</span>
			</p>
		);
	};

	private gotoSettings = async () => {
		const settings = this.props.caloriesState['calorie-settings'];
		let {caloricGoal, weightStasisGoal} = settings;
		function onChange(newCaloricGoal, newWeightStasisGoal) {
			caloricGoal = newCaloricGoal;
			weightStasisGoal = newWeightStasisGoal;
		}
		const result = await DialogService.showDialog("Calorie Settings", "Save", "Cancel", 
			<CaloriesSettings caloricGoal={caloricGoal} weightStasisGoal={weightStasisGoal} onChange={onChange}/>
		);
		if(result){
			settings.set({caloricGoal, weightStasisGoal});
		}
	}
}