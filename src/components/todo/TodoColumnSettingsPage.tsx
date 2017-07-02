import * as React from 'react';
import {Button, Checkbox} from "@blueprintjs/core";
import * as _ from 'lodash';
import {db, history} from '../../util';
import { SketchPicker } from 'react-color';
import {observer} from 'mobx-react';
import DialogService from "../../services/DialogService";
import cxs from 'cxs';

const backBtnClass = cxs({
	position: 'absolute',
	left: '18px',
	top: '15px'
});

const settingsContainerClass = cxs({
	width: '500px',
	marginTop: '10px',
	position: 'relative',
	display: 'inline-block',
	textAlign: 'left'
});

const deleteColumnBtnClass = cxs({
	marginTop: '30px'
});

interface Props {
	match?: any;
}

@observer
export default class TodoColumnSettingsPage extends React.Component<Props,{}> {
	render(){
		const column = _.find(db.todoColumnsDB.todoColumns, {id: this.props.match.params.columnID});
		let confirmDeletion = column.confirmDeletion;
		let showClearBtn = column.showClearButton;
		const color = column.color || '#30404d';
		return (
			<div>
				<h2 style={{marginTop: 30}}>"{column.name}" Column Settings</h2>
				<div className={`pt-card pt-elevation-1 ${settingsContainerClass}`}>
					<Button className={backBtnClass} iconName="arrow-left" onClick={this.goBack}>Back to Todos</Button>
					<div style={{marginTop: 50, position: 'relative'}}>
						<label className="pt-label">Column Color</label>
						<SketchPicker color={color} className="sketch-picker" onChange={this.onChange}/>
						<Button style={{marginTop: 10}} onClick={this.onResetColor}>Reset Color</Button>
					</div>
					<Checkbox style={{marginTop:30}} checked={confirmDeletion} onChange={this.onChangeConfirmDeletion}>
						Confirm Todo Deletion
					</Checkbox>
					<Checkbox style={{marginTop:30}} checked={showClearBtn} onChange={this.onChangeShowClearButton}>
						Show Clear Button
					</Checkbox>
					<Button className={`pt-intent-danger ${deleteColumnBtnClass}`} onClick={this.onDeleteColumn}>Delete Column</Button>
				</div>
			</div>
		);
	}

	goBack = () => {
		history.push('/todo');
	};

	onResetColor = () => {
		db.todoColumnsDB.updateTodoColumn(this.props.match.params.columnID, {color: null});
	};

	onChange = (event) => {
		db.todoColumnsDB.updateTodoColumn(this.props.match.params.columnID, {color: event.hex});
	};

	onChangeConfirmDeletion = (event) => {
		db.todoColumnsDB.updateTodoColumn(this.props.match.params.columnID, {confirmDeletion: event.target.checked});
		this.forceUpdate();
	};

	onChangeShowClearButton = (event) => {
		db.todoColumnsDB.updateTodoColumn(this.props.match.params.columnID, {showClearButton: event.target.checked});
		this.forceUpdate();
	};

	onDeleteColumn = async () => {
		const column = _.find(db.todoColumnsDB.todoColumns, {id: this.props.match.params.columnID});
		const result = await DialogService.showDangerDialog(`Are you sure you wan't delete ${column.name}?`, 'Delete', 'Cancel');
		if(result){
			db.todoColumnsDB.deleteTodoColumn(column);
			this.goBack();
		}
	}
}