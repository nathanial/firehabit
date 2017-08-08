import * as React from 'react';
import * as colors from '../../theme/colors';
import TodoView from "./TodoView";
import ScrollArea from 'react-scrollbar';
import cxs from 'cxs';

declare class ScrollArea extends React.Component<any, {}>{
	handleKeyDown(e);
}

class CustomScrollArea extends ScrollArea {
	render(){
		return super.render();
	}
	handleKeyDown(e){
		if (e.target.tagName.toLowerCase() === 'textarea') {
			return;
		} else {
			return super.handleKeyDown(e);
		}
	}
}

const todoListClass = cxs({
	'list-style-type': 'none',
	'margin': 0,
	'padding': 0,
	'overflow-y': 'auto',
	'position': 'absolute',
	'left': 0,
	'right': 0,
	'bottom': 0,
	'top': 30,

	'.scrollarea': {
		height: '100%',
		'.scrollarea-content': {
			'padding-left': '10px',
			'padding-right': '10px',
			'li:first-child': {
				'margin-top': 0
			}
		},
		'.scrollbar-container': {
			'z-index': 1
		 },
		'.scrollbar-container.vertical': {
			'.scrollbar': {
				background: colors.primaryColor2
			},
			'&:hover': {
				background: colors.primaryColor1
			}
		}
	}
});

type Props = {
    column: TodoColumn;
};

export default class TodoList extends React.PureComponent<Props> {
    render(){
        return (
            <div className={todoListClass}>
                <CustomScrollArea
                    speed={0.8}
                    horizontal={false}>
					<div style={{margin: '10px 0'}}></div>
                    {this.props.column.todos.map((todo) => {
                        return <TodoView key={todo.id}
                                         todo={todo}
                                         confirmDeletion={this.props.column.confirmDeletion}
                                         onDelete={this.onDelete} />;
                    })}
                </CustomScrollArea>
            </div>
        );
    }

    onDelete = (todo) => {this.props.column.todos.splice(this.props.column.todos.indexOf(todo), 1)};
}