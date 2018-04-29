import * as React from 'react';
import * as _ from 'lodash';
import AutoTextArea from 'react-textarea-autosize';

console.log("Auto Text Area", AutoTextArea);

type Props = {
    className?: string;
    value: string;
    style?: Object;
    placeholder?: string;
    multiline?: boolean;
    editing?: boolean;
    disabled?: boolean;
    onChange(newValue: string);
    onStartEditing?();
    onStopEditing?();
}

export default class InlineText extends React.PureComponent<Props> {
    private root: HTMLElement;

    render(){
        const className = this.getClassName();
        const style = {} as any;
        _.extend(style, this.props.style || {});
        let outerStyle = {};
        if(this.props.multiline){
            outerStyle = {display: 'flex', flexDirection: 'column', justifyContent: 'center'};
        }
        return (
            <div style={{...style, ...outerStyle}} ref={root => this.root = root} className={className + " inline-text"} onClick={this.onStartEditing}>
                {this.renderContent(style)}
            </div>
        );
    }

    private renderContent(style){
        if(this.props.multiline){
            return (
                <AutoTextArea key="input"
                    disabled={this.props.disabled}
                    style={style}
                    value={this.props.value}
                    onKeyDown={this.onKeyDown}
                    onChange={this.onChange} />
            );
        } else {
            return (
                <input key="input"
                    type="text"
                    disabled={this.props.disabled}
                    style={style}
                    value={this.props.value}
                    onKeyDown={this.onKeyDown}
                    onChange={this.onChange} />
            );
        }
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

    private getRowCount(){
        let {value} = this.props;
        value = value || "";
        const length = value.length;
        const newlineRows = _.filter(value, v => v === '\n').length;
        return Math.max(Math.ceil(length / 32) + newlineRows, 1);
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
        if(this.props.onStartEditing){
            this.props.onStartEditing();
        }
    }

    private onStopEditing = () => {
        if(this.props.onStopEditing){
            this.props.onStopEditing();
        }
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
