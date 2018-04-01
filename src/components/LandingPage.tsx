import * as React from 'react';
import SiteNavbar from './SiteNavbar';
import {db} from '../util';
import {loginToFirebase} from '../db/DB';

export class LandingPage extends React.PureComponent<{},{}> {
    render(){
        const login = async () => {
			await loginToFirebase(db);
		};
        return (
            <div className="landing-page pt-dark">
                <SiteNavbar />
                <div className="landing-page-content">
                    <img className="logo" src="icons/FireHabitLogo.png" />
                    <h1>Welcome to Fire Habit</h1>
                    <div className="examples">
                        <div className="example">
                            <img src="images/Calories.PNG" onClick={login} />
                            <span>Track Calories</span>
                        </div>
                        <div className="example">
                            <img src="images/Todos.PNG" onClick={login} />
                            <span>Manage Todos</span>
                        </div>
                        <div className="example">
                            <img src="images/Notes.PNG" onClick={login} />
                            <span>Keep Notes</span>
                        </div>
                        <div className="example">
                            <img src="images/Schedule.PNG" onClick={login} />
                            <span>Schedule Events</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}