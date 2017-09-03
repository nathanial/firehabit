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
    background: 'rgba(255,255,255,0.2)'
});

const scrollHandleClass = cxs({
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    background: 'rgba(255,255,255,0.6)'
});

type Props = {
    className?: string;
    scrollY: number;
    onScroll(value: number);
}

type State = {
    hidden: boolean;
    handleHeight: number;
    contentHeight: number;
    scrollHeight: number;
}

export default class ScrollArea extends React.Component<Props,State> {
    private root: HTMLElement;
    private content: HTMLElement;
    private handle: HTMLElement;

    state = {
        hidden: true,
        handleHeight: 20,
        scrollHeight: 0,
        contentHeight: 0
    }

    render(){
        let className = this.props.className || '';
        className += ' ' + scrollAreaClass;
  
        return (
            <div ref={root => this.root = root} className={className}>
                <div ref={content => this.content = content} className={scrollAreaContent}>
                    {this.props.children}
                </div>
                {this.renderScrollbar()}
            </div>
        );
    }
    
    renderScrollbar(){
        if(this.state.hidden){
            return;
        }
        const handleStyle = {
            top: this.props.scrollY,
            height: `${this.state.handleHeight}px`
        };
        return (
            <div className={scrollBarClass} onMouseDown={this.onMouseDown}>
                <div className={scrollHandleClass} 
                    style={handleStyle} 
                    ref={handle => this.handle = handle}>
                </div>
            </div>
        );
    }

    componentDidMount(){
        this.resizeHandle();
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.children !== this.props.children){
            this.resizeHandle();
        }
    }

    private onMouseDown = (event) => {
        event.preventDefault();
        this.onMouseMove(event);
        document.addEventListener('mousemove', this.onMouseMove, true);
        document.addEventListener('mouseup', this.onMouseUp, true);
        return false;
    };

    private onMouseMove = (event: MouseEvent) => {
        const rect = this.root.getBoundingClientRect();
        let newValue = event.pageY - rect.top;
        if(newValue < 0){
            newValue = 0;
        }
        if(newValue > this.content.offsetHeight - this.state.handleHeight) {
            newValue = this.content.offsetHeight - this.state.handleHeight;
        }
        this.props.onScroll(newValue);
    };

    private onMouseUp = () => {
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
    };

    private resizeHandle = () => {
        const scrollHeight = this.content.scrollHeight;
        const offsetHeight = this.content.offsetHeight;
        if(scrollHeight <= offsetHeight){
            this.setState({
                hidden: true,
                handleHeight: (offsetHeight / scrollHeight) * offsetHeight,
                contentHeight: this.content.offsetHeight,
                scrollHeight: this.content.scrollHeight
            });
        } else {
            this.setState({
                hidden: false,
                handleHeight: (offsetHeight / scrollHeight) * offsetHeight,
                contentHeight: this.content.offsetHeight,
                scrollHeight: this.content.scrollHeight
            });
        }
    };
}