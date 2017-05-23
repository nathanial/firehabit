// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import DayPicker from '../DayPicker';
import * as _ from 'lodash';
import {appState} from '../../util';
import {observer} from 'mobx-react';
import DialogService from "../../services/DialogService";

const ExerciseFormWrapper = styled.div`
	display: inline-block;
	position: relative;
	margin: 50px;
	& > h2 {
		text-align: left;
		margin-bottom: 20px;
		margin-top: 10px;
	}
	min-width: 540px;
`;

export default observer(class ExerciseForm extends React.Component {

	static propTypes = {
		date: React.PropTypes.string.isRequired,
		onChangeDate: React.PropTypes.func.isRequired
	}

	state = {
		value: ''
	};

	render() {
		return (
			<ExerciseFormWrapper className="pt-card pt-elevation-1">
				<h2>Exercise</h2>

			</ExerciseFormWrapper>
		);
	}

	onChange = () => {
		const value = this.refs.search.value;
		this.setState({ value });
	};

	content = () =>{
		if(!_.isEmpty(this.state.value)){
			return (
				<div>


				</div>
			);
		}
		return (
			<p>Testing</p>
		);
	};

	onAddExercise = async (food) => {

	};

	onRemoveExerciseDefinition = async (food) => {

	};

	onEditExerciseDefinition = async (food) => {

	};

})
