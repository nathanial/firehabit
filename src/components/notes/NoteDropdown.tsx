import * as React from 'react';
import * as _ from 'lodash';

type DropdownProps = {
    selected: any;
    items: any[];
    className?: string;
    onChange(item: any);
}

type DropdownState = {
    open: boolean
}


export class Dropdown extends React.Component<DropdownProps,DropdownState> {
    state = {
        open: false
    }
    render(){
        const classes = ["note-dropdown"];
        if(this.props.className){
            classes.push(this.props.className);
        }
        if(this.state.open){
            classes.push('open');
        }
        return (
            <div className={classes.join(' ')}>
                {this.renderSelected()}
                <div className="dropdown">
                    {this.renderDropdown()}
                </div>
            </div>
        );
    }

    private onClick = () => {
        this.setState({open: !this.state.open});
    }

    private renderSelected(){
        if(this.state.open){
            return;
        }
        return (
            <div className="selected-item" onMouseDown={this.onClick}>
                {this.props.selected}
            </div>
        );
    }

    private renderDropdown(){
        let results = [];
        const close = () => {
            this.setState({open: false});
        };
        results.push(
            <div key="selected-item" className="selected item" onClick={close}>{this.props.selected}</div>
        );
        results = results.concat(_.compact(_.map(this.props.items, (item) => {
            const classes = ["item"];
            if(item === this.props.selected){
                return;
            }
            return (
                <div key={item} className={classes.join(' ')} onClick={() => this.onClickItem(item)}>{item}</div>
            );
        })));
        return results;
    }

    private onClickItem = (item: string) => {
        this.props.onChange(item);
        this.setState({open: false});
    }
}
