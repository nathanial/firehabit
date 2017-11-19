import * as React from 'react';
import {Button, Intent} from '@blueprintjs/core';
import { generatePushID } from '../../db/util';

type Props = {
    notes: Note[];
}

export default class NotesTopbar extends React.PureComponent<Props, {}> {
    render(){
        return (
            <div className="notes-topbar">
                <Button iconName="plus" intent={Intent.SUCCESS} onClick={this.onAddNote}>Add Note</Button>
            </div>
        )
    }

    private onAddNote = () => {
        this.props.notes.push({id: generatePushID(), title: 'New Note', text: ''});
    };
}
