import * as React from 'react';
import * as _ from 'lodash';
import * as TextArea from 'react-textarea-autosize';

type Props = {
    className?: string;
    value: string;
    style?: Object;
    placeholder?: string;
    multiline?: boolean;
    editing: boolean;
    onChange(newValue: string);
    onStartEditing();
    onStopEditing();
}

export default class InlineText extends React.PureComponent<Props> {
    private root: HTMLElement;

    render(){
        const className = this.getClassName();
        const style = {} as any;
        _.extend(style, this.props.style || {});
        return (
            <div style={style} ref={root => this.root = root} className={className + " inline-text"} onClick={this.onStartEditing}>
                {this.props.multiline &&
                    <TextArea key="input"
                        type="text"
                        style={style}
                        value={this.props.value}
                        onKeyDown={this.onKeyDown}
                        onChange={this.onChange} />}
                {!this.props.multiline &&
                    <input key="input"
                        type="text"
                        style={style}
                        value={this.props.value}
                        onKeyDown={this.onKeyDown}
                        onChange={this.onChange} />}
            </div>
        );
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onMouseDown, true);
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.onMouseDown, true);
    }

    componentWillReceiveProps(nextProps: Props){
        // if(nextProps.editing && !this.props.editing){
        //     this.input.focus();
        //     this.input.setSelectionRange(0, this.props.value.length);
        // }
    }

    private onKeyDown = (event: any) => {
        if(this.props.editing && event.keyCode === 13){
            this.onStopEditing();
        }
    }

    private onMouseDown = (event: MouseEvent) => {
        if(this.props.editing){
            const parents = this.getParents(event.target as Node);
            const outside = !_.some(parents, p => p === this.root);
            if(outside){
                this.props.onStopEditing();
            }
        }
    }

    private renderText() {
        if(!this.props.editing){
            return (
                <p>{this.props.value}</p>
            );
        }
    }

    private getClassName(){
        let base = "";
        if(this.props.className){
            base += this.props.className;
        }
        if(this.props.editing){
            base += " editing";
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
