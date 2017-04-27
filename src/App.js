import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import React, { Component } from 'react';
import './App.css';
import SiteNavbar from "./components/SiteNavbar";
import {
  Router,
	Route
} from 'react-router-dom'
import HabitsPage from './components/HabitsPage';
import CaloriesPage from './components/CaloriesPage';
import DailiesPage from './components/DailiesPage';
import NotesPage from './components/NotesPage';
import TodoPage from './components/TodoPage';
import SchedulePage from './components/SchedulePage';
import {state, history, auth} from './util';
import {observer} from 'mobx-react';

function checkAuth(Component){
  return () => {
		if(state.loggedIn){
			return <Component/>
		} else {
		  history.replace('/login');
		  return null;
    }
  };
}

function login() {
	if(!state.loggedIn){
		auth.login();
	} else {
		history.replace('/');
	}
	return null;
}

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <div className="App ">
          <SiteNavbar onNavigate={this.onNavigate} />
          <Route exact path="/" component={checkAuth(HabitsPage)} />
          <Route exact path="/habits" component={checkAuth(HabitsPage)} />
          <Route path="/calories" component={checkAuth(CaloriesPage)} />
          <Route path="/dailies" component={checkAuth(DailiesPage)} />
          <Route path="/todo" component={checkAuth(TodoPage)} />
          <Route path="/notes" component={checkAuth(NotesPage)} />
          <Route path="/schedule" component={checkAuth(SchedulePage)} />
          <Route path="/login" component={login} />
        </div>
      </Router>
		);
  }

  onNavigate = (page) => {
    history.push('/' + page);
  };
}

export default observer(App);
