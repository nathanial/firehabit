import * as React from 'react';
import {Icon} from "@blueprintjs/core";

type Props = {

}

export default class TodoSidebar extends React.PureComponent<Props> {
    render(){
        return (
          <div className="todo-sidebar">
              <div className={"sidebar-button active"} onClick={() => this.onSidebarButtonClicked("column-view")}>
                  <Icon iconName={"comparison"} />
              </div>
              <div className={"sidebar-button"} onClick={() => this.onSidebarButtonClicked("list-view")}>
                <Icon iconName={"numbered-list"}/>
              </div>
          </div>
        )
    }

    private onSidebarButtonClicked = (button: string) => {
        console.log("Sidebar Button", button);
    }
}