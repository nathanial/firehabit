import React from 'react';
import styled from 'styled-components';
import {Button, Checkbox} from "@blueprintjs/core";
import * as _ from 'lodash';
import {appState, history} from '../../util';
import { SketchPicker } from 'react-color';
import {observer} from 'mobx-react';
import DialogService from "../../services/DialogService";

const PageWrapper = styled.div`
	.back-btn {
		position: absolute;
		left: 10px;
		top: 10px;
	}
	
	.settings-container {
		width: 500px;
		margin-top: 10px;
		position: relative;
		display: inline-block;
		text-align: left;
	}
	
	.delete-column-btn {
		margin-top: 30px;
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
		let confirmDeletion = column.confirmDeletion;
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
					<Checkbox style={{marginTop:30}} checked={confirmDeletion} onChange={this.onChangeConfirmDeletion}>
						Confirm Todo Deletion
					</Checkbox>
					<Button className="pt-intent-danger delete-column-btn" onClick={this.onDeleteColumn}>Delete Column</Button>
				</div>
			</PageWrapper>
		);
	}

	goBack = () => {
		history.push('/todo');
	};

	onResetColor = () => {
		appState.updateTodoColumn(this.props.match.params.columnID, {color: null});
	};

	onChange = (event) => {
		appState.updateTodoColumn(this.props.match.params.columnID, {color: event.hex});
	};

	onChangeConfirmDeletion = (event) => {
		appState.updateTodoColumn(this.props.match.params.columnID, {confirmDeletion: event.target.checked});
		this.forceUpdate();
	};

	onDeleteColumn = async () => {
		const column = _.find(appState.todoColumns, {id: this.props.match.params.columnID});
		const result = await DialogService.showDangerDialog(`Are you sure you wan't delete ${column.name}?`, 'Delete', 'Cancel');
		if(result){
			appState.deleteTodoColumn(column);
			this.goBack();
		}
	}
})