import * as React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoColumnView from "./TodoColumnView";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import TodoTopbar from "./TodoTopbar";
import cxs from 'cxs';
import {DragAndDropLayer} from "../dnd/DragAndDropLayer";
import * as mobx from 'mobx';

const todoPageClass = cxs({
    display: 'block',
    'text-align': 'left',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: '15px 0',
    'white-space': 'nowrap'
});

const ColumnsContainer = styled.div`
    width: 100%;
    height: calc(100% - 37px);
    overflow-x: auto;
    padding: 0 20px;
`;

type Props = {
    todoColumns: TodoColumn[];
    onTodoDropped(todo: Todo, column: TodoColumn, index: number);
	onUpdateTodo(column: TodoColumn, todo: Todo);
	onDeleteTodo(column: TodoColumn, todo: Todo);
	onAddTodo(column: TodoColumn, todo: Partial<Todo>);
	onUpdateColumn(columnID: string, changes: Partial<TodoColumn>);
}

@observer
export default class TodoPage extends React.Component<Props, {}> {
    render(){
        const {todoColumns} = this.props;
        return (
            <div className={todoPageClass}>
                <TodoTopbar />
                <ColumnsContainer>
                    {todoColumns.map((column) => {
                        return <TodoColumnView key={column.id} column={column} 
                                               onUpdateColumn={this.props.onUpdateColumn} 
                                               onAddTodo={this.props.onAddTodo} 
                                               onDeleteTodo={this.props.onDeleteTodo}
                                               onTodoDropped={this.props.onTodoDropped}
                                               onUpdateTodo={this.props.onUpdateTodo} />
                    })}
                </ColumnsContainer>
                <DragAndDropLayer />
            </div>
        );
    }
}