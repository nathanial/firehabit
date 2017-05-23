// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import ExerciseForm from "./ExerciseForm";
import moment from 'moment';

const ExercisePageWrapper = styled.div`
`;

export default observer(class ExercisePage extends React.Component {

	state = {
		date: moment().format('MM/DD/YY')
	};

	render() {
		return (
			<ExercisePageWrapper>
				<h1>Testing!</h1>
			</ExercisePageWrapper>
		);
	}
});