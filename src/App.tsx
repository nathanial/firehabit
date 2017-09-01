import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import * as React from 'react';
import './App.css';
import SiteNavbar from "./components/SiteNavbar";
import CaloriesPage from './components/calories/CaloriesPage';
import TodoPage from './components/todo/TodoPage';
import {history,db} from './util';
import {AppState} from "./state";

interface Props {
    appState: AppState
};



export default class App extends React.Component<Props, {}> {

    render() {
        return (
            <div className="App pt-dark">
                <SiteNavbar user={db.user} path={history.location.pathname} onNavigate={this.onNavigate} />
                <div className="app-content">
                    {this.renderPage()}
                </div>
            </div>
        );
    }

    private renderPage(){
        if(history.location.pathname === '/') {
            const todoColumns = db.todoColumnsDB.todoColumns;
            return 	(
                <TodoPage todoColumns={todoColumns}
                          onUpdateColumn={this.onUpdateColumn}
                          onAddTodo={this.onAddTodo}
                          onDeleteTodo={this.onDeleteTodo}
                          onTodoDropped={this.onTodoDropped}
                          onUpdateTodo={this.onUpdateTodo}
                          onDeleteColumn={this.onDeleteColumn} />
            );
        } else {
            return (
                <CaloriesPage caloriesState={this.props.appState.calories} />
            );
        }
    }

    private onNavigate = (page) => {
        history.push('/' + page);
        this.forceUpdate();
    };

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

    private onDeleteColumn = async (columnID: string) => {
        await db.todoColumnsDB.deleteTodoColumn(columnID);
        this.forceUpdate();
    }
}

