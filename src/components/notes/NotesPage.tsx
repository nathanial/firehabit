import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Icon, Button} from '@blueprintjs/core';
import {Editor, EditorState, ContentState, convertToRaw, convertFromRaw, RichUtils} from 'draft-js';
import {NoteList} from './NoteList';
import {Dropdown, ValueItem} from './NoteDropdown';
import * as DraftUtils from 'draftjs-utils';
import {Modifier as DraftModifier} from 'draft-js';
import {MousePosition} from '../../util';

type Props = {
    notes: Note[];
}

type State = {
    editorState: any;
    selectionArea: ClientRect;
}


type BlockTypeDropdownProps = {
    blockType: string;
    onChange(blockType: string);
}

const blockTypes = [
    {name: 'Header', value: 'header-one'},
    {name: 'Sub Header', value: 'header-two'},
    {name: 'Text', value: 'unstyled'},
    {name: 'List', value: 'ordered-list-item'}
];

const styleMap = {
};

function customBlockRenderer(contentBlock){
}


type EditorToolbarProps = {
    style: any;
    editorState: EditorState;
    onChange(editorState: EditorState);
}

type ToolbarButtonProps = {
    onClick(event);
}

class ToolbarButton extends React.PureComponent<ToolbarButtonProps,{}> {
    private ref;

    render(){
        return (
            <Button ref={r => this.ref = r}>
                {this.props.children}
            </Button>
        );
    }

    componentDidMount(){
        ReactDOM.findDOMNode(this.ref).addEventListener('mousedown', this.onClick, true);
    }

    componentWillUnmount(){
        ReactDOM.findDOMNode(this.ref).removeEventListener('mousedown', this.onClick, true);
    }

    onClick = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.props.onClick(event);
    }
}

class EditorToolbar extends React.PureComponent<EditorToolbarProps,{}> {
    private toolbarRef;
    render(){
        const {editorState} = this.props;
        const style = editorState.getCurrentInlineStyle().toJS();
        const content = editorState.getCurrentContent().toJS();
        const block = DraftUtils.getSelectedBlock(editorState).toJS();
        return (
            <div ref={r => this.toolbarRef = r} className="editor-toolbar" style={this.props.style}>
                <ToolbarButton onClick={this.onBold}>
                    <img src="icons/notes-icons/bold.svg" />
                </ToolbarButton>
                <ToolbarButton onClick={this.onItalic}>
                    <img src="icons/notes-icons/italic.svg" />
                </ToolbarButton>
                <ToolbarButton onClick={this.onStrikethrough}>
                    <img src="icons/notes-icons/strikethrough.svg" />
                </ToolbarButton>
                <Dropdown className="block-type-dropdown" items={blockTypes} selected={_.find(blockTypes, {value: block.type})} onChange={this.toggleBlockType} />
            </div>
        );
    }

    componentDidMount(){
        this.toolbarRef.addEventListener('mousedown', this.onMouseDown, true);
    }

    componentWillUnmount(){
        this.toolbarRef.removeEventListener('mousedown', this.onMouseDown, true);
    }

    onMouseDown = (event) => {
    }

    private onBold = (event) => {
        this.toggleInlineStyle("BOLD");
    };

    private onItalic = (event) => {
        this.toggleInlineStyle("ITALIC");
    };

    private onStrikethrough = () => {
        this.toggleInlineStyle("STRIKETHROUGH");
    }

    private toggleInlineStyle(style: string){
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, style));
    }

    private toggleBlockType = (type: ValueItem) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, type.value));
    }
}

export default class NotesPage extends React.Component<Props, State> {

    constructor(props){
        super(props);
        const editing = _.find(this.props.notes, note => note.editing);
        if(editing && editing.text){
            this.state = {
                editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(editing.text))),
                selectionArea: null
            };
        } else {
            this.state = {
                editorState: EditorState.createEmpty(),
                selectionArea: null
            };
        }
    }

    render(){
        return (
            <div className="notes-page">
               <div className="editor-panel">
                    <NoteList notes={this.props.notes} />
                    {this.renderToolbar()}
                    <Editor blockRendererFn={customBlockRenderer} customStyleMap={styleMap} key="editor" editorState={this.state.editorState} onChange={this.onEditorStateChange} />
                </div>
            </div>
        );
    }

    private renderToolbar(){
        if(this.state.selectionArea){
            const {left,top} = this.state.selectionArea;
            const toolbarWidth = 298;
            const centerToolbar = toolbarWidth / 2;
            const delta = MousePosition.x - centerToolbar;
            return (
                <EditorToolbar style={{
                    position: 'fixed',
                    left: MousePosition.x - centerToolbar,
                    top: top - 34,
                }} editorState={this.state.editorState} onChange={this.onEditorStateChange} />
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
            editorState,
            selectionArea: this.getSelectionArea()
        });
        const currentEditing = _.find(this.props.notes, note => note.editing);
        if(currentEditing){
            currentEditing.set({text: JSON.stringify(convertToRaw(editorState.getCurrentContent()))})
        }
    }

    private getSelectionArea(){
        const selection = window.getSelection();
        if(selection.rangeCount > 0 && selection.anchorOffset !== selection.extentOffset){
            const firstRange = selection.getRangeAt(0);
            return firstRange.getBoundingClientRect();
        }
    }
}
