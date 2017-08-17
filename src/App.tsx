import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import * as React from 'react';
import './App.css';
import SiteNavbar from "./components/SiteNavbar";
import {
	Router,
	Route
} from 'react-router-dom'
import CaloriesPage from './components/calories/CaloriesPage';
import TodoPage from './components/todo/TodoPage';
import {history} from './util';
import {observer} from 'mobx-react';
import {AppState} from "./state";

interface Props {
	appState: AppState
};

@observer
class App extends React.Component<Props, {}> {

	render() {
		return (
			<Router history={history}>
				<div className="App pt-dark">
					<SiteNavbar path={history.location.pathname} onNavigate={this.onNavigate} />
					<div className="app-content">
						<Route exact path="/" component={TodoPage} />
						<Route path="/calories" component={() => <CaloriesPage caloriesState={this.props.appState.calories} />} />
					</div>
				</div>
			</Router>
		);
	}

	onNavigate = (page) => {
		history.push('/' + page);
		this.forceUpdate();
	};
}

export default observer(App);
