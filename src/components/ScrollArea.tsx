import * as React from 'react';
import * as _ from 'lodash';
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
    right: '1px',
    width: '5px',
    top: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.2)',
});

const scrollHandleClass = cxs({
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    background: 'rgba(255,255,255,0.4)',
});

type Props = {
    className?: string;
}

type State = {
    hidden: boolean;
    scrollY: number;
    handleHeight: number;
    contentHeight: number;
    scrollHeight: number;
}

export default class ScrollArea extends React.Component<Props,State> {
    private root: HTMLElement;
    private content: HTMLElement;
    private handle: HTMLElement;
    private originalY: number;
    private startY: number;

    state = {
        scrollY: 0,
        hidden: true,
        handleHeight: 20,
        scrollHeight: 0,
        contentHeight: 0
    }

    render(){
        let className = this.props.className || '';
        className += ' ' + scrollAreaClass;

        let scrollY = this.state.scrollY || 0;
        console.log("SCROLL Y", scrollY, this.state.scrollHeight, this.state.contentHeight);
        scrollY *= this.state.scrollHeight;

        return (
            <div ref={root => this.root = root} className={className} onWheel={this.onWheel}>
                <div ref={content => this.content = content} className={scrollAreaContent} style={{transform: `translateY(${-scrollY}px)`}}>
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
            top: this.state.scrollY * this.state.contentHeight,
            height: `${this.state.handleHeight}px`
        };
        return (
            <div className={scrollBarClass} onMouseDown={this.onScrollbarMouseDown}>
                <div className={scrollHandleClass} 
                    style={handleStyle} 
                    onMouseDown={this.onHandleMouseDown}
                    ref={handle => this.handle = handle}>
                </div>
            </div>
        );
    }

    componentDidMount(){
        this.resizeHandle();
        this.content.scrollTop = this.state.scrollY;
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.children !== this.props.children){
            this.resizeHandle();
        }
    }

    private onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if(event.deltaY > 0){
            this.onScroll((this.state.scrollY || 0) + 0.03);
        } else {
            this.onScroll((this.state.scrollY || 0) - 0.03);
        }
    }

    private onScrollbarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        
        const rect = this.root.getBoundingClientRect();
        let newValue = event.pageY - rect.top;
        newValue -= this.state.handleHeight / 2;
        const percentage = newValue / (this.state.contentHeight - this.state.handleHeight);
        console.log("Percentage", percentage);
        this.onScroll(percentage);
    }

    private onHandleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        this.startY = event.pageY;
        this.originalY = this.state.scrollY;
        document.addEventListener('mousemove', this.onMouseMove, true);
        document.addEventListener('mouseup', this.onMouseUp, true);
    }

    private onMouseMove = (event: MouseEvent) => {
        this.onScroll(this.getPercentage(event));
    };

    private onMouseUp = () => {
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
    };

    private resizeHandle = () => {
        const rect = this.content.getBoundingClientRect();
        const scrollHeight = this.content.scrollHeight;
        const offsetHeight = rect.height;
        if(scrollHeight <= offsetHeight){
            this.setState({
                hidden: true,
                handleHeight: (offsetHeight / scrollHeight) * offsetHeight,
                contentHeight: offsetHeight,
                scrollHeight: scrollHeight
            });
        } else {
            this.setState({
                hidden: false,
                handleHeight: (offsetHeight / scrollHeight) * offsetHeight,
                contentHeight: offsetHeight,
                scrollHeight: scrollHeight
            });
        }
    };

    private onScroll = (newValue: number) => {
        console.log("On Scroll", newValue);
        if(newValue < 0){
            newValue = 0;
        }
        if(newValue > 1) {
            newValue = 1;
        }
        this.setState({
            scrollY: newValue
        });
    } 

    private getPercentage = (event: MouseEvent) => {
        let scrollPosition = event.pageY - this.startY;
        let percentage = scrollPosition / (this.state.contentHeight - this.state.handleHeight);
        console.log("Percentage", percentage, scrollPosition);
        return percentage;
    }
}