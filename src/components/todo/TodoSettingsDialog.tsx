import * as _ from 'lodash';
import * as React from 'react';
import { ChromePicker } from 'react-color';
import cxs from 'cxs';

type Props = {
    settings: TodoSettings;
    onChange(settings: TodoSettings);
}


export default class TodoSettingsDialog extends React.PureComponent<Props, {}> {
    render(){
        return (
            <div className="todo-settings-dialog">
                <label className="pt-label pt-inline">
                    Color
                    <ChromePicker color={this.props.settings.color} onChange={this.onChangeColor}/>
                </label>
            </div>
        );
    }

    onChangeColor = (newValue) => {
        this.props.onChange(_.extend({}, this.props.settings, {
            color: newValue.hex
        }));
    }
}