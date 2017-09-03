import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import * as React from 'react';
import './App.css';
import SiteNavbar from "./components/SiteNavbar";
import CaloriesPage from './components/calories/CaloriesPage';
import TodoPage from './components/todo/TodoPage';
import {history,db} from './util';
import {AppState} from "./state";

interface Props {
    appState: AppState
};



export default class App extends React.PureComponent<Props> {

    render() {
        return (
            <div className="App pt-dark">
                <SiteNavbar user={db.user} path={history.location.pathname} onNavigate={this.onNavigate} />
                <div className="app-content">
                    {this.renderPage()}
                </div>
            </div>
        );
    }

    private renderPage(){
        if(history.location.pathname === '/') {
            const {todoColumns, showDevTools} = this.props.appState;
            return 	(
                <TodoPage todoColumns={todoColumns} showDevTools={showDevTools} />
            );
        } else {
            return (
                <CaloriesPage caloriesState={this.props.appState.calories} />
            );
        }
    }

    private onNavigate = (page) => {
        history.push('/' + page);
        this.forceUpdate();
    };

}

