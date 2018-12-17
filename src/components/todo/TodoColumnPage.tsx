import * as React from 'react';
import * as _ from 'lodash';
import TodoColumnView from "./TodoColumnView";
import cxs from 'cxs';
import { DragDropContext } from 'react-beautiful-dnd';
import TodoSidebar from './TodoSidebar';
import {TodoPageState} from "../../state";
import TodoListView from "./listview/TodoListView";
import TodoPageView from "./TodoPageView";

const todoColumnPageClass = cxs({
    display: 'flex',
    'text-align': 'left',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: '0',
    'white-space': 'nowrap'
});

const columnsContainerClass = cxs({
    display: 'flex',
    height: '100%',
    'overflow-x': 'auto',
    padding: '0px 20px 20px 20px'
});

type Props = {
    search: string;
    todoColumns: TodoColumn[];
    todoPageState: TodoPageState;
    showDevTools: boolean;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const trans = list['transact']();
    const [removed] = trans.splice(startIndex, 1);
    trans.splice(endIndex, 0, removed);
    list['run']();
}

export default class TodoColumnPage extends React.PureComponent<Props> {
    render(){
        let {todoPageState} = this.props;
        return (
            <div className={"todo-column-page " + todoColumnPageClass}>
                <TodoSidebar todoPageState={todoPageState} />
                <div className="todo-column-page-content">
                    {this.renderContent()}
                </div>
            </div>
        );
    }

    private renderContent(){
        let {search, todoColumns} = this.props
        todoColumns = _.sortBy(todoColumns, column => column.index);
        if(this.props.todoPageState.mode == "todo-page-view"){
            const todo = this.findTodoById(this.props.todoPageState.todoId);
            return (
              <TodoPageView todo={todo} onGoBack={this.onBackToColumnView} />
            );
        } else if(this.props.todoPageState.mode == "column-view"){
            return (
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <div className={columnsContainerClass}>
                        {_.map(todoColumns, (column) => {
                            return (
                                <TodoColumnView key={column.id}
                                                column={column}
                                                search={search}
                                                onDeleteColumn={this.onDeleteColumn}
                                                onMoveColumnLeft={this.onMoveColumnLeft}
                                                onMoveColumnRight={this.onMoveColumnRight}
                                                onGotoPage={this.onGotoPage} />
                            );
                        })}
                    </div>
                </DragDropContext>
            )
        } else {
            return (
                <TodoListView search={search} todoColumns={todoColumns}/>
            );
        }
    }

    onDeleteColumn = (column) => {
        this.props.todoColumns.splice(_.findIndex(this.props.todoColumns, c => c.id === column.id), 1);
    }

    private onDragEnd = (result) => {
        if (!result.destination) {
          return;
        }
        const todo = this.findTodoById(result.draggableId);
        const destinationColumn = _.find(this.props.todoColumns, {id: result.destination.droppableId}) as TodoColumn;
        const sourceColumn = _.find(this.props.todoColumns, {id: result.source.droppableId}) as TodoColumn;
        if(destinationColumn === sourceColumn) { //re-order
            reorder(sourceColumn.todos, result.source.index, result.destination.index);
        } else {
            sourceColumn.todos.splice(result.source.index, 1);
            destinationColumn.todos.splice(result.destination.index, 0, JSON.parse(JSON.stringify(todo)));
        }
    }

    private findTodoById(id: string): Todo {
        for(let column of (this.props.todoColumns || [])){
            for(let todo of (column.todos || [])){
                if(todo.id === id){
                    return todo;
                }
            }
        }
        throw new Error('Could not find todo');
    }

    private onMoveColumnLeft = (column: TodoColumn) => {
        const sortedColumns = _.sortBy(this.props.todoColumns, c => c.index);
        const index = sortedColumns.indexOf(column);
        if(index === -1){
            throw new Error(`Column Not Found`);
        }
        const nextColumn = sortedColumns[index-1];
        if(nextColumn){
            const oldIndex = column.index;
            column.set({index: nextColumn.index});
            nextColumn.set({index: oldIndex});
        }
    }

    private onMoveColumnRight = (column: TodoColumn) => {
        const sortedColumns = _.sortBy(this.props.todoColumns, c => c.index);
        const index = sortedColumns.indexOf(column);
        if(index === -1){
            throw new Error(`Column Not Found`);
        }
        const nextColumn = sortedColumns[index+1];
        if(nextColumn){
            const oldIndex = column.index;
            column.set({index: nextColumn.index});
            nextColumn.set({index: oldIndex});
        }
    };

    private onGotoPage = (page: Todo) => {
        this.props.todoPageState.set({
            mode: "todo-page-view",
            todoId: page.id
        });
    };

    private onBackToColumnView = () => {
        this.props.todoPageState.set({mode: 'column-view'});
    }

}
