import * as _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {appState} from '../../util';
import {Button} from "@blueprintjs/core";
import * as colors from '../../theme/colors';
import {observer} from 'mobx-react';
import {EditableText} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";

const HabitsPageWrapper = styled.div`
	& > h1 {
		margin-top: 30px;
	}
	
`;

const DailiesListWrapper = styled.div`
	margin-top: 30px;
	width: 500px;
	display: inline-block;
	text-align: left;
	& > ul {
		min-height: 300px;
		max-height: 300px;
		overflow-y: auto;
		list-style-type: none;
		padding: 0;
		margin: 30px 0;
		font-size: 22px;
		border: 1px solid ${colors.primaryColor5};
		& > li {
			padding: 10px 30px;
			position: relative;
			
			.pt-editable-text {
				width: 300px;
			}
			
			.daily-buttons {
				position: absolute;
				right: 10px;
				top: 10px;
			}
		}
		
		& > li:nth-child(odd) {
			background: #475969;
		}
	}
`;

class DailyItem extends React.Component {
	static propTypes = {
		entry: PropTypes.object.isRequired
	}

	state = {
		updatedEntry: _.cloneDeep(this.props.entry)
	}

	render(){
		const entry = this.props.entry;
		return (
			<li >
				<EditableText value={this.state.updatedEntry.name}
											multiline={true}
											onChange={this.onNameChanged}
											onConfirm={this.onUpdatedTodo}  />
				<div className="daily-buttons pt-button-group">
					{this.renderStar()}
					<Button iconName="trash" onClick={this.onRemove} ></Button>
				</div>
			</li>
		);
	}

	renderStar(){
		if(this.dailyWasDoneToday(this.props.entry)){
			return (
				<Button iconName="star" ></Button>
			);
		} else {
			return (
				<Button iconName="star-empty"></Button>
			);
		}
	}

	dailyWasDoneToday(){
		return false;
	}

	onNameChanged = (newName) => {
		const updatedEntry = _.cloneDeep(this.state.updatedEntry);
		updatedEntry.name = newName;
		this.setState({updatedEntry});
	};

	onUpdatedTodo = () =>{
		appState.updateDaily(this.state.updatedEntry);
	};

	onRemove = async () => {
		const shouldDelete = await DialogService.showDangerDialog(
			`Are you sure you want to delete ${this.props.entry.name}`,
			`Delete ${this.props.entry.name}`,
			'Cancel'
		);
		if(shouldDelete){
			appState.removeDaily(this.props.entry);
		}
	}

}

class DailiesList extends React.Component {
	render(){
		const dailies = appState.dailies;
		return (
			<DailiesListWrapper className="pt-card pt-elevation-1">
				<h2>Dailies</h2>
				<ul>
					{dailies.map((entry, index) => {
						return (
							<DailyItem entry={entry} key={entry.id}/>
						);
					})}
				</ul>
				<Button onClick={this.onAddDaily}>Add Daily...</Button>
			</DailiesListWrapper>
		);
	}

	onAddDaily = () => {
		appState.addDaily({name: 'New Daily Habit'});
	}
}
DailiesList = observer(DailiesList);

export default class HabitsPage extends React.Component {
	render(){
		return (
			<HabitsPageWrapper>
				<DailiesList></DailiesList>
			</HabitsPageWrapper>
		);
	}
}
