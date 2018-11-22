import * as React from 'react';
import {Icon} from "@blueprintjs/core";
import {TodoPageMode, TodoPageState} from "../../state";

type Props = {
    todoPageState: TodoPageState
}

export default class TodoSidebar extends React.PureComponent<Props> {
    render(){
        const selectedMode = this.props.todoPageState.mode
        return (
          <div className="todo-sidebar">
              <div className={"sidebar-button " + ((selectedMode == "column-view") ? "active" : "")} onClick={() => this.onSidebarButtonClicked("column-view")}>
                  <Icon icon={"comparison"} />
              </div>
              <div className={"sidebar-button " + ((selectedMode == "list-view") ? "active" : "")} onClick={() => this.onSidebarButtonClicked("list-view")}>
                <Icon icon={"numbered-list"}/>
              </div>
          </div>
        )
    }

    private onSidebarButtonClicked = (mode: TodoPageMode) => {
        this.props.todoPageState.set({mode})
    }
}