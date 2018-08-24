import * as React from 'react';
import {Button, Checkbox} from "@blueprintjs/core";
import * as _ from 'lodash';
import { SliderPicker } from 'react-color';
import DialogService from "../../services/DialogService";


interface Props {
	style?: Object;
	column: TodoColumn;
	onDelete(columnID: string);
	onMoveLeft(column: TodoColumn);
	onMoveRight(column: TodoColumn);
}

export default class TodoColumnSettingsPage extends React.PureComponent<Props> {
	render(){
		const column = this.props.column;
		let confirmDeletion = column.confirmDeletion;
		let showClearBtn = column.showClearButton;
		const color = column.color;
		const enableTabs = column.enableTabs;
		const showTodoCount = column.showTodoCount;
		const style = _.extend({}, {
		}, this.props.style);
		return (
			<div className={"todo-column-settings"} style={style}>
				<div style={{position: 'relative'}}>
					<SliderPicker color={color} className="sketch-picker" onChange={this.onChange}/>
					<Button style={{marginTop: 10, marginBottom: 20}} onClick={this.onResetColor}>Reset Color</Button>
				</div>
				<Checkbox checked={confirmDeletion} onChange={this.onChangeConfirmDeletion}>
					Confirm Todo Deletion
				</Checkbox>
				<Checkbox checked={showClearBtn} onChange={this.onChangeShowClearButton}>
					Show Clear Button
				</Checkbox>
				<Checkbox checked={enableTabs} onChange={this.onChangeEnableTabs}>
					Enable Tabs
				</Checkbox>
				<Checkbox checked={showTodoCount} onChange={this.onChangeShowTodoCount}>
					Show Todo Count
				</Checkbox>
				<Button className={`pt-intent-danger`} onClick={this.onDeleteColumn}>Delete Column</Button>
				<div className="move-buttons">
					<Button onClick={this.onMoveLeft}>Move Left</Button>
					<Button onClick={this.onMoveRight}>Move Right</Button>
				</div>
			</div>
		);
	}

	private onChangeShowTodoCount = (event) => {
		this.props.column.set({showTodoCount: event.target.checked});
	}

	private onChangeEnableTabs = (event) => {
		this.props.column.set({enableTabs: event.target.checked});
	};

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
		const result = await DialogService.showDangerDialog(`Are you sure you wan't delete ${this.props.column.name}?`, 'Delete', 'Cancel');
		if(result){
			this.props.onDelete(this.props.column.id);
		}
	};

	private get columnID(){
		return this.props.column.id;
	}

	private onMoveLeft = () => {
		this.props.onMoveLeft(this.props.column);
	}

	private onMoveRight = () => {
		this.props.onMoveRight(this.props.column);
	}

}
