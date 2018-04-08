import * as React from 'react';
import {Icon, Button} from '@blueprintjs/core';
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd';
import * as _ from 'lodash';
import InlineText from '../InlineText';
import DialogService from '../../services/DialogService';

type NoteListProps = {
    notes: Note[];
}

type NoteListItemProps = {
    note: Note;
    onSelect(note: Note);
    onDelete(note: Note);
}

function reorder(list: Note[], startIndex: number, endIndex: number) {
    const newList = _.cloneDeep(list);
    const [removed] = newList.splice(startIndex, 1);
    newList.splice(endIndex, 0, removed);
    _.each(newList, (item, index) => {
        item.index = index;
    });
    list.reset(newList);
};

class NoteListItem extends React.PureComponent<NoteListItemProps, {}> {
    render(){
        const extraClasses = this.props.note.editing ? "editing" : "";
        return (
            <div className={`pt-card pt-elevation-2 note-list-item ${extraClasses}`} onClick={() => this.props.onSelect(this.props.note)}>
                <Icon iconName="drag-handle-vertical" className="drag-handle" />
                <InlineText disabled={!this.props.note.editing} value={this.props.note.title} onChange={this.onTitleChanged} />
                <Button className="delete-btn pt-intent-danger pt-minimal" onClick={this.onDelete} iconName="trash"></Button>
            </div>
        );
    }

    private onTitleChanged = (newValue) => {
        this.props.note.set({title: newValue});
    }

    private onDelete = async () => {
        const result = await DialogService.showDangerDialog("Are you sure you want to delete this Note?", "Delete", "Cancel");
        if(result){
            this.props.onDelete(this.props.note);
        }
    }
}

export class NoteList extends React.PureComponent<NoteListProps, {}> {
    render(){
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="notes-list">
                    {(provided: any, snapshot) => {
                        return (
                            <div className="note-list" ref={provided.innerRef} {...provided.droppableProps} >
                                {this.props.notes.map((note, index) => {
                                    return <Draggable key={note.id} draggableId={note.id} index={index}>
                                        {(provided, snapshot) => {
                                            return (
                                                <div className="note-draggable">
                                                    <div ref={provided.innerRef}
                                                        {...provided.draggableProps as any}
                                                        {...provided.dragHandleProps}>
                                                        <NoteListItem key={note.id} note={note} onSelect={this.onSelect} onDelete={this.onDelete} />
                                                    </div>
                                                    {provided.placeholder}
                                                </div>
                                            )
                                        }}
                                    </Draggable>
                                })}
                            </div>
                        );
                    }}
                </Droppable>
            </DragDropContext>
        );
    }

    private onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        const note = _.find(this.props.notes, note => note.id === result.draggableId);
        reorder(this.props.notes, result.source.index, result.destination.index);
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
