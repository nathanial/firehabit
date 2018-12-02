import * as React from 'react';
import SiteNavbar from "./components/SiteNavbar";
import CaloriesPage from './components/calories/CaloriesPage';
import TodoColumnPage from './components/todo/TodoColumnPage';
import {history,db} from './util';
import {AppState} from "./state";
import TodoTopbar from './components/todo/TodoTopbar';
import {Spinner} from '@blueprintjs/core';
import cxs from 'cxs';

interface Props {
    appState: AppState
};

const spinnerContainerClass = cxs({
    width: '100%',
    height: '100%',
    position: 'fixed',
    zIndex: 99999,
    background: 'rgba(10,10,10,0.9)'
});

export default class App extends React.PureComponent<Props> {

    render() {
        return (
            <div className="App pt-dark">
                <SiteNavbar user={db.user} path={history.location.pathname} onNavigate={this.onNavigate}>
                    {this.renderCustomTopbar()}
                </SiteNavbar>
                <div className="app-content">
                    {this.renderPage()}
                </div>
                {this.renderSpinner()}
            </div>
        );
    }

    private renderSpinner = () => {
        if(this.props.appState.loadingData){
            return (
                <div className={`spinner-container ${spinnerContainerClass}`}>
                    <Spinner />
                    <p>Syncing with Database...</p>
                </div>
            )
        }
    }

    private renderPage(){
        const appState = this.props.appState;
        if(history.location.pathname === '/') {
            const {todoColumns, showDevTools, todoPageState} = appState;
            return 	(
                <TodoColumnPage todoColumns={todoColumns} showDevTools={showDevTools} todoPageState={todoPageState} />
            );
        } else if(history.location.pathname === '/calories') {
            return (
                <CaloriesPage caloriesState={appState.calories} />
            );
        } else {
            return (
                <h1>Unknown Route</h1>
            )
        }
    }

    private renderCustomTopbar() {
		if(history.location.pathname === '/') {
            const {todoColumns, showDevTools} = this.props.appState;
			return <TodoTopbar todoColumns={todoColumns} showDevTools={showDevTools} />
		}
	}

    private onNavigate = (page) => {
        history.push('/' + page);
        this.forceUpdate();
    };

}

