import * as React from 'react';
import CaloriesForm from "./CaloriesForm";
import CalorieStatistics from "./CaloriesStatistics";
import CaloriesSettings from "./CaloriesSettings";
import {CaloriesState} from "../../state";
import {history} from '../../util';

type CaloriesDataPageProps = {
    caloriesState: CaloriesState;
}

class CaloriesDataPage extends React.PureComponent<CaloriesDataPageProps, {}> {
    render(){
        const {selectedDate} = this.props.caloriesState;
        return (
            <div style={{marginLeft: 20}}>
                <CalorieStatistics date={selectedDate} />
                <CaloriesForm date={selectedDate} onChangeDate={this.onChangeDate} />
            </div>
        );
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}

type CaloriesPageProps = {
    caloriesState: CaloriesState;
}

export default class CaloriesPage extends React.Component<CaloriesPageProps,{}> {
    render() {
        return (
            <div style={{width: 800, minWidth: 800, maxWidth: 800, marginLeft: '-400px', left: '50%', position:'absolute'}}>
                {this.renderPage()}
            </div>
        );
    }

    private renderPage(){
        const caloriesState = this.props.caloriesState;
        if(history.location.pathname === '/calories/settings') {
            return <CaloriesSettings />
        } else {
            return <CaloriesDataPage caloriesState={caloriesState} />;
        }
    }
}