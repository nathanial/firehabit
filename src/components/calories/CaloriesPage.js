// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";

const CaloriesPageWrapper = styled.div`
	margin-left: 20px;
`;

export default observer(class CaloriesPage extends React.Component {
	render() {
		return (
			<CaloriesPageWrapper>
				<CaloriesForm />
				<CalorieStatistics />
			</CaloriesPageWrapper>
		);
	}
});