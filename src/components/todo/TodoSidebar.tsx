import * as React from 'react';
import {Icon} from "@blueprintjs/core";

type Props = {

}

export default class TodoSidebar extends React.PureComponent<Props> {
    render(){
        return (
          <div className="todo-sidebar">
              <div className={"sidebar-button active"}>
                  <Icon iconName={"comparison"} />
              </div>
              <div className={"sidebar-button"}>
                <Icon iconName={"numbered-list"}/>
              </div>
          </div>
        )
    }
}