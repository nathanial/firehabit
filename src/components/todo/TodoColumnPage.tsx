import * as React from 'react';
import * as _ from 'lodash';
import TodoColumnView from "./TodoColumnView";
import cxs from 'cxs';
import { DragDropContext, Droppable, Draggable, DraggableProvided } from 'react-beautiful-dnd';

const todoColumnPageClass = cxs({
    display: 'block',
    'text-align': 'left',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '15px',
    bottom: 0,
    padding: '0',
    'white-space': 'nowrap'
});

const columnsContainerClass = cxs({
    width: '100%',
    height: '100%',
    'overflow-x': 'auto',
    padding: '0 20px'
});

type Props = {
    todoColumns: TodoColumn[];
    showDevTools: boolean;
}


function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const trans = list['transact']();
    const [removed] = trans.splice(startIndex, 1);
    trans.splice(endIndex, 0, removed);
    list['run']();
};

export default class TodoColumnPage extends React.PureComponent<Props> {
    render(){
        let {todoColumns, showDevTools} = this.props;
        todoColumns = _.sortBy(todoColumns, column => column.index);
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <div className={todoColumnPageClass}>
                    <div className={columnsContainerClass}>
                        {_.map(todoColumns, (column) => {
                            return (
                                <TodoColumnView key={column.id}
                                                column={column}
                                                onDeleteColumn={this.onDeleteColumn}
                                                onMoveColumnLeft={this.onMoveColumnLeft}
                                                onMoveColumnRight={this.onMoveColumnRight} />
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>
        );
    }

    onDeleteColumn = (column) => {
        this.props.todoColumns.splice(_.findIndex(this.props.todoColumns, c => c.id === column.id), 1);
    }

    private onDragEnd = (result) => {
        if (!result.destination) {
          return;
        }
        const todo = this.findTodoById(result.draggableId);
        const destinationColumn = _.find(this.props.todoColumns, {id: result.destination.droppableId});
        const sourceColumn = _.find(this.props.todoColumns, {id: result.source.droppableId});
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
    }


}
