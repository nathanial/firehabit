// Line Limit 50
import * as _ from 'lodash';
import React from 'react';
import styled from 'styled-components';
import * as colors from "../../theme/colors";
import {appState} from '../../util';
import {toJS} from 'mobx';
import {Modifier, convertFromRaw, convertToRaw, Editor, EditorState, RichUtils} from 'draft-js';
import {Button} from "@blueprintjs/core";
import PrismDecorator from 'draft-js-prism';

const NotesWrapper = styled.div`
	background: ${colors.primaryColor5};
	position: absolute;	
`;

const ContentWrapper = styled.div`
 position: relative;
 height: 100%;
 .DraftEditor-root {
 		text-align: left;
 		margin-left: 40px;
 		margin-top: 50px;
 		height: 100%;
 		& > .DraftEditor-editorContainer {
 			height: 100%;
 			
 			& > .public-DraftEditor-content {
 				height: 100%;
 			}
		}
		.public-DraftStyleDefault-pre {
		 	background: ${colors.primaryColor4}; 
			pre {
			 box-shadow: none;
			 background: ${colors.primaryColor4};
			 margin: 0;
			 padding: 0;
			 tab-size: 4;
			}
		}
 }
 
`;

const EditorToolbarWrapper = styled.div`
	text-align: left;
	padding: 5px 10px;
	background: ${colors.primaryColor1};
	border-bottom: 1px solid ${colors.primaryColor4};
`;

export default class NotesPage extends React.Component {
	state = {};
	constructor(){
		super(...arguments);
		const decorator = new PrismDecorator({
			defaultSyntax: 'javascript'
		});
		if(appState.notes.content){
			try {
				this.state.editorState = EditorState.createWithContent(convertFromRaw(_.defaults(toJS(appState.notes.content), {entityMap: {}})), decorator);
			} catch(error){
				console.error(error);
				this.state.editorState = EditorState.createEmpty(decorator);
			}
		} else {
			this.state.editorState = EditorState.createEmpty(decorator);
		}
	}
	render(){
		return (
			<NotesWrapper>
				<EditorToolbarWrapper>
					<div className="pt-button-group">
						<Button iconName="bold" onClick={() => this.toggleStyle('BOLD')}></Button>
						<Button iconName="italic" onClick={() => this.toggleStyle('ITALIC')}></Button>
					</div>
					<div className="pt-button-group" style={{marginLeft: 30}}>
						<Button onClick={() => this.toggleBlockType("header-one")}>H1</Button>
						<Button onClick={() => this.toggleBlockType("header-two")}>H2</Button>
						<Button onClick={() => this.toggleBlockType("header-three")}>H3</Button>
						<Button onClick={() => this.toggleBlockType("code-block")}>Code</Button>
					</div>
					<div className="pt-button-group" style={{marginLeft: 30}}>
						<Button onClick={() => this.toggleBlockType("unordered-list-item")}>UL</Button>
						<Button onClick={() => this.toggleBlockType("ordered-list-item")}>LI</Button>
						<Button onClick={() => this.toggleBlockType("blockquote")}>Block Quote</Button>
					</div>
				</EditorToolbarWrapper>
				<ContentWrapper>
					<Editor editorState={this.state.editorState} onTab={this.onTab} onChange={this.onChange} />
				</ContentWrapper>
			</NotesWrapper>
		);
	}

	onTab = (e) => {
		e.preventDefault();
		const editorState = this.state.editorState;
		const selection = editorState.getSelection();
		const contentState = editorState.getCurrentContent();
		const ncs = Modifier.insertText(contentState, selection, "\t");
		const es = EditorState.push(editorState, ncs, 'insert-fragment');
		this.setState({editorState: es});
	}

	onChange = (editorState) => {
		appState.updateNotes(convertToRaw(editorState.getCurrentContent()));
		this.setState({editorState});
	}

	toggleStyle = (newStyle) => {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, newStyle));
	}

	toggleBlockType = (newBlockType) => {
		this.onChange(RichUtils.toggleBlockType(this.state.editorState, newBlockType));
	}

}