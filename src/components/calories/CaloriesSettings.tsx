import * as React from 'react';
import {Button} from '@blueprintjs/core';
import {db} from '../../util';
import styled from 'styled-components';

const CaloriesSettingsWrapper = styled.div`
	position: absolute;
	width: 500px;
	left: 50%;
	margin-left: -250px;
	margin-top: 30px;
	& > h1 {
		margin-bottom: 30px;
	}
	
	.settings-container {
		position: relative;
		text-align: left;
	}
	
	.back-btn {
	}
`;

const SettingsForm = styled.div`
	margin-top: 20px;
`;

export default class CaloriesSettings extends React.Component<{},{}> {
	render(){
		const csdb = db.calorieSettingsDB;
		const {caloricGoal, weightStasisGoal} = csdb.calorieSettings;
		return (
			<CaloriesSettingsWrapper>
				<h1>Calories Settings</h1>
				<div className="pt-card pt-elevation-1 settings-container">
					<Button onClick={this.onGoBack} className="back-btn">Back</Button>
					<SettingsForm>
						<label className="pt-label">
							Caloric Goal
							<input className="pt-input"
									 type="number"
									 ref="caloricGoal"
									 value={caloricGoal}
									 onChange={(event) => csdb.updateCalorieSettings({caloricGoal: this.refs.caloricGoal['value']})}/>
						</label>
						<label className="pt-label">
							Weight Stasis Goal
							<input className="pt-input"
									 type="number"
									 ref="weightStasisGoal"
									 value={weightStasisGoal}
									 onChange={(event) => csdb.updateCalorieSettings({weightStasisGoal: this.refs.weightStasisGoal['value']})}/>
						</label>
					</SettingsForm>
				</div>
			</CaloriesSettingsWrapper>
		);
	}

	onGoBack = () => {
	}
}