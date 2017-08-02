import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import * as React from 'react';
import './App.css';
import SiteNavbar from "./components/SiteNavbar";
import {
	Router,
	Route
} from 'react-router-dom'
import HabitsPage from './components/habits/HabitsPage';
import CaloriesPage from './components/calories/CaloriesPage';
import TodoPage from './components/todo/TodoPage';
import TodayPage from './components/today/TodayPage';
import {history} from './util';
import {observer} from 'mobx-react';
import {AppState} from "./state";

interface Props {
	appState: AppState
};

@observer
class App extends React.Component<Props, {}> {

	render() {
		const appState = this.props.appState;
		return (
			<Router history={history}>
				<div className="App pt-dark">
					<SiteNavbar onNavigate={this.onNavigate} />
					<div className="app-content">
						<Route exact path="/" component={HabitsPage}/>
						<Route exact path="/habits" component={HabitsPage} />
						<Route path="/calories" component={CaloriesPage} />
						<Route path="/todo" component={() => <TodoPage todoColumns={appState.todoColumns}/>} />
					</div>
				</div>
			</Router>
		);
	}

	onNavigate = (page) => {
		history.push('/' + page);
	};
}

export default observer(App);
