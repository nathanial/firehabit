import * as React from 'react';
import * as _ from 'lodash';
import TodoItem from "./TodoItem";

type Props = {
    todoColumns: TodoColumn[];
};

type State = {
    search: string;
};

type SearchProps = {
    search: string;
    onChange(value: string);
};

class SearchBar extends React.PureComponent<SearchProps> {
    render(){
        return (
            <div className={"search-bar"}>
                <input type={"text"} value={this.props.search} onChange={(event) => this.props.onChange(event.target.value)} />
            </div>
        );
    }
}

export default class TodoListView extends React.Component<Props, State> {

    state = {search: ""};

    render(){
        return (
            <div className={"todo-list-view"}>
                <SearchBar search={this.state.search} onChange={this.onSearchChanged} />
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
            (todo) => _.includes(todo.value.name.toLowerCase(), this.state.search.toLowerCase())
        );
        return allTodos.map(todo => {
            return <TodoItem todo={todo.value} color={todo.color} />;
        });
    }

    private onSearchChanged = (search: string) => {
        this.setState({search});
    }
}