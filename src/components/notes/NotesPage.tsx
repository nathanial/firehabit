import * as _ from 'lodash';
import * as React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import {Button} from '@blueprintjs/core';
import {EditorState, ContentState, convertToRaw, convertFromRaw} from 'draft-js';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import InlineText from '../InlineText';

type Props = {
    notes: Note[];
}

type NoteListProps = {
    notes: Note[];
}

type NoteListItemProps = {
    note: Note;
    onSelect(note: Note);
    onDelete(note: Note);
}

type NoteToolbarProps = {

}

class NoteListItem extends React.PureComponent<NoteListItemProps, {}> {
    render(){
        const extraClasses = this.props.note.editing ? "editing" : "";
        return (
            <div className={`pt-card pt-elevation-2 note-list-item ${extraClasses}`} onClick={() => this.props.onSelect(this.props.note)}>
                <InlineText disabled={!this.props.note.editing} value={this.props.note.title} onChange={this.onTitleChanged} />
                <Button className="delete-btn pt-intent-danger pt-minimal" onClick={this.onDelete} iconName="trash"></Button>
            </div>
        );
    }

    private onTitleChanged = (newValue) => {
        this.props.note.set({title: newValue});
    }

    private onDelete = () => {
        this.props.onDelete(this.props.note);
    }
}

class NoteList extends React.PureComponent<NoteListProps, {}> {
    render(){
        return (
            <div className="note-list">
                {this.props.notes.map(note => {
                    return <NoteListItem key={note.id} note={note} onSelect={this.onSelect} onDelete={this.onDelete} />
                })}
            </div>
        );
    }

    onSelect = (selected: Note) => {
        for(let note of this.props.notes){
            if(note !== selected){
                note.set({editing: false});
            }
        }
        selected.set({editing: true});
    }

    onDelete = (note: Note) => {
        const index = _.findIndex(this.props.notes, n => n.id === note.id);
        if(index !== -1){
            this.props.notes.splice(index, 1);
        }
    }
}

type State = {
    editorState: any
}

export default class NotesPage extends React.Component<Props, State> {

    constructor(props){
        super(props);
        const editing = _.find(this.props.notes, note => note.editing);
        if(editing && editing.text){
            this.state = {
                editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(editing.text)))
            };
        } else {
            this.state = {
                editorState: EditorState.createEmpty()
            };
        }
    }

    render(){
        return (
            <div className="notes-page">
                <NoteList notes={this.props.notes} />
                {this.renderEditor()}
            </div>
        );
    }

    renderEditor() {
        if(_.find(this.props.notes, note => note.editing)){
            return (
                <div className="editor-panel">
                    <Editor editorState={this.state.editorState} onEditorStateChange={this.onEditorStateChange} />
                </div>
            );
        }
    }

    componentWillReceiveProps(nextProps: Props){
        const currentEditing = _.find(this.props.notes, note => note.editing);
        const nextEditing = _.find(nextProps.notes, note => note.editing);
        if(nextEditing){
            if(!currentEditing || currentEditing.id !== nextEditing.id){
                if(nextEditing.text){
                    this.setState({
                        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(nextEditing.text)))
                    });
                } else {
                    this.setState({
                        editorState: EditorState.createEmpty()
                    });
                }
            }
        } else {
            this.setState({
                editorState: EditorState.createEmpty()
            });
        }
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState
        });
        const currentEditing = _.find(this.props.notes, note => note.editing);
        if(currentEditing){
            currentEditing.set({text: JSON.stringify(convertToRaw(editorState.getCurrentContent()))});
        }
    }
}
