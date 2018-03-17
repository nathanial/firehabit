import * as React from 'react'
import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import {generatePushID} from '../../db/util';
import * as BigCalendar from 'react-big-calendar'
import * as moment from 'moment';
import * as _ from 'lodash';

type Slot = {
    start: Date;
    end: Date;
}

type EventProps = {
    event: BigCalendarEvent;
};

type DragMode = 'top' | 'bottom' | 'center';

function roundToNearest(value: number, increment: number){
    return Math.round(value / increment) * increment;
}

class CustomEvent extends React.PureComponent<EventProps,{}>{
    private root: HTMLDivElement;
    private topDragger: HTMLDivElement;
    private bottomDragger: HTMLDivElement;
    private dragMode: DragMode;
    private startY: number;

    private startDate: Date;
    private endDate: Date;

    render(){
        const {event} = this.props;
        const top = this.getTop();
        const height = this.getHeight();
        const style: any = {
            position: 'absolute',
            top: `${top}%`,
            height: `${height}%`,
            width: '100%'
        };
        return (
            <div ref={this.setRootRef} className="custom-event" style={style}>
                <div className="top-dragger dragger" ref={this.setTopDraggerRef}>
                    <i className="pt-icon pt-icon-arrows-vertical"></i>
                </div>
                <div className="bottom-dragger dragger" ref={this.setBottomDraggerRef}>
                    <i className="pt-icon pt-icon-arrows-vertical"></i>
                </div>
            </div>
        );
    }

    private setRootRef = (root: HTMLDivElement) => {
        this.root = root;
        this.root.addEventListener('mousedown', this.onMouseDown, true);
    }

    private setTopDraggerRef = (dragger: HTMLDivElement) => {
        this.topDragger = dragger;
    }

    private setBottomDraggerRef = (dragger: HTMLDivElement) => {
        this.bottomDragger = dragger;
    }

    componentWillUnmount(){
        if(this.root){
            this.root.removeEventListener('mousedown', this.onMouseDown, true);
        }
    }

    private onMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.startY = event.pageY;
        this.startDate = this.props.event.start;
        this.endDate = this.props.event.end;
        const target = event.target as HTMLDivElement;
        if(this.isTopDragger(target)){
            this.dragMode = 'top';
        } else if(this.isBottomDragger(target)){
            this.dragMode = 'bottom';
        } else {
            this.dragMode = 'center';
        }
        this.addWindowListeners();
    }

    private onMouseMove = (event: MouseEvent) => {
        const deltaY = event.pageY - this.startY;
        const deltaMinutes = roundToNearest(deltaY * this.pixelsToMinutes, 30);
        if(this.dragMode === 'top'){
            let newStart = moment(this.startDate);
            newStart = newStart.add(deltaMinutes, 'minutes');
            this.props.event.set({start: newStart.toDate()});
        } else if(this.dragMode === 'bottom'){
            let newEnd = moment(this.endDate);
            newEnd = newEnd.add(deltaMinutes, 'minutes');
            this.props.event.set({end: newEnd.toDate()});
        } else {
            let newStart = moment(this.startDate);
            let newEnd = moment(this.endDate);
            newStart = newStart.add(deltaMinutes, 'minutes');
            newEnd = newEnd.add(deltaMinutes, 'minutes');
            this.props.event.set({
                start: newStart.toDate(),
                end: newEnd.toDate()
            });
        }
    }

    private get pixelsToPercentage(): number {
        const totalHeightInPixels = $(this.root.parentNode).height();
        return 1 / totalHeightInPixels;
    }

    private get pixelsToMinutes(){
        return this.pixelsToPercentage * (24 * 60);
    }

    private onMouseUp = (event: MouseEvent) => {
        this.dragMode = null;
        this.removeWindowListeners();
    }

    private addWindowListeners(){
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    private removeWindowListeners(){
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    private isTopDragger = (target: HTMLDivElement) => {
        const elements = [target, ..._.map($(target).parents(), p => p)]
        for(let element of elements){
            const classes = element.className.split(' ');
            if(_.includes(classes, 'top-dragger')){
                return true;
            }
        }
        return false;
    }

    private isBottomDragger = (target: HTMLDivElement) => {
        const elements = [target, ..._.map($(target).parents(), p => p)]
        for(let element of elements){
            const classes = element.className.split(' ');
            if(_.includes(classes, 'bottom-dragger')){
                return true;
            }
        }
        return false;
    }

    private getTop(){
        const event = this.props.event;
        const start = moment(event.start);
        const end = moment(event.end);
        const startTime = start.hours() * 60 + start.minutes();
        const total = 24 * 60;
        return (startTime / total) * 100;
    }

    private getHeight(){
        const event = this.props.event;
        const start = moment(event.start);
        const end = moment(event.end);
        const startTime = start.hours() * 60 + start.minutes();
        const endTime = end.hours() * 60 + end.minutes();
        const total = 24 * 60;
        return ((endTime - startTime) / total) * 100;
    }
}

type Props = {
    calendarEvents: BigCalendarEvent[];
}
export default class ScheduleCalendar extends React.PureComponent<Props,{}> {
    onSelectSlot = (slot: Slot) => {
        this.props.calendarEvents.push({
            id: generatePushID(),
            title: 'New Event',
            start: slot.start,
            end: slot.end
        });
    }

    render() {
        const components = {
            event: CustomEvent,
            eventWrapper: CustomEvent
        };
        return (
            <BigCalendar
            selectable
            events={this.props.calendarEvents}
            resizable
            defaultView="week"
            defaultDate={new Date()}
            onSelectSlot={this.onSelectSlot}
            components={components}
            />
        )
    }
}

