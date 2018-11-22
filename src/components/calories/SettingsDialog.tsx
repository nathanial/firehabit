import * as React from 'react';
import {CaloriesState} from "../../state";
import {Button} from '@blueprintjs/core';
import * as _ from 'lodash';

type Props = {
    visible: boolean;
    caloriesState: CaloriesState;
    onClose();
}

export class SettingsDialog extends React.PureComponent<Props,{}> {
    render(){
        let classes = "settings-dialog";
        if(this.props.visible){
            classes += " visible";
        }
        const goal = _.get(this.props, "caloriesState['calorie-settings'].weightStasisGoal", 0);
        return (
            <div className={classes}>
                <h3>Settings</h3>
                <label>Weight Stasis Goal</label>
                <input type="text" className="pt-input" value={goal} onChange={this.onGoalChanged} />
                <Button className="pt-minimal close-btn" icon="cross" onClick={this.onClose} />
            </div>
        );
    }

    onClose = () => {
        this.props.onClose();
    }

    onGoalChanged = (event) => {
        const newValue = event.target.value;
        this.props.caloriesState['calorie-settings'].set({weightStasisGoal: event.target.value});
    }
}
