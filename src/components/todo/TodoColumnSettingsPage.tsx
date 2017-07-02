import * as React from 'react';
import {Button, Checkbox} from "@blueprintjs/core";
import * as _ from 'lodash';
import {db, history} from '../../util';
import { SketchPicker } from 'react-color';
import {observer} from 'mobx-react';
import DialogService from "../../services/DialogService";
import cxs from 'cxs';

const settingsContainerClass = cxs({
	marginTop: '10px',
	position: 'relative',
	display: 'inline-block',
	textAlign: 'left'
});

const deleteColumnBtnClass = cxs({
	marginTop: '30px'
});

interface Props {
	style?: Object;
	column: TodoColumn;
}

@observer
export default class TodoColumnSettingsPage extends React.Component<Props,{}> {
	render(){
		const column = this.props.column;
		let confirmDeletion = column.confirmDeletion;
		let showClearBtn = column.showClearButton;
		const color = column.color || '#30404d';
		return (
			<div className="todo-column-settings-page" style={this.props.style}>
				<div className={`pt-card pt-elevation-2 ${settingsContainerClass}`}>
					<div style={{position: 'relative'}}>
						<label className="pt-label">Column Color</label>
						<SketchPicker color={color} className="sketch-picker" onChange={this.onChange}/>
						<Button onClick={this.onResetColor}>Reset Color</Button>
					</div>
					<Checkbox checked={confirmDeletion} onChange={this.onChangeConfirmDeletion}>
						Confirm Todo Deletion
					</Checkbox>
					<Checkbox checked={showClearBtn} onChange={this.onChangeShowClearButton}>
						Show Clear Button
					</Checkbox>
					<Button className={`pt-intent-danger ${deleteColumnBtnClass}`} onClick={this.onDeleteColumn}>Delete Column</Button>
				</div>
			</div>
		);
	}

	private goBack = () => {
		history.push('/todo');
	};

	private onResetColor = () => {
		db.todoColumnsDB.updateTodoColumn(this.columnID, {color: null});
	};

	private onChange = (event) => {
		db.todoColumnsDB.updateTodoColumn(this.columnID, {color: event.hex});
	};

	private onChangeConfirmDeletion = (event) => {
		db.todoColumnsDB.updateTodoColumn(this.columnID, {confirmDeletion: event.target.checked});
		this.forceUpdate();
	};

	private onChangeShowClearButton = (event) => {
		db.todoColumnsDB.updateTodoColumn(this.columnID, {showClearButton: event.target.checked});
		this.forceUpdate();
	};

	private onDeleteColumn = async () => {
		const column = _.find(db.todoColumnsDB.todoColumns, {id: this.columnID});
		const result = await DialogService.showDangerDialog(`Are you sure you wan't delete ${column.name}?`, 'Delete', 'Cancel');
		if(result){
			db.todoColumnsDB.deleteTodoColumn(column);
			this.goBack();
		}
	};

	private get columnID(){
		return this.props.column.id;
	}
}