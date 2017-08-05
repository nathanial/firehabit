import * as React from 'react';
import styled from 'styled-components';
import * as colors from '../../theme/colors';
import TodoView from "./TodoView";
import ScrollArea from 'react-scrollbar';

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

const TodoListWrapper = styled.ul`
	list-style-type: none;
	margin: 0;
	padding: 0;
	overflow-y: auto;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 30px;
	
	& > .scrollarea {
		height: 100%;
		& > .scrollarea-content {
			padding-left: 10px;
			padding-right: 10px;
		}
		
		.scrollbar-container {
			z-index: 1;
		 }
		
		& > .scrollbar-container.vertical {
			& > .scrollbar {
				background: ${colors.primaryColor2};
			}
			&:hover {
				background: ${colors.primaryColor1};
			}
		}
	}

	& > .scrollarea > .scrollarea-content > li {
		&:first-child {
			margin-top: 0;
		}
	}
`;

type Props = {
    column: TodoColumn;
};

export default class TodoList extends React.PureComponent<Props> {
    render(){
        return (
            <TodoListWrapper>
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
            </TodoListWrapper>
        );
    }

    onDelete = (todo) => {this.props.column.todos.splice(this.props.column.todos.indexOf(todo), 1)};
}