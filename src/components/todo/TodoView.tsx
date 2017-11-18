import * as $ from 'jquery';
import * as  _ from 'lodash';
import * as React from 'react';
import * as Color from 'color';
import {Spinner, Button} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";
import {SubtaskList} from "./SubtaskList";
import InlineText from '../InlineText';
import {AttachmentList} from './AttachmentList';
import {dndService} from "../dnd/DragAndDropLayer";
import cxs from 'cxs';
import * as ReactDOM from "react-dom";
import * as cloudinary from 'cloudinary-core';
import TodoSettingsDialog from './TodoSettingsDialog';

const cloudName = 'dsv1fug8x';
const unsignedUploadPreset = 'fnddxf5w';
const cl = new cloudinary.Cloudinary({cloud_name: cloudName, secure: true});



const todoContentWrapperClass = cxs({
    position: 'relative',
    display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
    '.pt-editable-text': {
        'max-width': '180px'
    },
    flex: '2 0 0'
});

const todoItemClass = cxs({
    position: 'relative',
    padding: '10px',
    margin: '10px',
    color: 'black',
    'text-align': 'left',
    cursor: 'pointer',
    width: '240px'
});

const todoWrapperClass = cxs({
    position: 'relative',
    padding: '10px 0',
    display: 'flex',
    'flex-direction': 'row'
});

const spinnerContainerClass = cxs({
    background: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
});

const spinnerClass = cxs({
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginTop: '-26px',
    marginLeft: '-28px'
});

interface Props {
    todo: Todo;
    style?: Object;
    confirmDeletion: boolean;
    isDragging?: boolean;
    onDelete(todo: Todo);
}

interface State {
    dragging: boolean;
    progress: number;
    uploading: boolean;
}

type PreviewProps = {
    todo: Todo;
}

function getColorStyle(todo: Todo){
    const backgroundColor = _.get(todo, 'settings.color', '#eee');
    let foregroundColor;
    if(Color(backgroundColor).light()){
        foregroundColor = 'black';
    } else {
        foregroundColor = 'white';
    }
    const colorStyle = {background: backgroundColor, color: foregroundColor};
    return colorStyle;
}

class TodoDragPreview extends React.PureComponent<PreviewProps> {
    render(){
        const colorStyle = getColorStyle(this.props.todo);
        return (
            <div className={`todo-view pt-card pt-elevation-2 ${todoItemClass}`}
                 style={{padding:0, background: '#eee', margin: 0}}>
                <div>
                    <div className={'todo-wrapper ' + todoWrapperClass} style={colorStyle} >
                        <div className="drag-handle">
                            <div className="inner-icon pt-icon-drag-handle-vertical"/>
                        </div>
                        <div className={todoContentWrapperClass}>
                            <InlineText value={this.props.todo.name}
                                        editing={this.props.todo.editing}
                                        style={colorStyle}
                                        multiline={true}
                                        onChange={() => {}}
                                        onStartEditing={()=>{}}
                                        onStopEditing={()=>{}}/>
                        </div>
                        <div className="todo-controls">
                            <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" />
                            <Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" />
                            <Button className="file-upload-btn pt-intent-success pt-minimal" iconName="document" />
                        </div>
                    </div>
                    {!_.isEmpty(this.props.todo.subtasks) && <SubtaskList style={colorStyle} subtasks={this.props.todo.subtasks} onChange={_.noop} onDelete={_.noop}  /> }
                </div>
            </div>
        );
    }
}

class TodoView extends React.Component<Props, State> {

    state = {
        dragging: false,
        progress: 0,
        uploading: false
    };

    private fileInput: HTMLInputElement;

    render(){
        let extraClasses = '';
        if(this.props.todo.dragged){
            extraClasses += ' dragged';
        }
        const colorStyle = getColorStyle(this.props.todo);
        const editingClass = this.props.todo.editing ? 'editing' : '';
        return (
            <div className={`todo-view pt-card pt-elevation-2 ${todoItemClass} ${extraClasses} ${editingClass}`}
                 data-todo-id={this.props.todo.id}
                 style={{
                    padding:0,
                    background: '#eee',
                    opacity: this.state.dragging ? 0 : undefined,
                    transition: 'none',
                    ...(this.props.style || {})
                }}
                 onDragStart={this.onDragStart}>
                <div>
                    <div className={'todo-wrapper ' + todoWrapperClass} style={colorStyle} >
                        <div className="drag-handle" draggable={true}>
                            <div className="inner-icon pt-icon-drag-handle-vertical"/>
                        </div>
                        <div className={todoContentWrapperClass}>
                            <InlineText value={this.props.todo.name}
                                        multiline={true}
                                        style={colorStyle}
                                        placeholder="New Todo"
                                        editing={this.props.todo.editing || false}
                                        onChange={this.onNameChanged}
                                        onStartEditing={this.onStartEditing}
                                        onStopEditing={this.onStopEditing} />
                        </div>
                        <div className="todo-controls">
                            <Button className="delete-btn pt-intent-danger pt-minimal" iconName="trash" onClick={this.onDeleteTodo} />
                            <Button className="add-subtask-btn pt-intent-success pt-minimal" iconName="plus" onClick={this.onAddSubtask} />
                            <Button className="file-upload-btn pt-intent-success pt-minimal" iconName="document" onClick={this.onAddAttachment} />
                            <Button className="todo-settings-btn pt-intent-success pt-minimal" iconName="cog" onClick={this.onOpenTodoSettings} />
                        </div>
                        <input type="file"
                               ref={fileInput => this.fileInput = fileInput }
                               onChange={this.onFileChanged} />
                    </div>
                    {!_.isEmpty(this.props.todo.subtasks) && <SubtaskList style={colorStyle} subtasks={this.props.todo.subtasks} onChange={(i, changes) => this.onSubtaskChanged(i, changes)} onDelete={(i) => this.onDeleteSubtask(i)}/>}
                    <AttachmentList attachments={this.props.todo.attachments}
                                    onOpenAttachment={(attachment) => this.onOpenAttachment(attachment)}
                                    onDelete={(i, attachment) => this.onDeleteAttachment(i, attachment)} />
                </div>
                {this.renderSpinner()}
            </div>
        );
    }

    private onStartEditing = () => {
        this.props.todo.set({editing: true});
    }

    private onStopEditing = () => {
        this.props.todo.set({editing: false});
    }

    private renderSpinner = () => {
        if(!this.state.uploading){
            return;
        }
        return (
            <div className={spinnerContainerClass}>
                <Spinner className={spinnerClass} />
            </div>
        );
    }

    private onSubtaskChanged(index: number, changes: Partial<Subtask>){
        this.props.todo.subtasks[index].set(changes);
    }

    private onDeleteSubtask(index: number) {
        this.props.todo.subtasks.splice(index, 1);
    }

    private onDragStart = async (event) => {
        event.preventDefault();
        const el = ReactDOM.findDOMNode(this);
        const $el = $(el);
        const offset = $el.offset();
        const x = offset.left;
        const y = offset.top;
        this.setState({
            dragging: true
        });
        const acceptDrop = await dndService.startDrag({x, y, width: $el.width(), height: $el.height()}, this.props.todo,
            <TodoDragPreview todo={this.props.todo} />
        );
        if(acceptDrop){
            acceptDrop()
            this.props.onDelete(this.props.todo);
        } else {
            this.setState({
                dragging: false
            });
        }
    };

    private onNameChanged = (newName) => {
        this.props.todo.set({name: newName});
    };

    private onDeleteTodo = async () => {
        if(this.props.confirmDeletion) {
            const result = await DialogService.showDangerDialog("Are you sure you want to delete this TODO?", "Delete", "Cancel");
            if(result){
                this.props.onDelete(this.props.todo);
            }
        } else {
            this.props.onDelete(this.props.todo);
        }
    };

    private onAddSubtask = () => {
        if(!this.props.todo.subtasks){
            this.props.todo.set({
                subtasks: [{name: 'New Task'} as any]
            });
        } else {
            this.props.todo.subtasks.push({name: 'New Task'} as any);
        }
    };

    private onFileChanged = async (event: any) => {
        const file = event.target.files[0];
        const attachment = await this.uploadFile(file);
        if(!this.props.todo.attachments){
            this.props.todo.set({
                attachments: [attachment]
            });
        } else {
            this.props.todo.attachments.push(attachment);
        }
    }

    private onAddAttachment = () => {
        $(this.fileInput).trigger('click');

    }

    private onOpenAttachment(attachment: Attachment){
        window.open(attachment.url);
    }

    private onDeleteAttachment = async (index: number, attachment: Attachment) => {
        this.props.todo.attachments.splice(index, 1);
    }

    private onOpenTodoSettings = async () => {
        let settings: TodoSettings = this.props.todo.settings || {
            recurring: false,
            color: '#eee'
        };
        function onChange(newSettings: TodoSettings){
            settings = newSettings;
        }
        const result = await DialogService.showDialog("Todo Settings", "Save", "Cancel", (
            <TodoSettingsDialog settings={settings} onChange={onChange}>
            </TodoSettingsDialog>
        ));

        if(result){
            this.props.todo.set({settings});
        }
    }

    // *********** Upload file to Cloudinary ******************** //
    uploadFile = async (file: File): Promise<Attachment> => {
        return new Promise<Attachment>((resolve) => {
            var url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            // Update progress (can be used to show progress indicator)
            xhr.upload.addEventListener("progress", (e) => {
                var progress = Math.round((e.loaded * 100.0) / e.total);
                this.setState({
                    uploading: true,
                    progress: progress
                });
                // console.log(`fileuploadprogress data.loaded: ${e.loaded}, data.total: ${e.total}`);
            });

            xhr.onreadystatechange = (e) => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // File uploaded successfully
                    var response = JSON.parse(xhr.responseText);
                    // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
                    const attachment = _.cloneDeep(response);
                    attachment.name = response.original_filename;
                    console.log("Attachment", attachment);
                    this.setState({
                        uploading: false
                    });
                    resolve(attachment);
                }
            };

            fd.append('upload_preset', unsignedUploadPreset);
            fd.append('tags', 'browser_upload'); // Optional - add tag for image admin in Cloudinary
            fd.append('file', file);
            xhr.send(fd);
        });
    }

}

export default TodoView;
