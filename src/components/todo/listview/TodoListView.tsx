import * as React from 'react';
import * as _ from 'lodash';
import TodoItem from "./TodoItem";

type Props = {
    todoColumns: TodoColumn[];
    search: string;
};


export default class TodoListView extends React.PureComponent<Props> {

    render(){
        return (
            <div className={"todo-list-view"}>
                <div className={"todo-list-items"}>
                    {this.renderTodos()}
                </div>
            </div>
        );
    }

    private renderTodos() {
        const allTodos = _.filter(
            _.flatten(this.props.todoColumns.map(c => c.todos.map(todo => ({
                value: todo,
                color: c.color
            })))),
            (todo) => _.includes(todo.value.name.toLowerCase(), this.props.search.toLowerCase())
        );
        return allTodos.map(todo => {
            return <TodoItem todo={todo.value} color={todo.color} />;
        });
    }
}