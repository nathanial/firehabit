import * as React from 'react';
import * as _ from 'lodash';

type Props = {
    className?: string;
    value: string;
    style?: Object;
    editing: boolean;
    onChange(newValue: string);
    onStartEditing();
    onStopEditing();
}

export default class InlineText extends React.PureComponent<Props> {
    private root: HTMLElement;
    private input: HTMLInputElement;

    render(){
        const className = this.getClassName();
        const style = {} as any;
        const inputStyle = {
            opacity: 1,
            height: '18px',
            lineHeight: '18px',
            textAlign: 'center',
            position: 'relative'
        } as any;
        if(!this.props.editing){
            style.overflow = 'hidden';
            style.textOverflow = 'ellipsis';
            inputStyle.opacity = 0;
            inputStyle.width = 0;
        }
        _.extend(style, this.props.style || {});
        return (
            <div style={style} ref={root => this.root = root} className={className} onClick={this.onStartEditing}>
                <input style={inputStyle} 
                       ref={input => this.input = input} 
                       key="input" className="pt-editable-input" 
                       type="text"
                       value={this.props.value} 
                       onKeyDown={this.onKeyDown}
                       onChange={this.onChange} />
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

    componentWillReceiveProps(nextProps: Props){
        if(nextProps.editing){
            this.input.focus(); 
            this.input.setSelectionRange(0, this.props.value.length);
        }
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
                <span style={{marginLeft: '2px'}} className="pt-editable-content">{this.props.value}</span>
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