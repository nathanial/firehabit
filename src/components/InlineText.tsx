import * as React from 'react';
import * as _ from 'lodash';

type Props = {
    className?: string;
    value: string;
    editing: boolean;
    onChange(newValue: string);
    onStartEditing();
    onStopEditing();
}

export default class InlineText extends React.PureComponent<Props> {
    private root: HTMLElement;

    render(){
        const className = this.getClassName();
        return (
            <div ref={root => this.root = root} className={className} onClick={this.onStartEditing}>
                {this.renderText()}
            </div>
        );
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onMouseDown, true);
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.onMouseDown, true);
    }

    private onMouseDown = (event: MouseEvent) => {
        if(!this.props.editing){
            return;
        }
        const parents = this.getParents(event.target as Node);
        const inside = _.some(parents, p => p === this.root);
        if(!inside){
            this.props.onStopEditing();
        }
    }

    private renderText() {
        if(this.props.editing){
            return [
                <input key="input" className="pt-editable-input" type="text" style={{height: '18px', lineHeight: '18px', textAlign: 'center'}} value={this.props.value} onChange={this.onChange} />,
                <span key="span" className="pt-editable-content">{this.props.value}</span>
            ];
        } else {
            return (
                <span>{this.props.value}</span>
            );
        }
    }

    private getClassName(){
        let base = "pt-editable-text";
        if(this.props.className){
            base += " " + this.props.className;
        }
        if(this.props.editing){
            base += " pt-editable-editing";
        }
        return base;
    }

    private onChange = (event) => {
        this.props.onChange(event.target.value);
    }

    private onStartEditing = () => {
        this.props.onStartEditing();
    }

    private onStopEditing = () => {
        this.props.onStopEditing();
    }

    private getParents = (a: Node) => {
        let els = [];
        while (a) {
            els.unshift(a);
            a = a.parentNode;
        }
        return els;
    }
}