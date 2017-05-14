// Line Limit 50
import * as _ from 'lodash';
import React from 'react';
import styled from 'styled-components';
import * as colors from "../../theme/colors";
import {appState} from '../../util';
import {observer} from 'mobx-react'
import SidePanel from './SidePanel';
import ReactQuill from "react-quill";

const NotesWrapper = styled.div`
	background: ${colors.primaryColor5};
	height: 100%;	
`;

const ContentWrapper = styled.div`
 position: relative;
 left: 300px;
 height: 100%;
 & > .quill {
 	border: 0 solid transparent;
 	border-image-width: 0px;
 		& > .ql-toolbar {
 			background: ${colors.primaryColor3};
 			border-width: 0;
 			.ql-picker-label {
	 			color: white !important;
			}
 			svg * {
				color: white !important;
				stroke: white !important;
			}
 		}
 		& > .ql-container {
 			border-width: 0;
 		}
 }
`;

export default observer(class NotesPage extends React.Component {
	state = {
		selectedSection: _.get(appState.notesSections, '[0]')
	};

	render(){
		const selectedSection = this.state.selectedSection;
		const notesSections = appState.notesSections;
		return (
			<NotesWrapper>
				<SidePanel notesSections={notesSections}
									 selectedSection={selectedSection}
									 onSelectedSectionChanged={this.onSelectedSectionChanged}
									 onAddNotesSection={this.onAddNotesSection}/>
				{this.renderContent()}
			</NotesWrapper>
		);
	}

	renderContent(){
		if(this.state.selectedSection) {
			return (
				<ContentWrapper>
					<ReactQuill value={this.state.text} theme="snow"
											onChange={this.handleChange} />
				</ContentWrapper>
			);
		}
	}

	onSelectedSectionChanged = (newSection) => {
		this.setState({
			selectedSection: newSection
		});
	};

	onAddNotesSection = () => {
		appState.addNotesSection('New Notes Section');
	}
})