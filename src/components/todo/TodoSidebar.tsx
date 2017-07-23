import * as React from 'react';
import {Button} from '@blueprintjs/core';
import {db} from "../../util";
import cxs from 'cxs';
import * as colors from '../../theme/colors';

const todoSidebarClass = cxs({
	margin: '10px 30px',
	display: 'inline-block'
});

export default class TodoSidebar extends React.Component<{},{}> {
	render(){
		return (
			<div className={`${todoSidebarClass}`}>
				<Button className="add-column-btn pt-intent-success"
						iconName="plus"
						onClick={this.onAddColumn}>
					Add Column
				</Button>
			</div>
		);
	}

	onAddColumn = () => {
		db.todoColumnsDB.addTodoColumn('New Column');
	}
}