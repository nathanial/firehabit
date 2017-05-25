import React from 'react';
import styled from 'styled-components';
import {Button} from "@blueprintjs/core";
import * as _ from 'lodash';
import {appState, history} from '../../util';
import { SketchPicker } from 'react-color';
import {observer} from 'mobx-react';

const PageWrapper = styled.div`
	.back-btn {
		position: absolute;
		left: 10px;
		top: 10px;
	}
	
	.settings-container {
		width: 500px;
		height: 500px;
		margin-top: 10px;
		position: relative;
		display: inline-block;
		text-align: left;
	}
`;

const PageTitle = styled.h2`
	margin-top: 30px;
`;

const SettingsContent = styled.div`
	margin-top: 50px;
	position: relative;
`;

export default observer(class TodoColumnSettingsPage extends React.Component {
	render(){
		const column = _.find(appState.todoColumns, {id: this.props.match.params.columnID});
		const color = column.color || '#30404d';
		return (
			<PageWrapper>
				<PageTitle>"{column.name}" Column Settings</PageTitle>
				<div className="pt-card pt-elevation-1 settings-container">
					<Button className="back-btn" iconName="arrow-left" onClick={this.goBack}>Back to Todos</Button>
					<SettingsContent>
						<label className="pt-label">Column Color</label>
						<SketchPicker color={color} className="sketch-picker" onChange={this.onChange}/>
						<Button style={{marginTop: 10}} onClick={this.onResetColor}>Reset Color</Button>
					</SettingsContent>
				</div>
			</PageWrapper>
		);
	}

	goBack = () => {
		history.push('/todo');
	}

	onResetColor = () => {
		appState.updateTodoColumn(this.props.match.params.columnID, {color: null});
	}

	onChange = (event) => {
		appState.updateTodoColumn(this.props.match.params.columnID, {color: event.hex});
	}
})