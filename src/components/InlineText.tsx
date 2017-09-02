import * as React from 'react';

type Props = {
    className?: string;
    value: string;
    editing: boolean;
    onChange(newValue: string);
    onStartEditing();
    onStopEditing();
}

export default class InlineText extends React.PureComponent<Props> {
    render(){
        const className = this.getClassName();
        return (
            <div className={className} onClick={this.onStartEditing}>
                {this.renderText()}
            </div>
        );
    }

    private renderText() {
        if(this.props.editing){
            return [
                <input className="pt-editable-input" type="text" style={{height: '18px', lineHeight: '18px', textAlign: 'center'}} value={this.props.value} onChange={this.onChange} />,
                <span className="pt-editable-content">{this.props.value}</span>
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
}