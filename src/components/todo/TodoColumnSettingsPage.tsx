import * as React from 'react';
import {Button, Checkbox} from "@blueprintjs/core";
import * as _ from 'lodash';
import {db} from '../../util';
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
	marginTop: '10px'
});

interface Props {
	style?: Object;
	column: TodoColumn;
	goBack();
	onDelete(column: TodoColumn);
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
						<Button style={{marginTop: 10, marginBottom: 20}} onClick={this.onResetColor}>Reset Color</Button>
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

	private onResetColor = () => {
		this.props.column.set({color: null});
	};

	private onChange = (event) => {
		this.props.column.set({color: event.hex});
	};

	private onChangeConfirmDeletion = (event) => {
		this.props.column.set({confirmDeletion: event.target.checked});
	};

	private onChangeShowClearButton = (event) => {
		this.props.column.set({showClearButton: event.target.checked});
	};

	private onDeleteColumn = async () => {
		const column = this.props.column;
		const result = await DialogService.showDangerDialog(`Are you sure you wan't delete ${column.name}?`, 'Delete', 'Cancel');
		if(result){
			this.props.onDelete(column);
		}
	};
}
