import * as React from 'react';
import * as _ from 'lodash';

type Props = {
    todo: Todo;
    color: string;
};

export default class TodoItem extends React.PureComponent<Props> {
    render(){
        return (
            <div className={"todo-item"} style={{background: this.props.color}}>
                {this.props.todo.name}
            </div>
        );
    }
}