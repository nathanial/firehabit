// Line Limit 100
import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import * as moment from 'moment';
import {Route} from "react-router-dom";
import CaloriesSettings from "./CaloriesSettings";

interface DataPageState {
	date: string;
}

class CaloriesDataPage extends React.Component<{},DataPageState> {
	state = {
		date: moment().format('MM/DD/YY')
	};

	render(){
		return (
			<div style={{marginLeft: 20}}>
				<CaloriesForm date={this.state.date} onChangeDate={(newDate) => this.setState({date: newDate})} />
				<CalorieStatistics date={this.state.date} />
			</div>
		);
	}
}

export default class CaloriesPage extends React.Component<{},{}> {
	render() {
		return (
			<div>
				<Route exact path="/calories" render={() => <CaloriesDataPage />} />
				<Route exact path="/calories/settings" component={CaloriesSettings} />
			</div>
		);
	}
}