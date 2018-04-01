import * as React from 'react';
import SiteNavbar from './SiteNavbar';

export class LandingPage extends React.PureComponent<{},{}> {
    render(){
        return (
            <div className="landing-page pt-dark">
                <SiteNavbar />
                <div className="landing-page-content">
                    <h1>Welcome to Fire Habit</h1>
                    <div className="examples">
                        <div className="example">
                            <img src="images/Calories.PNG" />
                            <span>Track Calories</span>
                        </div>
                        <div className="example">
                            <img src="images/Todos.PNG" />
                            <span>Manage Todos</span>
                        </div>
                        <div className="example">
                            <img src="images/Notes.PNG" />
                            <span>Keep Notes</span>
                        </div>
                        <div className="example">
                            <img src="images/Schedule.PNG" />
                            <span>Schedule Events</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}