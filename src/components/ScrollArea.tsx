import * as React from 'react';
import cxs from 'cxs';

const scrollAreaClass = cxs({
    overflow: 'hidden'
});

const scrollAreaContent = cxs({
    position: 'absolute',
    left: 0,
    top: 0,
    right: '20px',
    bottom: 0
});

const scrollBarClass = cxs({
    position: 'absolute',
    right: 0,
    width: '10px',
    top: 0,
    bottom: 0,
    background: 'red'
});

const scrollHandleClass = cxs({
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: '20px',
    background: 'yellow'
});

type Props = {
    className?: string;
    scrollY: number;
    onScroll(value: number);
}

export default class ScrollArea extends React.PureComponent<Props,{}> {
    private root: HTMLElement;

    render(){
        let className = this.props.className || '';
        className += ' ' + scrollAreaClass;
        const handleStyle = {
            top: this.props.scrollY
        };
        return (
            <div ref={root => this.root = root} className={className}>
                <div className={scrollAreaContent}>
                    {this.props.children}
                </div>
                <div className={scrollBarClass}>
                    <div className={scrollHandleClass} 
                         style={handleStyle} 
                         onMouseDown={this.onMouseDown}>
                    </div>
                </div>
            </div>
        );
    }

    private onMouseDown = () => {
        document.addEventListener('mousemove', this.onMouseMove, true);
        document.addEventListener('mouseup', this.onMouseUp, true);
    };

    private onMouseMove = (event: MouseEvent) => {
        const rect = this.root.getBoundingClientRect();
        let newValue = event.pageY - rect.top - 10;
        if(newValue < 0){
            newValue = 0;
        }
        this.props.onScroll(newValue);
    };

    private onMouseUp = () => {
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
    };
}