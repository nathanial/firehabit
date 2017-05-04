import React from 'react';
import {appState} from '../../util';
import {Button} from "@blueprintjs/core";
import styled from 'styled-components';
import {observer} from 'mobx-react';
import DialogService from "../../services/DialogService";

const TodoColumnWrapper = styled.div`
	display: inline-block;
	margin: 10px;
	padding: 30px;
	width: 280px;
	text-align: center;
	height: 500px;
`;

class TodoColumn extends React.Component {

	static propTypes = {
		column: React.PropTypes.object.isRequired
	};

	render(){
		return (
			<TodoColumnWrapper className="pt-card pt-elevation-2">
				<h4>Todo Column</h4>
				<Button iconName="trash" className="pt-intent-danger" onClick={this.onStartDelete}></Button>
			</TodoColumnWrapper>
		);
	}

	onStartDelete = async () => {
		const shouldDelete = await DialogService.showDangerDialog(
			'Are you sure you want to delete this column?',
			'Delete Column',
			'Cancel'
		);
		if(shouldDelete){
			appState.deleteTodoColumn(this.props.column);
		}
	}
}

const TodoPageWrapper = styled.div`
	display: block;
	text-align: left;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	padding: 15px;
	white-space: nowrap;
`;

const ColumnsContainer = styled.div`
`;

export default observer(class TodoPage extends React.Component {
	render(){
		const todoColumns = appState.todoColumns;
		return (
			<TodoPageWrapper>
				<ColumnsContainer>
					{todoColumns.map((column, i) => {
						return <TodoColumn key={i} column={column} />
					})}
				</ColumnsContainer>
				<Button onClick={this.onAddColumn}>Add Column</Button>
			</TodoPageWrapper>
		);
	}

	onAddColumn = () => {
		appState.addTodoColumn('New Column');
	}
})