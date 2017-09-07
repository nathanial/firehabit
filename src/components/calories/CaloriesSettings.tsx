import * as React from 'react';
import {Button} from '@blueprintjs/core';
import {history, db} from '../../util';
import styled from 'styled-components';
import {CaloriesState} from '../../state';

const CaloriesSettingsWrapper = styled.div`
`;

const SettingsForm = styled.div`
    margin-top: 20px;
`;

type Props = {
    caloriesState: CaloriesState;
};

export default class CaloriesSettings extends React.Component<Props,{}> {
    render(){
        const {caloriesState} = this.props;
        const {caloricGoal, weightStasisGoal} = caloriesState['calorie-settings'];
        return (
            <div>
                <SettingsForm>
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
                </SettingsForm>
            </div>
        );
    }

    onCaloricGoalChanged = () => {
        console.log("Caloric Goal Changed");
    }

    onWeightStasisGoalChanged = () => {
        console.log("Weight Stasis Goal Changed");
    }
}

