import * as React from 'react';
import {Button} from '@blueprintjs/core';
import {history, db} from '../../util';
import {CaloriesState} from '../../state';


type Props = {
    caloricGoal: number;
    weightStasisGoal: number;
    onChange(caloricGoal: number, wieghtStasisGoal: number);
};

type State = {
    caloricGoal: number;
    weightStasisGoal: number;
}

export default class CaloriesSettings extends React.Component<Props,State> {

    state = {
        caloricGoal: this.props.caloricGoal,
        weightStasisGoal: this.props.weightStasisGoal
    }

    render(){
        const {caloricGoal, weightStasisGoal} = this.state;
        return (
            <div>
                <div style={{marginTop:20}}>
                    <label className="pt-label">
                        Caloric Goal
                        <input className="pt-input"
                                type="number"
                                ref="caloricGoal"
                                value={caloricGoal}
                                onChange={this.onCaloricGoalChanged} />
                    </label>
                    <label className="pt-label">
                        Weight Stasis Goal
                        <input className="pt-input"
                                    type="number"
                                    ref="weightStasisGoal"
                                    value={weightStasisGoal}
                                    onChange={this.onWeightStasisGoalChanged}/>
                    </label>
                </div>
            </div>
        );
    }

    onCaloricGoalChanged = (event) => {
        this.setState({
            caloricGoal: event.target.value
        });
        this.props.onChange(event.target.value, this.state.weightStasisGoal);
    }

    onWeightStasisGoalChanged = (event) => {
        this.setState({
            weightStasisGoal: event.target.value
        });
        this.props.onChange(this.state.caloricGoal, event.target.value);
    }
}

