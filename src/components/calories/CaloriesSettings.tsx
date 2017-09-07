import * as React from 'react';
import {Button} from '@blueprintjs/core';
import {history, db} from '../../util';
import styled from 'styled-components';
import {CaloriesState} from '../../state';

const CaloriesSettingsWrapper = styled.div`
    position: absolute;
    width: 500px;
    left: 50%;
    margin-left: -250px;
    margin-top: 30px;
    & > h1 {
        margin-bottom: 30px;
    }
    
    .settings-container {
        position: relative;
        text-align: left;
    }
    
    .back-btn {
    }
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
            <CaloriesSettingsWrapper>
                <h1>Calories Settings</h1>
                <div className="pt-card pt-elevation-1 settings-container">
                    <Button onClick={this.onGoBack} className="back-btn">Back</Button>
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
            </CaloriesSettingsWrapper>
        );
    }

    onGoBack = () => {
        history.push('/calories');
    }

    onCaloricGoalChanged = () => {
        console.log("Caloric Goal Changed");
    }

    onWeightStasisGoalChanged = () => {
        console.log("Weight Stasis Goal Changed");
    }
}

