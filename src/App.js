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

import {history} from './util';

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <div className="App">
          <SiteNavbar onNavigate={this.onNavigate}/>
          <Route exact path="/" component={HabitsPage} />
          <Route exact path="/habits" component={HabitsPage} />
          <Route path="/calories" component={CaloriesPage} />
          <Route path="/dailies" component={DailiesPage} />
          <Route path="/todo" component={TodoPage} />
          <Route path="/notes" component={NotesPage} />
          <Route path="/schedule" component={SchedulePage} />
        </div>
      </Router>
		);
  }

  onNavigate = (page) => {
    history.push('/' + page);
  };
}

export default App;
