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
                            <img src="icons/Board.png" onClick={login} />
                            <span>Track Calories</span>
                        </div>
                        <div className="example">
                            <img src="icons/Goal.png" onClick={login} />
                            <span>Manage Todos</span>
                        </div>
                        <div className="example">
                            <img src="icons/open-textbook.png" onClick={login} />
                            <span>Keep Notes</span>
                        </div>
                        <div className="example">
                            <img src="icons/Calendar.png" onClick={login} />
                            <span>Schedule Events</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}