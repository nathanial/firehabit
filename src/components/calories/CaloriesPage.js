// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import moment from 'moment';
import {Route} from "react-router-dom";

const CaloriesPageWrapper = styled.div`
	margin-left: 20px;
`;

@observer
class CaloriesDataPage extends React.Component {
	state = {
		date: moment().format('MM/DD/YY')
	};

	render(){
		return (
			<CaloriesPageWrapper>
				<CaloriesForm date={this.state.date} onChangeDate={(newDate) => this.setState({date: newDate})} />
				<CalorieStatistics date={this.state.date} />
			</CaloriesPageWrapper>
		);
	}
}

@observer
class CaloriesSettings extends React.Component {
	render(){
		return (
			<div>BAM</div>
		);
	}
}

@observer
export default class CaloriesPage extends React.Component {
	render() {
		return (
			<div>
				<Route exact path="/calories" render={() => <CaloriesDataPage />} />
				<Route exact path="/calories/settings" component={CaloriesSettings} />
			</div>
		);
	}
}