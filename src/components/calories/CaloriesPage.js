// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import moment from 'moment';

const CaloriesPageWrapper = styled.div`
`;

export default observer(class CaloriesPage extends React.Component {

	state = {
		date: moment().format('MM/DD/YY')
	};

	render() {
		return (
			<CaloriesPageWrapper>
				<CaloriesForm date={this.state.date} onChangeDate={(newDate) => this.setState({date: newDate})} />
				<CalorieStatistics date={this.state.date} />
			</CaloriesPageWrapper>
		);
	}
});