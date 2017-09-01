import * as React from 'react';
import {db} from '../../util';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import TodoColumnView from "./TodoColumnView";
import {Route} from "react-router-dom";
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

@observer
class ColumnsPage extends React.Component<{},{}> {
    render(){
        const todoColumns = db.todoColumnsDB.todoColumns;
        return (
            <div className={todoPageClass}>
                <TodoTopbar />
                <ColumnsContainer>
                    {todoColumns.map((column) => {
                        return <TodoColumnView key={column.id} column={column} 
                                               onUpdateColumn={this.onUpdateColumn} 
                                               onAddTodo={this.onAddTodo} 
                                               onDeleteTodo={this.onDeleteTodo}
                                               onTodoDropped={this.onTodoDropped}
                                               onUpdateTodo={this.onUpdateTodo} />
                    })}
                </ColumnsContainer>
                <DragAndDropLayer />
            </div>
        );
    }

    /**
     * forceUpdate is a filthy hack as we move away from mobx
     */
    private onUpdateColumn = async (columnID: string, column: Partial<TodoColumn>) => {
        await db.todoColumnsDB.updateTodoColumn(columnID, column);
        this.forceUpdate();
    }

    private onAddTodo = async (column: TodoColumn, todo: Partial<Todo>) => {
        await db.todoColumnsDB.addTodo(column, todo);
        this.forceUpdate();
    }

    private onDeleteTodo = async (column: TodoColumn, todo: Todo) => {
        await db.todoColumnsDB.deleteTodo(todo);
        this.forceUpdate();
    }

    private onTodoDropped = async (todo: Todo, column: TodoColumn, index: number) => {
        await db.todoColumnsDB.moveTodo(todo, column, {index});
        this.forceUpdate();
    }

    private onUpdateTodo = async (column: TodoColumn, todo: Todo) => {
        await db.todoColumnsDB.updateTodo(todo);
        this.forceUpdate();
    }
}

export default class TodoPage extends React.Component {
    render(){
        return (
            <div>
                <Route exact path="/" component={ColumnsPage} />
                <Route exact path="/todo/column/:columnID/settings" component={TodoColumnSettingsPage} />
            </div>
        );
    }
}