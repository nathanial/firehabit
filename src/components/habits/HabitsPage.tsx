import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {db} from '../../util';
import {Button} from "@blueprintjs/core";
import * as colors from '../../theme/colors';
import {EditableText} from "@blueprintjs/core";
import DialogService from "../../services/DialogService";
import * as moment from "moment";

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
		min-height: 271px;
		overflow-y: auto;
		list-style-type: none;
		padding: 0;
		margin: 30px 0;
		font-size: 20px;
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
	}
`;

interface Props {
	entry: DailyEntry
}

interface State {
	updatedEntry: DailyEntry;
}

class DailyItem extends React.Component<Props, State> {
	state = {
		updatedEntry: _.cloneDeep(this.props.entry)
	}

	render(){
		const doneToday = this.dailyWasDoneToday();
		const style = {
			background: colors.primaryColor4,
			color: doneToday ? colors.primaryColor3 : 'white',
			textDecoration: doneToday ? 'line-through' : ''
		};
		return (
			<li style={style}>
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
		if(this.dailyWasDoneToday()){
			return (
				<Button iconName="star" onClick={this.setUnfinished}></Button>
			);
		} else {
			return (
				<Button iconName="star-empty" onClick={this.setFinished}></Button>
			);
		}
	}

	dailyWasDoneToday(){
		const finishedToday = _.get(this.state.updatedEntry.records, this.today());
		return finishedToday;
	}

	today(){
		return moment().format('MM-DD-YY');
	}

	setFinished = () => {
		const updatedEntry = _.cloneDeep(this.state.updatedEntry);
		updatedEntry.records = updatedEntry.records || {};
		updatedEntry.records[this.today()] = true;
		this.setState({updatedEntry}, () => {
			db.dailiesDB.updateDaily(this.state.updatedEntry);
		});
	};

	setUnfinished = () => {
		const updatedEntry = _.cloneDeep(this.state.updatedEntry);
		updatedEntry.records = updatedEntry.records || {};
		updatedEntry.records[this.today()] = false;
		this.setState({updatedEntry}, () => {
			db.dailiesDB.updateDaily(this.state.updatedEntry);
		});
	};

	onNameChanged = (newName) => {
		const updatedEntry = _.cloneDeep(this.state.updatedEntry);
		updatedEntry.name = newName;
		this.setState({updatedEntry});
	};

	onUpdatedTodo = () =>{
		db.dailiesDB.updateDaily(this.state.updatedEntry);
	};

	onRemove = async () => {
		const shouldDelete = await DialogService.showDangerDialog(
			`Are you sure you want to delete ${this.props.entry.name}`,
			`Delete ${this.props.entry.name}`,
			'Cancel'
		);
		if(shouldDelete){
			db.dailiesDB.removeDaily(this.props.entry);
		}
	}

}

class DailiesList extends React.Component<{},{}> {
	render(){
		const dailies = db.dailiesDB.dailies;
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
		db.dailiesDB.addDaily({name: 'New Daily Habit'});
	}
}

export default class HabitsPage extends React.Component<{},{}> {
	render(){
		return (
			<HabitsPageWrapper>
				<DailiesList></DailiesList>
			</HabitsPageWrapper>
		);
	}
}
