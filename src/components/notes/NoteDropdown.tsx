import * as React from 'react';
import * as _ from 'lodash';
import * as $ from 'jquery';

export type ValueItem = {
    value: string;
    name: string;
}
type DropdownProps = {
    selected: ValueItem;
    items: ValueItem[];
    className?: string;
    onChange(item: ValueItem);
}

type DropdownState = {
    open: boolean
}

class DropdownItem extends React.PureComponent<{className: string, onClick()},{}> {
    private itemRef;
    render(){
        return (
            <div ref={r => this.itemRef = r} className={this.props.className}>
                {this.props.children}
            </div>
        );
    }

    componentDidMount(){
        this.itemRef.addEventListener('mousedown', this.onMouseDown, true);
    }

    componentWillUnmount(){
        this.itemRef.removeEventListener('mousedown', this.onMouseDown, true)
    }

    private onMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.onClick();
    }
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
        const isOpen = !this.state.open;
        this.setState({open: isOpen});
    }

    componentDidUpdate(){
        if(this.state.open){
            document.addEventListener('mousedown', this.onOuterMouseDown);
        } else {
            document.removeEventListener('mousedown', this.onOuterMouseDown);
        }
    }

    private onOuterMouseDown = () => {
        const noteDropdown = (
            $(event.target).hasClass('note-dropdown') ||
            $(event.target).parents('.note-dropdown').length > 0
        );
        if(noteDropdown){
            return;
        }

        this.setState({open: false});
    }

    private renderSelected(){
        if(this.state.open){
            return;
        }
        const name = _.get(this.props, 'selected.name', 'unknown');
        return (
            <DropdownItem className="selected-item" onClick={this.onClick}>
                {name}
            </DropdownItem>
        );
    }

    private renderDropdown(){
        let results = [];
        const close = () => {
            this.setState({open: false});
        };
        results = results.concat(_.compact(_.map(this.props.items, (item) => {
            const classes = ["item"];
            if(item === this.props.selected){
                classes.push('selected-item');
            }
            return (
                <DropdownItem key={item.value} className={classes.join(' ')} onClick={() => this.onClickItem(item)}>{item.name}</DropdownItem>
            );
        })));
        return results;
    }

    private onClickItem = (item: ValueItem) => {
        this.props.onChange(item);
        this.setState({open: false});
    }
}
