import * as React from 'react';
import cxs from 'cxs';

const scrollAreaClass = cxs({
    overflow: 'hidden'
});

type Props = {
    className?: string;
}

export default class ScrollArea extends React.PureComponent<Props,{}> {
    render(){
        let className = this.props.className || '';
        className += ' ' + scrollAreaClass;
        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }
}