import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import * as React from 'react';
import './App.css';
import SiteNavbar from "./components/SiteNavbar";
import HabitsPage from './components/habits/HabitsPage';
import CaloriesPage from './components/calories/CaloriesPage';
import TodoPage from './components/todo/TodoPage';
import {AppState} from "./state";

interface Props {
	appState: AppState
};

export default class App extends React.Component<Props, {}> {

	render() {
		const appState = this.props.appState;
		return (
			<div className="App pt-dark">
				<SiteNavbar onNavigate={this.onNavigate} />
				<div className="app-content">
					{this.renderContent()}
				</div>
			</div>
		);
	}

	renderContent = () => {
		return (
			<TodoPage todoColumns={this.props.appState.todoColumns}/>
		);
	};

	onNavigate = (page) => {
	};
}

