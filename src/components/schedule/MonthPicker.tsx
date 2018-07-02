import *  as React from 'react';

type Props = {
    value: String
}

export class MonthPicker extends React.PureComponent<Props, {}> {
    render(){
        const {value} = this.props;
        return (
            <div className="current-month">{value}</div>
        );
    }
}
