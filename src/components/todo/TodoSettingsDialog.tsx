import * as _ from 'lodash';
import * as React from 'react';
import { ChromePicker } from 'react-color';
import cxs from 'cxs';
import {InputGroup} from '@blueprintjs/core';

type Props = {
    todo: Todo;
    onChange(settings: TodoSettings);
}


export default class TodoSettingsDialog extends React.PureComponent<Props, {}> {
    render(){
        const settings =  this.props.todo.settings || {
            recurring: false,
            color: '#eee'
        }
        return (
            <div className="todo-settings-dialog">
                <div className="form-group">
                    <label className="pt-label">Name</label>
                    <InputGroup
                        onChange={this.onNameChanged}
                        value={this.props.todo.name}
                    />
                </div>
                <div className="form-group">
                    <label className="pt-label ">
                        Color
                    </label>
                    <ChromePicker color={settings.color} onChange={this.onChangeColor}/>
                </div>
            </div>
        );
    }

    private onNameChanged = (event) => {
        console.log("Name Changed", event.target.value);
    }

    private onChangeColor = (newValue) => {
        this.props.onChange(_.extend({}, this.props.todo.settings, {
            color: newValue.hex
        }));
    }
}
