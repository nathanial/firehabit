import * as _ from 'lodash';
import * as React from 'react';
import {Icon, Button} from '@blueprintjs/core';
import {Editor, EditorState, ContentState, convertToRaw, convertFromRaw, RichUtils} from 'draft-js';
import {NoteList} from './NoteList';
import {Dropdown} from './NoteDropdown';
import * as DraftUtils from 'draftjs-utils';

type Props = {
    notes: Note[];
}

type State = {
    editorState: any
}
const fontSizes = [
    9,10,11,12,14,18,20,
    24,36,48,64,72,144,288
];


type FontSizeDropdownProps = {
    fontSize: number;
}

type BlockTypeDropdownProps = {
    blockType: string;
    onChange(blockType: string);
}

const styleMap = _.fromPairs(_.map(fontSizes, fontSize => {
    return [`fontsize-${fontSize}`, {fontSize: `${fontSize}px`}];
}));

const blockTypes = [
    'header-one',
    'header-two',
    'header-three',
    'unstyled'
];

type EditorToolbarProps = {
    editorState: EditorState;
    onChange(editorState: EditorState);
}

class EditorToolbar extends React.PureComponent<EditorToolbarProps,{}> {
    render(){
        const {editorState} = this.props;
        const style = editorState.getCurrentInlineStyle().toJS();
        const content = editorState.getCurrentContent().toJS();
        const block = DraftUtils.getSelectedBlock(editorState).toJS();
        const fontSize = this.getFontSize(block, style);
        return (
            <div className="editor-toolbar">
                <Button onClick={this.onBold}>
                    <img src="icons/notes-icons/bold.svg" />
                </Button>
                <Button onClick={this.onItalic}>
                    <img src="icons/notes-icons/italic.svg" />
                </Button>
                <Button onClick={this.onUnderline}>
                    <img src="icons/notes-icons/underline.svg" />
                </Button>
                <Button onClick={this.onStrikethrough}>
                    <img src="icons/notes-icons/strikethrough.svg" />
                </Button>
                <Dropdown className="block-type-dropdown" items={blockTypes} selected={block.type} onChange={this.toggleBlockType} />
                <Dropdown className="font-size-dropdown" items={fontSizes} selected={fontSize} onChange={this.changeFontSize} />
            </div>
        );
    }

    private onBold = () => {
        this.toggleInlineStyle("BOLD");
    };

    private onItalic = () => {
        this.toggleInlineStyle("ITALIC");
    };

    private onUnderline = () => {
        this.toggleInlineStyle("UNDERLINE");
    };

    private onStrikethrough = () => {
        this.toggleInlineStyle("STRIKETHROUGH");
    }

    private toggleInlineStyle(style: string){
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, style));
    }

    private toggleBlockType = (type: string) => {
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, type));
    }

    private changeFontSize = (fontSize: number) => {
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, 'fontsize-' + fontSize));
    }

    private getFontSize = (block, styles: string[]) => {
        const fontSize = _.find(styles, style => _.startsWith(style, "fontsize-"));
        if(!fontSize){
            if(block.type === 'header-one'){
                return 40;
            }
            if(block.type === 'header-two'){
                return 24;
            }
            if(block.type === 'header-three'){
                return 18;
            }
            return 14;
        } else {
            const [prefix, value] = fontSize.split('-');
            return parseInt(value, 10);
        }
    }

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
               <div className="editor-panel">
                    <NoteList notes={this.props.notes} />
                    {this.renderEditor()}
                </div>
            </div>
        );
    }

    renderEditor() {
        return [
            <EditorToolbar key="editor-toolbar" editorState={this.state.editorState} onChange={this.onEditorStateChange} />,
            <Editor customStyleMap={styleMap} key="editor" editorState={this.state.editorState} onChange={this.onEditorStateChange} />
        ];
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
