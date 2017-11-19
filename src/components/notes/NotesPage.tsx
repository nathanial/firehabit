import * as React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import {Button} from '@blueprintjs/core';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

type Props = {
    notes: Note[];
}

type NoteListProps = {
    notes: Note[];
}

type NoteListItemProps = {
    note: Note;
}

type NoteToolbarProps = {

}

class NoteListItem extends React.PureComponent<NoteListItemProps, {}> {
    render(){
        return (
            <div className="note-list-item">
                <h1>{this.props.note.title}</h1>
            </div>
        )
    }
}

class NoteList extends React.PureComponent<NoteListProps, {}> {
    render(){
        return (
            <div className="note-list">
                {this.props.notes.map(note => {
                    return <NoteListItem key={note.id} note={note} />
                })}
            </div>
        );
    }
}


export default class NotesPage extends React.PureComponent<Props, {}> {
    render(){
        return (
            <div className="notes-page">
                <NoteList notes={this.props.notes} />
                {/* <Editor /> */}
            </div>
        );
    }
}
