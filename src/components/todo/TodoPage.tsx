import * as React from 'react';
import * as _ from 'lodash';
import styled from 'styled-components';
import TodoColumnView from "./TodoColumnView";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import TodoTopbar from "./TodoTopbar";
import cxs from 'cxs';
import {DragAndDropLayer} from "../dnd/DragAndDropLayer";

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
}

export default class TodoPage extends React.Component<Props, {}> {
    render(){
        const {todoColumns} = this.props;
        console.log("Todo Columns", todoColumns);
        return (
            <div className={todoPageClass}>
                <TodoTopbar todoColumns={todoColumns} />
                <ColumnsContainer>
                    {_.map(todoColumns, (column) => {
                        console.log("Column", column);
                        return <TodoColumnView key={column.id} column={column} onDeleteColumn={this.onDeleteColumn} />
                    })}
                </ColumnsContainer>
                <DragAndDropLayer />
            </div>
        );
    }

    onDeleteColumn = (column) => {
        this.props.todoColumns.splice(_.findIndex(this.props.todoColumns, c => c.id === column.id), 1);
    }


}