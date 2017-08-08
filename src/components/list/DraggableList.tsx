import * as React from 'react';
import * as _ from 'lodash';
import cxs from 'cxs';

interface ListItem<T> {
    id: string;
    data: T;
}

type Props<T> = {
}

type State<T> = {
}

type ItemProps<T> = {
}

const draggableListClass = cxs({

});

class DraggableItem<T> extends React.PureComponent<ItemProps<T>> {
    render(){
        return (
            <div>Draggable</div>
        );
    }
}

export default class DraggableList<T> extends React.Component<Props<T>,State<T>> {

    state = {
    }

    render(){
        const children = React.Children.map(this.props.children, child => {
            return (
                <DraggableItem>
                    {child}
                </DraggableItem>
            );
        });
        return (
            <div className={draggableListClass}>
                {children}
            </div>
        );
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            tempItems: _.clone(nextProps.items)
        });
    }
}