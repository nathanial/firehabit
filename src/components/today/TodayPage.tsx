import * as React from 'react';
import cxs from 'cxs';
import {TweenMax, Power2, TimelineMax} from 'gsap';
import {findDOMNode} from "react-dom";
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/lib/codemirror.css';
import * as ReactDOM from "react-dom";

const todayPageClass = cxs({
});

interface Props {
	timeSlots: TimeSlot[];
}

const textEditorClass = cxs({
	width: '400px',
	height: '600px',
	'textarea': {
		display: 'block',
		width: '100%',
		height: '100%',
		fontFamily:'monospace'
	}
});

const previewClass = cxs({

});

const defaultText = `
# 10:00AM 
  Going to doctor
# Wakeup
  
`;

const textEditorPanel = cxs({
	'h3': {
		textAlign: 'left'
	},
	margin: '30px'
});

interface State {
	text: string;
}

export default class TodayPage extends React.Component<Props, State> {

	private editor: any;
	private textEditorNode: any;

	state = {
		text: defaultText
	}

	render(){
		return (
			<div className={todayPageClass}>
				<div className={textEditorPanel}>
					<h3>Plan for Today</h3>
					{this.renderTextEditor()}
				</div>
				{this.renderPreview()}
			</div>
		);
	}

	componentDidMount(){
		const el = this.textEditorNode;
		this.editor = CodeMirror(el, {
			lineNumbers: true,
			mode: 'markdown'
		});
	}

	private renderTextEditor = () => {
		return (
			<div className={textEditorClass} ref={node => this.textEditorNode = node}>
			</div>
		);
	};

	private renderPreview = () => {
		return (
			<div className={previewClass}>

			</div>
		);
	};

	private onTextChanged = (newText) => {
		this.setState({
			text: defaultText
		});
	}
}